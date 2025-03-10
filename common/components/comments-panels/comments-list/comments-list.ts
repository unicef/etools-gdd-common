import {LitElement, html, TemplateResult, CSSResultArray} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {CommentPanelsStyles} from '../common-comments.styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import './comments-group';
import './comments-panel-header';
import {GDDCommentsCollection} from '../../comments/comments.reducer';
import {GDDCommentsDescription, GDDCommentsItemsNameMap} from '../../comments/comments-items-name-map';
import {extractId, removeTrailingIds} from '../../comments/comments.helpers';
import {GDDCommentItemData, GDDCommentRelatedItem} from '../../comments/comments-types';
import {EtoolsTextarea} from '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

@customElement('gdd-comments-list')
export class GDDCommentsList extends LitElement {
  @property() selectedGroup: string | null = null;
  @property() relatedItems: GDDCommentRelatedItem[] = [];

  set commentsCollection(collection: GDDCommentsCollection) {
    this.commentsGroups = Object.entries(collection || {}).map(([relatedTo, comments]) => {
      const relatedToKey: string = removeTrailingIds(relatedTo);
      const relatedToId = extractId(relatedTo);
      const relatedItem = this.relatedItems?.find((x) => x.type === relatedToKey && x.id.toString() === relatedToId);
      const relatedToTranslateKey = GDDCommentsItemsNameMap[relatedToKey];
      const commentWithDescription = comments.find(({related_to_description}) => related_to_description);
      const relatedToDescription = commentWithDescription?.related_to_description || '';
      const fieldDescription = GDDCommentsDescription[relatedToKey] || GDDCommentsDescription[relatedTo] || null;

      return {
        relatedItem,
        relatedToTranslateKey,
        relatedToDescription,
        fieldDescription,
        relatedTo,
        count: comments.length,
        lastCreatedMessageDate: (comments[comments.length - 1] as any).created
      };
    });
    this.requestUpdate();
  }

  commentsGroups: GDDCommentItemData[] = [];

  protected render(): TemplateResult {
    return html`
      <gdd-comments-panel-header .count="${this.commentsGroups.length}"></gdd-comments-panel-header>
      <div class="data-container">
        ${this.commentsGroups.map((group) => {
          return html`
            <gdd-comments-group
              ?opened="${group.relatedTo === this.selectedGroup}"
              .relatedItem="${group.relatedItem}"
              .relatedTo="${group.relatedToTranslateKey}"
              .relatedToDescription="${group.relatedToDescription}"
              .fieldDescription="${group.fieldDescription}"
              .commentsCount="${group.count}"
              .lastCreatedMessageDate="${group.lastCreatedMessageDate}"
              tabindex="0"
              @click="${() => this.showMessages(group)}"
              @keyup="${(event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  this.showMessages(group);
                  const commentsPanelElement = document.querySelector('gdd-comments-panels');
                  const messagesPanelElement = commentsPanelElement?.shadowRoot?.querySelector('gdd-messages-panel');
                  (messagesPanelElement?.shadowRoot?.querySelector('etools-textarea') as EtoolsTextarea)?.focus();
                }
              }}"
            ></gdd-comments-group>
          `;
        })}
      </div>
    `;
  }

  showMessages(commentsGroup: GDDCommentItemData): void {
    fireEvent(this, 'show-messages', {commentsGroup});
  }

  static get styles(): CSSResultArray {
    // language=css
    return [CommentPanelsStyles];
  }
}
