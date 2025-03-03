import {CSSResultArray, html, LitElement, TemplateResult} from 'lit';
import {property, customElement, query, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '../../../../common/components/activity/activity-items-table';
import {getTotalCashFormatted} from '../../../../common/components/activity/get-total.helper';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {gddEndpoints} from '../../../../utils/intervention-endpoints';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import './activity-timeframes';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GDDActivityItemsTable} from '../../../../common/components/activity/activity-items-table';
import {updateCurrentIntervention} from '../../../../common/actions/gddInterventions';
import {GDDActivityTimeFrames} from './activity-timeframes';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, EtoolsEndpoint, GDDActivity, GDDActivityItem} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {DataMixin} from '@unicef-polymer/etools-modules-common/dist/mixins/data-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import cloneDeep from 'lodash-es/cloneDeep';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../../../common/types/store.types';

@customElement('gdd-activity-data-dialog')
export class GDDActivityDataDialog extends DataMixin()<GDDActivity>(connectStore(LitElement)) {
  static get styles(): CSSResultArray {
    return [layoutStyles];
  }

  @property({type: String})
  currency = '';
  @property() loadingInProcess = false;
  @property() isEditDialog = true;
  @property() useInputLevel = false;
  @property() ewpActivities: any[] = [];
  @property({type: String}) spinnerText = getTranslation('GENERAL.LOADING');
  @property() readonly: boolean | undefined = false;
  @query('etools-dialog') private dialogElement!: EtoolsDialog;
  @query('activity-items-table') private activityItemsTable!: GDDActivityItemsTable;
  quarters: GDDActivityTimeFrames[] = [];

  @state() allLocations: any[] = [];
  @state() activitiesLoaded = false;
  @state() showDifferentPartnerWarning = false;

  private ewpKeyIntervention!: number;
  private partnerId!: number;

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.allLocations, state.commonData!.locations)) {
      this.allLocations = [...state.commonData!.locations];
    }
  }

  set dialogData({
    activityId,
    keyInterventionId,
    interventionId,
    quarters,
    readonly,
    currency,
    ewpKeyIntervention,
    partnerId
  }: any) {
    this.quarters = quarters;
    this.readonly = readonly;
    this.currency = currency;
    this.ewpKeyIntervention = ewpKeyIntervention;
    this.partnerId = Number(partnerId);

    this.loadEWPActivities(this.ewpKeyIntervention);

    if (!activityId) {
      this.data = {} as GDDActivity;
      this.isEditDialog = false;
      this.endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.gddActivities, {
        interventionId,
        keyInterventionId
      });
      return;
    }

    this.loadingInProcess = true;
    this.endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.gddActivityDetails, {
      interventionId,
      keyInterventionId,
      activityId
    });
    sendRequest({
      endpoint: this.endpoint
    }).then((data: GDDActivity) => {
      this.useInputLevel = Boolean(data.items.length);
      setTimeout(() => {
        // Avoid reset caused by inputLevelChange method
        this.data = data;
        this.loadingInProcess = false;
        this.spinnerText = getTranslation('GENERAL.SAVING_DATA');
      }, 100);
    });
  }

  loadEWPActivities(id: number) {
    this.activitiesLoaded = false;

    if (id) {
      const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.ewpActivities, {
        keyInterventionId: id
      });

      sendRequest({
        endpoint
      }).then((ewpActivities: any[]) => {
        this.ewpActivities = [...ewpActivities];
        this.activitiesLoaded = true;
      });
    } else {
      this.ewpActivities = [];
    }
  }

  private endpoint!: RequestEndpoint;

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <style>
        etools-dialog::part(panel) {
          width: 1200px;
        }

        .container {
          padding: 12px 24px;
        }
        *[hidden] {
          display: none;
        }
        .total-input,
        etools-currency {
          margin-inline-end: 24px;
        }
        .total {
          justify-content: center;
          display: flex;
        }
        .general-total {
          min-width: 155px;
          width: auto !important;
        }
        sl-switch {
          margin: 8px 0;
          width: min-content;
          white-space: nowrap;
        }
        .error-msg {
          color: var(--error-color);
          font-size: var(--etools-font-size-14, 14px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        etools-dialog etools-textarea::part(textarea) {
          max-height: 96px;
          overflow-y: auto;
        }
        etools-dialog etools-textarea::part(textarea) {
          max-height: unset;
        }
        @media (max-width: 768px) {
          .total {
            justify-content: start;
          }
        }
      </style>

      <!-- ATTENTION spinner-text property binding WORKS WITHOUT '.'  -->
      <etools-dialog
        size="lg"
        keep-dialog-open
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        dialog-title=${translate('ACTIVITY_DATA')}
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        .hideConfirmBtn="${this.readonly}"
      >
        <div class="row">
          <div ?hidden="${!this.showDifferentPartnerWarning}" class="col-12 error-msg">
              ${translate('DIFFERENT_PARTNER_INVOLVED')}
          </div>
          <div class="col-6">
            <etools-dropdown
              class="validate-input"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (detail.selectedItem && detail.selectedItem.id !== this.editedData.ewp_activity) {
                  this.editedData.ewp_activity = detail.selectedItem.id;
                  this.setSelectedLocationsByActivity(this.editedData.ewp_activity);
                }
              }}"
              ?trigger-value-change-event="${!this.loadingInProcess}"
              .selected="${this.editedData.ewp_activity}"
              label=${translate('EWP_ACTIVITY')}
              placeholder="&#8212;"
              .options="${this.ewpActivities}"
              option-label="title"
              option-value="id"
              allow-outside-scroll
              dynamic-align
              required
              readonly="${this.readonly}"
              ?invalid="${this.errors.ewp_activity}"
              .errorMessage="${this.errors.ewp_activity && this.errors.ewp_activity[0]}"
              @focus="${() => this.resetFieldError('ewp_activity')}"
              @click="${() => this.resetFieldError('ewp_activity')}"
            ></etools-dropdown>
            ${
              this.activitiesLoaded && !this.ewpActivities?.length
                ? html`<div class="error-msg">${translate('MISSING_EWP_ACTIVITIES')}</div>`
                : html``
            }          
          </div>
           <div class="col-6">
            <etools-dropdown-multi
              class="validate-input"
              @etools-selected-items-changed="${({detail}: CustomEvent) => {
                this.editedData.locations = detail.selectedItems.map((x: any) => Number(x.id));
              }}"
              ?trigger-value-change-event="${!this.loadingInProcess}"
              .selectedValues="${this.editedData.locations}"
              label=${translate('LOCATIONS')}
              placeholder="&#8212;"
              .options="${this.allLocations}"
              option-label="name"
              option-value="id"
              allow-outside-scroll
              dynamic-align
              readonly="${this.readonly}"
              required
              ?invalid="${this.errors.locations}"
              .errorMessage="${this.errors.locations && this.errors.locations[0]}"
              @focus="${() => this.resetFieldError('locations')}"
              @click="${() => this.resetFieldError('locations')}"
            ></etools-dropdown-multi>
          </div>
          <div class="col-12">
            <etools-textarea
              class="validate-input"
              label=${translate('OTHER_NOTES')}
              placeholder="&#8212;"
              .value="${this.editedData.context_details}"
              @value-changed="${({detail}: CustomEvent) => this.updateModelValue('context_details', detail.value)}"
              ?invalid="${this.errors.context_details}"
              .errorMessage="${this.errors.context_details && this.errors.context_details[0]}"
              ?readonly="${this.readonly}"
              @focus="${() => this.resetFieldError('context_details')}"
              @click="${() => this.resetFieldError('context_details')}"
            ></etools-textarea>
          </div>
          </div>
          <div class="row">
            ${
              !this.useInputLevel
                ? html`
                    <div class="col-md-3 col-6">
                      <etools-currency
                        label=${translate('UNICEF_CASH_BUDGET')}
                        ?readonly="${this.readonly}"
                        required
                        .value="${this.editedData.unicef_cash}"
                        @value-changed="${({detail}: CustomEvent) =>
                          this.updateModelValue('unicef_cash', detail.value)}"
                      ></etools-currency>
                    </div>
                  `
                : html`
                    <div class="col-md-3 col-6">
                      <etools-input
                        readonly
                        tabindex="-1"
                        class="total-input"
                        label=${translate('UNICEF_CASH_BUDGET')}
                        .value="${this.getSumValue('unicef_cash')}"
                      ></etools-input>
                    </div>
                  `
            }

              <div class="col-md-6 col-12 total">
                <etools-input
                  readonly
                  tabindex="-1"
                  class="general-total"
                  label="${translate('GENERAL.TOTAL')} (${this.currency})"
                  .value="${this.getTotalValue()}"
                ></etools-input>
                </div>
            </div>
          </div>

          <sl-switch
            ?disabled="${this.readonly}"
            ?checked="${this.useInputLevel}"
            @sl-change="${this.inputLevelChange}"
          >
            ${translate('USE_INPUT_LEVEL')}
          </sl-switch>
          <gdd-activity-items-table
            .dialogElement=${this.dialogElement}
            ?hidden="${!this.useInputLevel}"
            .activityItems="${this.editedData.items || []}"
            .readonly="${this.readonly}"
            .currency="${this.currency}"
            @activity-items-changed="${({detail}: CustomEvent) => {
              this.editedData.items = detail;
              this.requestUpdate();
            }}"
          ></gdd-activity-items-table>
          <gdd-activity-time-frames
            tabindex="0"
            .quarters="${this.quarters}"
            .selectedTimeFrames="${this.editedData.time_frames || []}"
            .readonly="${this.readonly}"
            @time-frames-changed="${({detail}: CustomEvent) => {
              this.editedData.time_frames = detail;
              this.requestUpdate();
            }}"
          ></gdd-activity-time-frames>
        </div>
      </etools-dialog>
    `;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getSumValue(field: 'unicef_cash'): string {
    const columnTotal = (this.editedData.items || []).reduce(
      (sum: number, item: Partial<GDDActivityItem>) => sum + Number(item[field]),
      0
    );

    return displayCurrencyAmount(String(columnTotal), '0', 2);
  }

  getTotalValue(): string {
    if (!this.useInputLevel) {
      return getTotalCashFormatted(0, this.editedData.unicef_cash || 0);
    } else {
      const unicef: string = this.getSumValue('unicef_cash').replace(/,/g, '');
      return getTotalCashFormatted(0, unicef);
    }
  }

  setSelectedLocationsByActivity(ewp_activity: number | undefined) {
    if (ewp_activity) {
      const currentActivity = this.ewpActivities.find((x) => Number(x.id) === Number(ewp_activity));
      this.editedData = {
        ...this.editedData,
        locations: currentActivity?.locations || [],
        unicef_cash: currentActivity.total_budget
      };
      this.showDifferentPartnerWarning =
        currentActivity.partners?.length &&
        (currentActivity.partners?.length > 1 || !currentActivity.partners.includes(this.partnerId));
    } else {
      this.editedData = {...this.editedData, locations: []};
      this.showDifferentPartnerWarning = false;
    }
  }

  inputLevelChange(e: CustomEvent): void {
    if (!e.target) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    this.useInputLevel = element.checked;
    this.editedData = {
      ...this.editedData,
      items: this.useInputLevel ? this.editedData.items : [],
      unicef_cash: '0'
    };

    setTimeout(() => {
      if ((!this.editedData.items || !this.editedData.items.length) && this.activityItemsTable) {
        this.activityItemsTable.addNew();
      }
    }, 0);
  }

  validate() {
    return validateRequiredFields(this);
  }

  processRequest(): void {
    if (this.loadingInProcess) {
      return;
    }

    if (!this.validate()) {
      return;
    }

    const activityItemsValidationSummary = this.validateActivityItems();
    if (activityItemsValidationSummary) {
      fireEvent(this, 'toast', {
        text: activityItemsValidationSummary.invalidRequired
          ? getTranslation('FILL_ALL_ACTIVITY_ITEMS')
          : getTranslation('INVALID_TOTAL_ACTIVITY_ITEMS')
      });
      return;
    }
    if (!this.validateActivityTimeFrames()) {
      fireEvent(this, 'toast', {
        text: getTranslation('FILL_ACTIVITY_TIME')
      });
      return;
    }

    this.loadingInProcess = true;

    const dataToSave = cloneDeep(this.editedData);
    if (dataToSave.items?.length) {
      // Let backend calculate these
      delete dataToSave.unicef_cash;
    }
    sendRequest({
      endpoint: this.endpoint,
      method: this.isEditDialog ? 'PATCH' : 'POST',
      body: this.isEditDialog ? {id: this.editedData.id, ...dataToSave} : dataToSave
    })
      .then((response: any) => getStore().dispatch(updateCurrentIntervention(response.gdd)))
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: formatServerErrorAsText(error)});
      });
  }

  validateActivityItems(): AnyObject | undefined {
    const itemsTable: GDDActivityItemsTable | null = this.shadowRoot!.querySelector('gdd-activity-items-table');
    return itemsTable !== null ? itemsTable.validate() : undefined;
  }

  validateActivityTimeFrames() {
    const items: GDDActivityTimeFrames | null = this.shadowRoot!.querySelector('gdd-activity-time-frames');
    return items !== null && items.validate();
  }
}
