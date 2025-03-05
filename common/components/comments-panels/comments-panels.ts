import {LitElement, html, TemplateResult, CSSResultArray, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './comments-list/comments-list';
import './messages-panel/messages-panel';
import {CommentPanelsStyles} from './common-comments.styles';
import {GDDCommentsCollection} from '../comments/comments.reducer';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../types/store.types';
import {GDDExpectedResult, GDDActivity, GDDComment, GDDResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {GDDCommentItemData, GDDCommentRelatedItem, GDDCommentsEndpoints} from '../comments/comments-types';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {buildUrlQueryString} from '@unicef-polymer/etools-utils/dist/general.util';
import {GDDComponentsPosition} from '../comments/comments-items-name-map';
import {removeTrailingIds} from '../comments/comments.helpers';
import {currentIntervention} from '../../selectors';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {gddEndpoints} from '../../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';

@customElement('gdd-comments-panels')
export class GDDCommentsPanels extends connectStore(LitElement) {
  @property() messagesOpened = false;
  @property() commentsCollection?: GDDCommentsCollection;
  @property() comments: GDDComment[] = [];
  @property() minimized = false;

  interventionId?: number;
  endpoints?: GDDCommentsEndpoints;
  openedCollection: GDDCommentItemData | null = null;
  relatedItems?: GDDCommentRelatedItem[] = [];

  protected render(): TemplateResult {
    return html`
      <gdd-comments-list
        @show-messages="${(event: CustomEvent) => this.openCollection(event.detail.commentsGroup)}"
        @close-comments-panels="${this.closePanels}"
        @toggle-minimize="${this.toggleMinimize}"
        .selectedGroup="${this.openedCollection?.relatedTo}"
        .commentsCollection="${this.commentsCollection}"
        .relatedItems="${this.relatedItems}"
      ></gdd-comments-list>
      <gdd-messages-panel
        class="${this.openedCollection ? 'opened' : ''}"
        .relatedItem="${this.openedCollection?.relatedItem}"
        .relatedTo="${this.openedCollection?.relatedTo}"
        .collectionId="${this.openedCollection?.relatedTo}"
        .relatedToKey="${this.openedCollection?.relatedToTranslateKey}"
        .relatedToDescription="${this.openedCollection?.relatedToDescription}"
        .comments="${this.comments}"
        .interventionId="${this.interventionId}"
        .endpoints="${this.endpoints}"
        @hide-messages="${() => this.closeCollection()}"
      ></gdd-messages-panel>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.closeCollection();
  }

  mapToOpjectType(array: any[], type: string): GDDCommentRelatedItem[] {
    return array.map(({id, code, name}: any) => ({
      type,
      id: id,
      name: name,
      code: code
    }));
  }

  stateChanged(state: RootState): void {
    const commentsState = state.gddCommentsData;
    const currentInterventionId =
      Number(state.app.routeDetails?.params?.interventionId) || state.gddInterventions?.current?.id || null;
    if (!commentsState || !currentInterventionId) {
      return;
    }

    this.interventionId = currentInterventionId;
    this.endpoints = state.gddCommentsData.endpoints;
    const {collection} = commentsState;
    this.commentsCollection = {...(collection[currentInterventionId] || {})};
    if (this.openedCollection) {
      this.comments = [...this.commentsCollection![this.openedCollection.relatedTo]];
    }

    // Request result link in order to obtain the new title and the section code
    // in order to display inside comments list and inside dialog title
    const intervention = currentIntervention(state);
    if (intervention) {
      sendRequest({
        endpoint: getEndpoint(gddEndpoints.resultLinksDetails, {id: intervention.id})
      }).then((response: any) => {
        const pds = response?.result_links.map(({gdd_key_interventions: pds}: GDDExpectedResult) => pds).flat();
        const activities = pds.map(({activities}: GDDResultLinkLowerResult) => activities).flat();
        const activity_items = activities.map(({items}: GDDActivity) => items).flat();

        this.relatedItems = [
          ...this.mapToOpjectType(pds, 'key-intervention'),
          ...this.mapToOpjectType(activities, 'activity'),
          ...this.mapToOpjectType(activity_items, 'activity-item')
        ];

        this.requestUpdate();
      });
    }
  }

  openCollection(commentsGroup: GDDCommentItemData) {
    this.openedCollection = commentsGroup;
    this.comments = [...this.commentsCollection![this.openedCollection.relatedTo]];
    const relatedToKey: string = removeTrailingIds(this.openedCollection.relatedTo);
    const expectedTab: string = GDDComponentsPosition[relatedToKey];
    const path = `gpd-interventions/${this.interventionId}/${expectedTab}${location.search}`;
    history.pushState(window.history.state, '', path);
    window.dispatchEvent(new CustomEvent('popstate'));
    this.slideToRight();
  }

  // Will slide comments list panel to right if not enough
  // space on the left side to open the message panel.
  slideToRight() {
    // Disable slide for screens with width less then 880px
    if (window.innerWidth < 880) {
      return;
    }

    const messagePanelWidth = 440;
    const pixelsToMove = 15;

    if (this.offsetLeft >= messagePanelWidth) {
      return;
    }

    let left = this.offsetLeft;
    const animationInterval = setInterval(() => {
      left += pixelsToMove;
      if (left >= messagePanelWidth) {
        left = messagePanelWidth;
      }
      this.style.left = left + 'px';

      if (left == messagePanelWidth) {
        clearInterval(animationInterval);
      }
    }, 0);
  }

  closeCollection(): void {
    this.openedCollection = null;
    this.comments = [];
  }

  closePanels(): void {
    const routeDetails = getStore().getState().app.routeDetails;
    const queryParams = {...(routeDetails!.queryParams || {})};
    delete queryParams['comment_mode'];
    const stringParams: string = buildUrlQueryString(queryParams);
    const path: string = routeDetails!.path + (stringParams !== '' ? `?${stringParams}` : '');
    history.pushState(window.history.state, '', path);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  toggleMinimize(): void {
    this.minimized = !this.minimized;
    if (this.minimized) {
      this.dataset.minimized = '';
      this.closeCollection();
    } else {
      delete this.dataset.minimized;
    }
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      CommentPanelsStyles,
      css`
        :host {
          display: block;
          position: fixed;
          top: 150px;
          right: 18px;
          z-index: 99;
          width: calc(100% - 36px);
          height: 550px;
          max-height: calc(100vh - 150px);
          max-width: 450px;
        }

        :host([data-minimized]),
        :host([data-minimized]) gdd-messages-panel,
        :host([data-minimized]) gdd-comments-list {
          height: 64px;
        }
      `
    ];
  }
}
