import {LitElement, html} from 'lit';
import {property, customElement, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../common/actions/gddInterventions';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '../../common/components/activity/activity-items-table';
import {getTotalCashFormatted} from '../../common/components/activity/get-total.helper';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {AnyObject, GDDManagementBudgetItem} from '@unicef-polymer/etools-types';
import {GDDActivityItemsTable} from '../../common/components/activity/activity-items-table';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {removeCurrencyAmountDelimiter} from '../../utils/utils';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';

/**
 * @customElement
 */
@customElement('gdd-activity-dialog')
export class GDDActivityDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        *[hidden] {
          display: none !important;
        }
        .layout-horizontal {
          overflow: hidden;
        }
        etools-dialog::part(panel) {
          width: 1200px;
        }

        .input-level {
          padding: 25px 0;
        }
        .total {
          justify-content: flex-end;
        }
        .general-total {
          min-width: 155px;
        }
        .padd-bott {
          padding-bottom: 10px;
        }
        sl-switch {
          padding-inline-start: 2px;
        }
      </style>

      <etools-dialog
        id="activityDialog"
        size="lg"
        keep-dialog-open
        dialog-title=${this.readonly ? translate('VIEW_ACTIVITY') : translate('EDIT_ACTIVITY')}
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ?show-spinner="${this.loadingInProcess}"
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${this.onSaveClick}"
        .hideConfirmBtn="${this.readonly}"
      >
        <div class="row">
          <div class="col-12">
            <etools-input
              readonly
              tabindex="-1"
              id="title"
              label=${translate('GENERAL.TITLE')}
              always-float-label
              placeholder="—"
              .value="${this.data.title}"
            >
            </etools-input>
          </div>
          <div class="col-12">
            <etools-textarea
              id="description"
              label=${translate('GENERAL.DESCRIPTION')}
              readonly
              tabindex="-1"
              always-float-label
              placeholder="—"
              .value="${this.data.description}"
            ></etools-textarea>
          </div>
        </div>
        <div class="row align-items-center padd-bott">
          ${!this.useInputLevel
            ? html` <div class="col-md-3 col-6">
                  <etools-currency
                    id="partnerContribution"
                    label=${translate('PARTNER_CASH_BUDGET')}
                    .value="${this.data[this.getPropertyName('partner')]}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, this.getPropertyName('partner'))}"
                    ?readonly="${this.readonly}"
                    ?required="${!this.useInputLevel}"
                    auto-validate
                  >
                  </etools-currency>
                </div>
                <div class="col-md-3 col-6">
                  <etools-currency
                    id="unicefCash"
                    label=${translate('UNICEF_CASH_BUDGET')}
                    .value="${this.data[this.getPropertyName('unicef')]}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, this.getPropertyName('unicef'))}"
                    ?readonly="${this.readonly}"
                    ?required="${!this.useInputLevel}"
                    auto-validate
                  >
                  </etools-currency>
                </div>`
            : html`
                <div class="col-md-3 col-6">
                  <etools-input
                    readonly
                    tabindex="-1"
                    label=${translate('PARTNER_CASH_BUDGET')}
                    .value="${this.getSumValue('cso_cash')}"
                  ></etools-input>
                </div>
                <div class="col-md-3 col-6">
                  <etools-input
                    readonly
                    tabindex="-1"
                    label=${translate('UNICEF_CASH_BUDGET')}
                    .value="${this.getSumValue('unicef_cash')}"
                  ></etools-input>
                </div>
              `}
          <div class="offset-md-3 offset-sm-0 col-md-3 col-12 total">
            <etools-input
              readonly
              tabindex="-1"
              class="general-total"
              label="${translate('GENERAL.TOTAL')} (${this.currency})"
              .value="${this.getTotalValue()}"
            ></etools-input>
          </div>
        </div>

        <div class="row input-level">
          <div class="col-12">
            <sl-switch
              ?checked="${this.useInputLevel}"
              @sl-change="${this.inputLevelChange}"
              ?disabled="${this.readonly}"
            >
              ${translate('USE_INPUT_LEVEL')}
            </sl-switch>
          </div>
        </div>
        <gdd-activity-items-table
          .dialogElement=${this.dialogElement}
          ?hidden="${!this.useInputLevel}"
          .activityItems="${this.items || []}"
          .currency="${this.currency}"
          .readonly="${this.readonly}"
          @activity-items-changed="${({detail}: CustomEvent) => {
            this.items = detail;
            this.requestUpdate();
          }}"
        ></gdd-activity-items-table>
      </etools-dialog>
    `;
  }

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {activity, interventionId, readonly}: any = data;
    this.items = (activity.items || []).filter((row: GDDManagementBudgetItem) => row.kind === activity.kind);
    this.useInputLevel = Boolean((this.items || []).length);
    this.readonly = readonly;

    setTimeout(() => {
      // timeout to avoid inputLevelChange method reseting totals to 0
      this.data = activity;
      this.data.items = (this.data.items || []).filter((row: GDDManagementBudgetItem) => row.kind !== this.data.kind);
      this.originalData = cloneDeep(this.data);
      this.data[this.getPropertyName('partner')] = this.data.partner_contribution; // ?
      this.data[this.getPropertyName('unicef')] = this.data.unicef_cash; // ?
      this.interventionId = interventionId;
      this.currency = data.currency || '';
    });
  }

  private interventionId = '';

  @property() loadingInProcess = false;
  @property() dialogOpened = true;
  @property() useInputLevel = false;
  @property({type: String}) currency = '';
  @property({type: Array}) items: GDDManagementBudgetItem[] = [];
  @property({type: Boolean}) readonly = false;
  @query('etools-dialog') private dialogElement!: EtoolsDialog;
  @query('activity-items-table') private activityItemsTable!: GDDActivityItemsTable;

  valdateNonInputLevFields() {
    const pCash = this.shadowRoot?.querySelector<EtoolsCurrency>('#partnerContribution')!;
    const uCash = this.shadowRoot?.querySelector<EtoolsCurrency>('#unicefCash')!;
    return pCash.validate() && uCash.validate();
  }

  validate() {
    if (!this.useInputLevel) {
      if (!this.valdateNonInputLevFields()) {
        fireEvent(this, 'toast', {text: getTranslation('REQUIRED_ERROR')});
        return false;
      }
    } else {
      const activityItemsValidationSummary = this.validateActivityItems();
      if (activityItemsValidationSummary) {
        fireEvent(this, 'toast', {
          text: activityItemsValidationSummary.invalidRequired
            ? getTranslation('FILL_ALL_ACTIVITY_ITEMS')
            : getTranslation('INVALID_TOTAL_ACTIVITY_ITEMS')
        });
        return false;
      }
    }
    return true;
  }

  onSaveClick() {
    if (!this.validate()) {
      return;
    }

    this.items.forEach((row: GDDManagementBudgetItem) => {
      row.kind = this.data.kind;
    });
    this.loadingInProcess = true;

    const patchData = cloneDeep(this.data);
    patchData.items = patchData.items.concat(this.items);
    this.formatDataBeforeSave(patchData);
    sendRequest({
      endpoint: getEndpoint(gddEndpoints.interventionBudgetUpdate, {
        interventionId: this.interventionId
      }),
      method: 'PATCH',
      body: patchData
    })
      .then(({gdd}) => {
        getStore().dispatch(updateCurrentIntervention(gdd));
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  getPropertyName(sufix: string) {
    return this.originalData ? `act${this.originalData.index}_${sufix}` : '';
  }

  inputLevelChange(e: CustomEvent): void {
    if (!e.target) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    this.useInputLevel = element.checked;
    if (this.useInputLevel) {
      this.data[this.getPropertyName('unicef')] = '0';
      this.data[this.getPropertyName('partner')] = '0';
      if ((!this.items || !this.items.length) && this.activityItemsTable) {
        // add by default a row in activity items table if we have none
        setTimeout(() => {
          this.activityItemsTable.addNew();
        }, 100);
      }
    } else {
      this.items = [];
    }
  }

  getSumValue(field: 'cso_cash' | 'unicef_cash'): string {
    const total = (this.items || []).reduce((sum: number, item: AnyObject) => sum + Number(item[field]), 0);
    return displayCurrencyAmount(String(total), '0', 2);
  }

  getTotalValue(): string {
    if (!this.useInputLevel) {
      return getTotalCashFormatted(
        this.data[this.getPropertyName('partner')] || 0,
        this.data[this.getPropertyName('unicef')] || 0
      );
    } else {
      const cso: string = this.getSumValue('cso_cash').replace(/,/g, '');
      const unicef: string = this.getSumValue('unicef_cash').replace(/,/g, '');
      return getTotalCashFormatted(cso, unicef);
    }
  }

  validateActivityItems(): AnyObject | undefined {
    const itemsTable: GDDActivityItemsTable | null = this.shadowRoot!.querySelector('gdd-activity-items-table');
    return itemsTable !== null ? itemsTable.validate() : undefined;
  }

  formatDataBeforeSave(data: any) {
    [this.getPropertyName('unicef'), this.getPropertyName('partner')].forEach((prop) => {
      data[prop] = removeCurrencyAmountDelimiter(data[prop]);
    });
  }
}
