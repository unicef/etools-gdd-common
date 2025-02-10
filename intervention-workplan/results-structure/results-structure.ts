import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {css, html, CSSResultArray, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {
  selectInterventionId,
  selectInterventionStatus,
  selectInterventionQuarters,
  selectInterventionResultLinks,
  selectResultLinksPermissions
} from './results-structure.selectors';
import {ResultStructureStyles} from './styles/results-structure.styles';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import './cp-output-level';
import './pd-activities';
import './modals/key-intervention-dialog';
import './modals/cp-output-dialog';
import './modals/sync-results-structure-dialog';
import './display-controls';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {GDD_TABS} from '../../common/constants';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import get from 'lodash-es/get';
import {getIntervention} from '../../common/actions/gddInterventions';
import {isUnicefUser, currentIntervention} from '../../common/selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {
  AsyncAction,
  GDDQuarter,
  CpOutput,
  IdAndName,
  GDDExpectedResult,
  GDD,
  GDDResultLinkLowerResult,
  EtoolsEndpoint
} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../utils/intervention-labels-map';
import ContentPanelMixin from '@unicef-polymer/etools-modules-common/dist/mixins/content-panel-mixin';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-row';
import {GDDPdActivities} from './pd-activities';
import {GDDCpOutputLevel} from './cp-output-level';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {_canDelete} from '../../common/mixins/results-structure-common';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 */
@customElement('gdd-results-structure')
export class GDDResultsStructure extends CommentsMixin(ContentPanelMixin(LitElement)) {
  get resultLinks(): GDDExpectedResult[] {
    return this._resultLinks || [];
  }
  set resultLinks(data: GDDExpectedResult[]) {
    this._resultLinks = data.sort(
      (linkA, linkB) => Number(Boolean(linkB.cp_output)) - Number(Boolean(linkA.cp_output))
    );
  }
  @property() interventionId!: number | null;
  @property() interventionStatus!: string;

  quarters: GDDQuarter[] = [];

  @property({type: Boolean}) isUnicefUser = true;
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;
  @property({type: Boolean}) showInactiveToggle = false;
  @property({type: Object})
  permissions!: {
    edit: {result_links?: boolean};
    required: {result_links?: boolean};
  };

  @property() private _resultLinks: GDDExpectedResult[] | null = null;
  @property({type: String}) noOfKeyInterventions: string | number = '0';
  @property({type: Boolean}) showInactiveIndicatorsActivities = false;

  @property({type: Object})
  intervention!: GDD;

  private cpOutputs: CpOutput[] = [];
  private newCPOutputs: Set<number> = new Set();
  private newKeyInterventions: Set<number> = new Set();
  private commentsModeEnabledFlag?: boolean;

  render() {
    if (!this.intervention || !this.permissions || !this.resultLinks) {
      return html` ${sharedStyles}
        <etools-loading source="results-s" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        etools-content-panel::part(ecp-header-title-panel) {
          justify-content: space-between;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title="${translate(gddTranslatesMap.result_links)} (${this.noOfKeyInterventions})"
        elevation="0"
      >
        <div slot="after-title">
          <gdd-display-controls
            ?show-inactive-toggle="${this.showInactiveToggle}"
            .interventionId="${this.interventionId}"
            @show-inactive-changed="${this.inactiveChange}"
          ></gdd-display-controls>
        </div>
        <div slot="panel-btns">
          <!--    CP output ADD button     -->
          <div class="result-structure-buttons">
            <div
              class="add-button"
              @click="${() => this.openSyncResultsStructure()}"
              ?hidden="${!this.isUnicefUser ||
              !this.permissions.edit.result_links ||
              this.commentMode ||
              !this.intervention?.e_workplans?.length}"
            >
              <etools-icon-button name="add-box" tabindex="0"></etools-icon-button>
              <span class="no-wrap">${translate('GDD_SYNC_RESULTS_STRUCTURE')}</span>
            </div>
            <div
              class="add-button"
              @click="${() => this.openCpOutputDialog()}"
              ?hidden="${!this.isUnicefUser ||
              !this.permissions.edit.result_links ||
              this.commentMode ||
              !this.intervention?.e_workplans?.length}"
            >
              <etools-icon-button name="add-box" tabindex="0"></etools-icon-button>
              <span class="no-wrap">${translate('GDD_ADD_CP_OUTPUT')}</span>
            </div>
          </div>
          <div class="total-result layout-horizontal bottom-aligned" ?hidden="${!this.showActivities}">
            <div class="heading">${translate('TOTAL')}:</div>
            <div class="data">${this.intervention.planned_budget.currency} <b>${this.getTotal()}</b></div>
          </div>
        </div>

        ${repeat(
          this.resultLinks,
          (result: GDDExpectedResult) => result.id,
          (result, _index) => html`
            <gdd-cp-output-level
              index="${_index}"
              ?isUnicefUser="${this.isUnicefUser}"
              .resultLink="${result}"
              .interventionId="${this.interventionId}"
              .showIndicators="${this.showIndicators}"
              .showActivities="${this.showActivities}"
              .currency="${this.intervention.planned_budget.currency}"
              .readonly="${!this.permissions.edit.result_links || this.commentMode}"
              .opened="${this.newCPOutputs.has(result.id)}"
              .interventionInfo="${this._getCPNeededInterventionInfo(this.intervention)}"
              @edit-cp-output="${() => this.openCpOutputDialog(result)}"
              @delete-cp-output="${() => this.openDeleteCpOutputDialog(result.id)}"
              @opened-changed="${this.onCpOpenedChanged}"
              style="z-index: ${99 - _index};"
            >
              <div
                class="no-results"
                ?hidden="${!this.isUnicefUser ||
                this.permissions.edit.result_links ||
                result.gdd_key_interventions.length}"
              >
                ${translate('NO_PDS_ADDED')}
              </div>
              ${!result.cp_output || !this.permissions.edit.result_links || this.commentMode
                ? ''
                : html`
                    <div class="pd-title layout-horizontal align-items-center">
                      ${translate('KEY_INTERVENTIONS_TITLE')}<etools-info-tooltip position="top" custom-icon offset="0">
                        <etools-icon-button
                          name="add-box"
                          slot="custom-icon"
                          class="add"
                          @click="${() => this.openKeyInterventionDialog({}, result)}"
                        ></etools-icon-button>
                        <span class="no-wrap" slot="message">${translate('ADD_KEY_INTERVENTION')}</span>
                      </etools-info-tooltip>
                    </div>
                  `}
              ${result.gdd_key_interventions.map(
                (keyIntervention: GDDResultLinkLowerResult, index: number) => html`
                  <etools-data-table-row
                    id="keyInterventionRow"
                    class="keyInterventionMargin ${this.isUnicefUser ? 'unicef-user' : 'partner'}"
                    related-to="key-intervention-${keyIntervention.id}"
                    related-to-description="${keyIntervention.name}"
                    comments-container
                    secondary-bg-on-hover
                    .detailsOpened="${this.newKeyInterventions.has(keyIntervention.id)}"
                    style="z-index: ${99 - index};"
                  >
                    <div slot="row-data" class="layout-horizontal editable-row key-intervention-row">
                      <div class="flex-fix">
                        <div class="data bold-data">${keyIntervention.code}&nbsp;${keyIntervention.name}</div>
                        <div class="count">
                          <div><b>${keyIntervention.activities.length}</b> ${translate('ACTIVITIES')}</div>
                        </div>
                      </div>

                      <div class="flex-none total-cache" ?hidden="${!this.showActivities}">
                        <div class="heading">${translate('TOTAL_CASH_BUDGET')}</div>
                        <div class="data">
                          <span class="currency">${this.intervention.planned_budget.currency}</span>
                          ${displayCurrencyAmount(keyIntervention.total, '0.00')}
                        </div>
                      </div>

                      <div
                        class="hover-block"
                        ?hidden="${!this.permissions.edit.result_links || this.commentsModeEnabledFlag}"
                      >
                        <etools-icon-button
                          name="create"
                          @click="${() => this.openKeyInterventionDialog(keyIntervention, result)}"
                        ></etools-icon-button>
                        <etools-icon-button
                          name="delete"
                          ?hidden="${!_canDelete(
                            keyIntervention,
                            !this.permissions.edit.result_links!,
                            this.intervention.status,
                            this.intervention.in_amendment,
                            this.intervention.in_amendment_date as any
                          )}"
                          @click="${() => this.openDeleteKeyInterventionDialog(keyIntervention.id)}"
                        ></etools-icon-button>
                      </div>
                    </div>

                    <div slot="row-data-details">
                      <gdd-pd-activities
                        .activities="${keyIntervention.activities}"
                        .interventionId="${this.interventionId}"
                        .interventionStatus="${this.interventionStatus}"
                        .inAmendmentDate="${this.intervention.in_amendment_date}"
                        .showInactive="${this.showInactiveIndicatorsActivities}"
                        .keyInterventionId="${keyIntervention.id}"
                        .ewpKeyIntervention="${keyIntervention.ewp_key_intervention}"
                        .partnerId="${this.intervention.partner_id}"
                        .quarters="${this.quarters}"
                        ?hidden="${!this.showActivities}"
                        .readonly="${!this.permissions.edit.result_links || this.commentMode}"
                        .currency="${this.intervention.planned_budget.currency}"
                        .inAmendment="${this.intervention.in_amendment}"
                      ></gdd-pd-activities>
                    </div>
                  </etools-data-table-row>
                `
              )}
            </gdd-cp-output-level>
          `
        )}
        ${!this.intervention?.e_workplans?.length && !this.resultLinks.length
          ? html` <div class="no-results">${translate('NO_EWORKPLANS_ADDED')}</div> `
          : ''}
        ${this.intervention?.e_workplans?.length && !this.resultLinks.length
          ? html` <div class="no-results">${translate('NO_RESULTS_ADDED')}</div> `
          : ''}
      </etools-content-panel>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  protected firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    if (this.commentsModeEnabledFlag) {
      setTimeout(() => this.openAllCpOutputs());
    }
  }

  onCpOpenedChanged(event: CustomEvent) {
    if (!event.detail.opened) {
      return;
    }
    this.openCPChildren(event.target as GDDCpOutputLevel);
  }

  openAllCpOutputs() {
    this.shadowRoot!.querySelectorAll('cp-output-level').forEach((element) => {
      const row = (element as GDDCpOutputLevel).shadowRoot!.querySelector('etools-data-table-row');
      if (row) {
        (row as EtoolsDataTableRow).detailsOpened = true;
      }
      this.openCPChildren(element as GDDCpOutputLevel);
    });
  }

  openCPChildren(cpElement: GDDCpOutputLevel): void {
    cpElement
      .querySelectorAll('etools-data-table-row')
      .forEach((row: Element) => ((row as EtoolsDataTableRow).detailsOpened = true));
    cpElement.querySelectorAll('pd-activities').forEach((row: Element) => (row as GDDPdActivities).openAllRows());
  }

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', GDD_TABS.Workplan) ||
      !state.gddInterventions.current
    ) {
      return;
    }
    if (state.gddCommentsData?.commentsModeEnabled && !this.commentsModeEnabledFlag) {
      this.openAllCpOutputs();
    }
    this.commentsModeEnabledFlag = Boolean(state.gddCommentsData?.commentsModeEnabled);
    this.updateResultLinks(state);
    this.showInactiveToggle = false;
    this.permissions = selectResultLinksPermissions(state);
    this.interventionId = selectInterventionId(state);
    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    this.cpOutputs = (state.commonData && state.commonData.cpOutputs) || [];
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));
    this._updateNoOfKeyInterventions();
    super.stateChanged(state);
  }

  getTotal(): string {
    const total: number = this.resultLinks.reduce(
      (sum: number, result: GDDExpectedResult) => sum + Number(result.total),
      0
    );
    return displayCurrencyAmount(String(total), '0.00');
  }

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    const element: HTMLElement = container.shadowRoot!.querySelector('#wrapper') as HTMLElement;
    const relatedTo: string = container.getAttribute('related-to') as string;
    const relatedToDescription = container.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }

  openKeyInterventionDialog(): void;
  openKeyInterventionDialog(keyIntervention: Partial<GDDResultLinkLowerResult>, result: any): void;
  openKeyInterventionDialog(keyIntervention?: Partial<GDDResultLinkLowerResult>, result?: any): void {
    const cpOutputs: IdAndName<number>[] = this.intervention.result_links
      .map(({cp_output: id, cp_output_name: name}: GDDExpectedResult) => ({
        id,
        name
      }))
      .filter(({id}: IdAndName<number>) => id);
    openDialog<any>({
      dialog: 'gdd-key-intervention-dialog',
      dialogData: {
        keyIntervention: keyIntervention ? {...keyIntervention, cp_output: result?.cp_output} : undefined,
        cpOutput: result?.cp_output,
        resultId: result?.id,
        cpOutputs,
        hideCpOutputs: !this.isUnicefUser,
        interventionId: this.interventionId
      }
    });
  }

  async openDeleteKeyInterventionDialog(lower_result_id: number) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('REMOVE_GDD_MSG'),
        confirmBtnText: translate('CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteKeyInterventionFromPD(lower_result_id);
    }
  }

  deleteKeyInterventionFromPD(lower_result_id: number) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'gdd-interv-pd-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.lowerResultsDelete, {
      lower_result_id,
      intervention_id: this.interventionId
    });
    _sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => getStore().dispatch<AsyncAction>(getIntervention()))
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'gdd-interv-pd-remove'
        })
      );
  }

  openCpOutputDialog(resultLink?: GDDExpectedResult): void {
    const canChangeCpOp =
      !this.intervention.in_amendment && ['draft', 'development'].includes(this.intervention.status);
    openDialog({
      dialog: 'gdd-cp-output-dialog',
      dialogData: {
        resultLink,
        interventionId: this.interventionId,
        canChangeCpOp: canChangeCpOp
      }
    });
    this.openContentPanel();
  }

  openSyncResultsStructure() {
    openDialog({
      dialog: 'gdd-sync-results-structure-dialog',
      dialogData: {
        interventionId: this.interventionId
      }
    });
    this.openContentPanel();
  }

  filterOutAlreadySelectedAndByCPStructure(canChangeCpOp: boolean) {
    const alreadyUsedCpOs = canChangeCpOp
      ? new Set()
      : new Set(this.resultLinks.map(({cp_output}: GDDExpectedResult) => cp_output));
    const cpStructure = Number(this.intervention.country_programme);

    return this.cpOutputs.filter(({id, country_programme}: CpOutput) => {
      let conditionFulfilled = !alreadyUsedCpOs.has(id);
      if (cpStructure) {
        conditionFulfilled = conditionFulfilled && cpStructure === Number(country_programme);
      }
      return conditionFulfilled;
    });
  }

  async openDeleteCpOutputDialog(resultLinkId: number) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('REMOVE_CP_OUTPUT_MSG'),
        confirmBtnText: translate('CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteCPOutputFromPD(resultLinkId);
    }
  }

  deleteCPOutputFromPD(resultLinkId: number) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'gdd-interv-cp-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.resultLinkGetDelete, {
      interventionId: this.interventionId,
      result_link: resultLinkId
    });
    _sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => getStore().dispatch<AsyncAction>(getIntervention()))
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'gdd-interv-cp-remove'
        })
      );
  }

  _updateNoOfKeyInterventions() {
    if (!this.resultLinks) {
      this.noOfKeyInterventions = 0;
      return;
    }
    this.noOfKeyInterventions = this.resultLinks
      .map((rl: GDDExpectedResult) => {
        return rl.gdd_key_interventions.length;
      })
      .reduce((a: number, b: number) => a + b, 0);
  }

  inactiveChange(e: CustomEvent): void {
    if (!e.detail) {
      return;
    }
    this.showInactiveIndicatorsActivities = e.detail.value;
  }

  private updateResultLinks(state: RootState): void {
    const newResults = selectInterventionResultLinks(state) || [];
    if (this._resultLinks) {
      // check if CP outputs was rendered already, check if we have new CP output.
      const existingCP = this.resultLinks.map(({id}) => id);
      const created = newResults.filter(({id}) => !existingCP.includes(id));
      // if we found new CP output - add it to track to open it on first render
      created.forEach(({id}) => this.newCPOutputs.add(id));
      // the same thing for PD
      const existingPD = this.resultLinks.flatMap(({gdd_key_interventions}) => gdd_key_interventions.map(({id}) => id));
      const createdPD = newResults
        .flatMap(({gdd_key_interventions}) => gdd_key_interventions)
        .filter(({id}) => !existingPD.includes(id));
      createdPD.forEach(({id}) => this.newKeyInterventions.add(id));
    }

    this.resultLinks = newResults;
  }

  _getCPNeededInterventionInfo(intervention: GDD) {
    return {
      status: intervention.status,
      in_amendment: intervention.in_amendment,
      in_amendment_date: intervention.in_amendment_date
    };
  }

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      ResultStructureStyles,
      css`
        etools-icon[name='create'] {
          margin-inline-start: 50px;
        }
        .no-results {
          padding: 24px;
        }
        .pd-title {
          padding-block: 8px 0;
          padding-inline: 22px 42px;
          font-size: var(--etools-font-size-16, 16px);
          font-weight: 500;
          line-height: 19px;
        }
        cp-output-level .pd-title {
          padding: 8px 16px;
          padding-inline-start: 45px;
        }
        .pd-add-section {
          background-color: #ccebff;
        }
        .pd-add {
          padding: 0 5px 0;
        }
        etools-data-table-row {
          position: relative;
        }
        etools-data-table-row.partner:after,
        etools-data-table-row:not(:last-child):after {
          content: '';
          display: block;
          position: absolute;
          width: calc(100% - 14px);
          left: 7px;
          bottom: 0;
          height: 1px;
          background-color: #c4c4c4;
        }
        cp-output-level:last-child etools-data-table-row:last-child:after {
          content: none;
        }
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-data-table-row::part(edt-list-row-wrapper) {
          background-color: #ccebff;
          min-height: 48px;
          border-bottom: none;
        }
        etools-data-table-row::part(edt-icon-wrapper) {
          min-height: 0;
          line-height: normal;
          padding-block: 4px 0;
          padding-inline: 13px 8px;
          align-self: flex-start;
        }
        etools-data-table-row::part(edt-list-row-wrapper):hover {
          background-color: var(--key-intervention-background);
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          border-bottom: none !important;
        }
        div.editable-row .hover-block {
          background: linear-gradient(270deg, var(--key-intervention-background) 71.65%, rgba(196, 196, 196, 0) 100%);
        }
        div.key-intervention-row > div {
          line-height: 26px;
          padding-top: 6px;
          padding-bottom: 4px;
        }
        .export-res-btn {
          height: 28px;
        }
        .no-wrap {
          white-space: nowrap;
        }
        .total-result {
          padding-bottom: 6px;
          margin-inline-start: 12px;
        }
        .total-result b {
          font-size: var(--etools-font-size-22, 22px);
          font-weight: 900;
          line-height: 23px;
        }
        .total-result .heading {
          font-size: var(--etools-font-size-14, 14px);
          margin-inline-end: 10px;
          line-height: 23px;
        }
        etools-content-panel {
          box-shadow: 0 2px 7px 3px rgba(0, 0, 0, 0.15);
        }
        etools-content-panel::part(ecp-header) {
          border-bottom: none;
        }
        etools-content-panel::part(ecp-header) {
          position: relative;
          padding: 13px 16px;
        }
        etools-content-panel::part(ecp-header):after {
          content: '';
          position: absolute;
          display: block;
          width: calc(100% - 14px);
          left: 7px;
          bottom: 0;
          height: 1px;
          background-color: #c4c4c4;
        }
        .count {
          display: flex;
          font-size: var(--etools-font-size-14, 14px);
          font-weight: 400;
          line-height: 16px;
          padding: 6px 0 4px;
        }
        .count div:first-child {
          margin-inline-end: 20px;
        }

        etools-data-table-row#keyInterventionRow::part(edt-list-row-wrapper) {
          padding-inline-start: 25px !important;
        }
        .flex-fix {
          min-width: 0px;
          min-height: 0px;
          width: 100%;
          word-break: break-word;
        }
        @media (max-width: 768px) {
          .total-result b {
            font-size: var(--etools-font-size-16, 16px);
          }
        }
      `
    ];
  }
}
