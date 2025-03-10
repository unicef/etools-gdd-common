import {LitElement, html, TemplateResult, CSSResultArray, css} from 'lit';
import {property, customElement, queryAll} from 'lit/decorators.js';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import './modals/activity-dialog/activity-data-dialog';
import '../time-intervals/time-intervals';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {GDDActivity, GDDQuarter} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../utils/intervention-labels-map';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {ActivitiesAndIndicatorsStyles} from './styles/ativities-and-indicators.styles';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-row';
import {TruncateMixin} from '../../common/mixins/truncate.mixin';
import {
  openActivityDeactivationDialog,
  openDeleteActivityDialog,
  _canDeactivate,
  _canDelete
} from '../../common/mixins/results-structure-common';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query.js';

@customElement('gdd-pd-activities')
export class GDDPdActivities extends CommentsMixin(TruncateMixin(LitElement)) {
  @property({type: String})
  currency = '';

  @property({type: Array})
  activities: GDDActivity[] = [];

  @property({type: Boolean})
  readonly!: boolean;

  @property({type: Boolean})
  inAmendment!: boolean;

  @property({type: String})
  inAmendmentDate!: string;

  @property({type: String})
  flatLocations: any[] = [];

  @property({type: String})
  interventionStatus!: string;

  @property({type: Boolean}) showInactive!: boolean;

  @property({type: Number})
  ewpKeyIntervention!: number;

  @property({type: Number})
  interventionId!: number;

  @property({type: Number})
  keyInterventionId!: number;

  @property({type: Number})
  partnerId!: number;

  quarters!: GDDQuarter[];

  protected render(): TemplateResult {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        div[lowresolutionlayout] {
          flex-direction: column;
        }
        div[lowresolutionlayout] > .secondary-cell {
          max-width: 100%;
        }
        .cellLabel {
          width: 40%;
          text-align: left;
        }
        .word-break {
          word-break: break-word;
        }
        #iit-dfp {
          --iit-margin: 0 0 4px 4px;
        }
      </style>

      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-data-table-row .detailsOpened="${true}" id="activitiesRow">
        <div slot="row-data" class="layout-horizontal align-items-center editable-row start-justified">
          <div class="title-text">${translate(gddTranslatesMap.activities)} (${this.activities.length})</div>
        </div>
        <div slot="row-data-details">
          <div
            class="table-row table-head align-items-center"
            ?hidden="${isEmptyObject(this.activities) || this.lowResolutionLayout}"
          >
            <div class="left-align layout-vertical">${translate('ACTIVITY_NAME')}</div>
            <div class="secondary-cell center">${translate('TIME_PERIODS')}</div>
            <div class="secondary-cell right">${translate('GENERAL.TOTAL')} (${this.currency})</div>
          </div>

          ${this.activities.length
            ? this.activities.map(
                (activity: GDDActivity, index: number) => html`
                  <div
                    class="table-row editable-row"
                    related-to="activity-${activity.id}"
                    related-to-description="${activity.name}"
                    ?lowResolutionLayout="${this.lowResolutionLayout}"
                    comments-container
                    ?hidden="${this._hideActivity(activity, this.showInactive)}"
                    @sl-show="${(event: CustomEvent) => {
                      (event.currentTarget as HTMLElement)!.classList.add('active');
                    }}"
                    @sl-hide="${(event: CustomEvent) =>
                      (event.currentTarget as HTMLElement)!.classList.remove('active')}"
                  >
                    <!--    Activity Data: code / name / other info / items link    -->
                    <div class="left-align layout-horizontal">
                      <div class="layout-horizontal w100">
                        ${this.lowResolutionLayout
                          ? html`<div class="cellLabel">${translate('ACTIVITY_NAME')}</div>`
                          : ``}
                        <div class="layout-horizontal">
                          <b>${activity.code}&nbsp;</b>
                          <div class="word-break">
                            <div>
                              <b
                                >${activity.is_active ? '' : html`(<u>${translate('INACTIVE')}</u>) `}${activity.name ||
                                '-'}</b
                              >
                              <info-icon-tooltip
                                ?hidden="${!this.activityHasDifferentPartnerThanGpd(activity)}"
                                id="iit-dfp"
                                .tooltipText="${translate('DIFFERENT_PARTNER_INVOLVED')}"
                              >
                              </info-icon-tooltip>
                            </div>
                            <div class="details word-break" ?hidden="${!activity.context_details}">
                              ${this.truncateString(activity.context_details)}
                            </div>
                          </div>
                          <div
                            class="item-link"
                            ?hidden="${!activity.items?.length}"
                            @click="${() => this.openDialog(activity, this.readonly)}"
                          >
                            (${activity.items?.length}) items
                          </div>
                        </div>
                      </div>
                    </div>

                    <!--    Time intervals    -->
                    <div class="secondary-cell center">
                      ${this.lowResolutionLayout
                        ? html`<div class="layout-horizontal w100">
                            <div class="cellLabel">${translate('TIME_PERIODS')}</div>
                            <div>
                              <gdd-time-intervals
                                .quarters="${this.quarters}"
                                .selectedTimeFrames="${activity.time_frames}"
                                without-popup
                              >
                              </gdd-time-intervals>
                            </div>
                          </div>`
                        : html` <gdd-time-intervals
                            .quarters="${this.quarters}"
                            .selectedTimeFrames="${activity.time_frames}"
                          ></gdd-time-intervals>`}
                    </div>

                    <!--    Total    -->
                    <div class="secondary-cell right">
                      <!--       TODO: use field from backend         -->
                      ${this.lowResolutionLayout
                        ? html` <div class="layout-horizontal w100">
                            <div class="cellLabel">${translate('GENERAL.TOTAL')}</div>
                            <div>
                              <b>
                                ${displayCurrencyAmount(
                                  String(this.getTotal(activity.cso_cash, activity.unicef_cash)),
                                  '0',
                                  2
                                )}
                              </b>
                              <div></div>
                            </div>
                          </div>`
                        : html`${displayCurrencyAmount(
                            String(this.getTotal(activity.cso_cash, activity.unicef_cash)),
                            '0',
                            2
                          )}`}
                    </div>

                    <div class="show-actions hover-block" style="z-index: ${99 - index}" ?hidden="${this.commentMode}">
                      <sl-dropdown distance="-40" id="view-menu-button">
                        <etools-icon-button slot="trigger" name="more-vert" tabindex="0"></etools-icon-button>
                        <sl-menu>
                          <sl-menu-item
                            class="action"
                            @click="${() => this.openDialog(activity, this.readonly || !activity.is_active)}"
                          >
                            <etools-icon
                              slot="prefix"
                              name="${this.readonly || !activity.is_active ? 'visibility' : 'create'}"
                            ></etools-icon>
                            ${this.readonly || !activity.is_active ? translate('VIEW') : translate('EDIT')}
                          </sl-menu-item>
                          <sl-menu-item
                            class="action"
                            ?hidden="${!_canDeactivate(
                              activity,
                              this.readonly,
                              this.interventionStatus,
                              this.inAmendment,
                              this.inAmendmentDate
                            )}"
                            @click="${() =>
                              openActivityDeactivationDialog(activity.id, this.keyInterventionId, this.interventionId)}"
                          >
                            <etools-icon slot="prefix" name="block"></etools-icon>
                            ${translate('DEACTIVATE')}
                          </sl-menu-item>
                          <sl-menu-item
                            class="action delete-action"
                            ?hidden="${!_canDelete(
                              activity,
                              this.readonly,
                              this.interventionStatus,
                              this.inAmendment,
                              this.inAmendmentDate
                            )}"
                            @click="${() =>
                              openDeleteActivityDialog(activity.id, this.keyInterventionId, this.interventionId)}"
                          >
                            <etools-icon slot="prefix" name="delete"></etools-icon>
                            ${translate('DELETE')}
                          </sl-menu-item>
                        </sl-menu>
                      </sl-dropdown>
                    </div>
                  </div>
                `
              )
            : html` <div class="table-row empty center-align">${translate('THERE_ARE_NO_WORKPLAN_ACTIVITIES')}</div> `}
        </div>
      </etools-data-table-row>
    `;
  }

  @queryAll('#view-menu-button')
  actionsMenuBtns!: SlDropdown[];

  @property({type: Boolean})
  lowResolutionLayout = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.closeMenusOnScroll = this.closeMenusOnScroll.bind(this);
    this.getScrollableArea().addEventListener('scroll', this.closeMenusOnScroll, false);
  }

  // Scroll happens on this area, not on window
  getScrollableArea() {
    return document!
      .querySelector('app-shell')!
      .shadowRoot!.querySelector('#appHeadLayout')!
      .shadowRoot!.querySelector('#contentContainer')!;
  }

  closeMenusOnScroll() {
    this.actionsMenuBtns.forEach((p) => (p.open = false));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.getScrollableArea().removeEventListener('scroll', this.closeMenusOnScroll, false);
  }

  _hideActivity(activity: any, showInactive: boolean) {
    if (!activity.is_active) {
      return !showInactive;
    }
    return false;
  }

  getSpecialElements(element: HTMLElement): CommentElementMeta[] {
    const relatedTo: string = element.getAttribute('related-to') as string;
    const relatedToDescription = element.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }

  getTotal(partner: string, unicef: string): number {
    return (Number(partner) || 0) + (Number(unicef) || 0);
  }

  openAllRows(): void {
    const row: EtoolsDataTableRow = this.shadowRoot!.querySelector('etools-data-table-row') as EtoolsDataTableRow;
    row.detailsOpened = true;
  }

  activityHasDifferentPartnerThanGpd(activity?: GDDActivity) {
    const partners = activity?.ewp_activity?.partners;
    if (!partners) {
      return false;
    }
    return partners.length && (partners.length > 1 || !partners.includes(Number(this.partnerId)));
  }

  openDialog(activity?: GDDActivity, readonly?: boolean): void {
    openDialog<any>({
      dialog: 'gdd-activity-data-dialog',
      dialogData: {
        activityId: activity && activity.id,
        interventionId: this.interventionId,
        keyInterventionId: this.keyInterventionId,
        ewpKeyIntervention: this.ewpKeyIntervention,
        flatLocations: this.flatLocations,
        partnerId: this.partnerId,
        quarters: this.quarters,
        readonly: readonly,
        currency: this.currency
      }
    });
  }

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      ResultStructureStyles,
      ActivitiesAndIndicatorsStyles,
      ...super.styles,
      css`
        :host {
          --main-background: #fdf0d2;
          --main-background-dark: #fdf0d2;
          display: block;
          background: var(--main-background);
        }
        .activity-data div {
          text-align: left !important;
          font-size: var(--etools-font-size-16, 16px);
          font-weight: 400;
          line-height: 26px;
        }
        .table-row:not(.empty) {
          min-height: 42px;
        }
        .table-row div.number-data {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        div.time-intervals {
          max-width: 160px;
          width: 15%;
        }
        div.editable-row .hover-block {
          background: linear-gradient(270deg, var(--main-background) 71.65%, rgba(196, 196, 196, 0) 100%);
          padding-inline-start: 20px;
        }
        etools-data-table-row#activitiesRow::part(edt-list-row-wrapper) {
          padding-inline-start: 25px !important;
        }
        etools-data-table-row#activitiesRow::part(edt-list-row-collapse-wrapper) {
          border-top: none;
        }
        etools-icon-button[name='more-vert'] {
          color: inherit;
        }
        sl-dropdown {
          --sl-spacing-x-small: 4px;
        }
        sl-dropdown sl-menu-item:focus-visible::part(base) {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--sl-color-neutral-1000);
        }
      `
    ];
  }
}
