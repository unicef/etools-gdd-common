import {LitElement, html, TemplateResult} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {gddEndpoints} from '../../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {DataMixin} from '@unicef-polymer/etools-modules-common/dist/mixins/data-mixin';
import {getDifference} from '@unicef-polymer/etools-modules-common/dist/mixins/objects-diff';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../../common/actions/gddInterventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {CpOutput, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {GDDResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';

@customElement('gdd-key-intervention-dialog')
export class GDDKeyInterventionialog extends DataMixin()<GDDResultLinkLowerResult>(LitElement) {
  @property() loadingInProcess = false;
  @property() isEditDialog = false;

  @property() cpOutputs: CpOutput[] = [];
  @property() hideCpOutputs = false;
  @property() keyInterventions: any[] = [];

  interventionId!: number;
  cpOutput!: number;
  resultId!: number;

  get unassociated(): boolean {
    return Boolean(this.editedData.id && !this.editedData.cp_output);
  }

  set dialogData({keyIntervention, cpOutputs, hideCpOutputs, interventionId, cpOutput, resultId}: any) {
    this.data = keyIntervention || {};
    this.cpOutputs = cpOutputs || [];
    this.hideCpOutputs = hideCpOutputs || !keyIntervention || keyIntervention.cp_output;
    this.isEditDialog = Boolean(keyIntervention && keyIntervention.id);
    this.interventionId = interventionId;
    this.cpOutput = cpOutput;
    this.resultId = resultId;
    this.editedData.result_link = this.resultId;
    this.loadKeyInterventions(cpOutput);
  }

  static get styles() {
    return [layoutStyles];
  }

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <style>
        .container {
          padding: 12px 24px;
        }
        .unassociated-warning {
          display: flex;
          flex-direction: column;
          font-size: var(--etools-font-size-13, 13px);
          align-items: flex-start;
          padding: 12px 22px;
          background: #ffaa0eb8;
        }
        etools-icon {
          margin-inline-end: 10px;
        }
        *[hidden] {
          display: none;
        }
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        ?show-spinner="${this.loadingInProcess}"
        dialog-title="${this.isEditDialog ? translate('GENERAL.EDIT') : translate('GENERAL.ADD')} ${translate(
          'KEY_INTERVENTION'
        )}"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <div class="unassociated-warning" ?hidden="${!this.unassociated || this.hideCpOutputs}">
          <div><etools-icon name="warning"></etools-icon>${translate('ASSOCIATE_PROMPT')}</div>
          ${!this.cpOutputs.length
            ? html` <div><br /><etools-icon name="warning"></etools-icon> ${translate('ASSOCIATE_MSG')}</div> `
            : ''}
        </div>
        <div class="row">
          <div class="col-12">
            <etools-dropdown
              class="validate-input"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                this.editedData.ewp_key_intervention = detail.selectedItem && detail.selectedItem.id;
              }}"
              ?trigger-value-change-event="${!this.loadingInProcess}"
              .selected="${this.editedData.ewp_key_intervention}"
              label=${translate('KEY_INTERVENTION')}
              placeholder="&#8212;"
              .options="${this.keyInterventions}"
              option-label="name"
              option-value="id"
              allow-outside-scroll
              dynamic-align
              required
              ?invalid="${this.errors.key_intervention}"
              .errorMessage="${this.errors.key_intervention && this.errors.key_intervention[0]}"
              @focus="${() => this.resetFieldError('key_intervention')}"
              @click="${() => this.resetFieldError('key_intervention')}"
            ></etools-dropdown>
          </div>
          ${this.hideCpOutputs
            ? ''
            : html`
                <div class="col-12">
                  <etools-dropdown
                    class="validate-input flex-1"
                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                      this.updateModelValue('cp_output', detail.selectedItem && detail.selectedItem.id)}"
                    ?trigger-value-change-event="${!this.loadingInProcess}"
                    .selected="${this.editedData.cp_output}"
                    label="CP Output"
                    placeholder="&#8212;"
                    .options="${this.cpOutputs}"
                    option-label="name"
                    option-value="id"
                    allow-outside-scroll
                    dynamic-align
                    auto-validate
                    required
                    ?invalid="${this.errors.cp_output}"
                    .errorMessage="${(this.errors.cp_output && this.errors.cp_output[0]) ||
                    translate('GENERAL.REQUIRED_FIELD')}"
                    @focus="${() => this.resetFieldError('cp_output')}"
                    @click="${() => this.resetFieldError('cp_output')}"
                  ></etools-dropdown>
                </div>
              `}
        </div>
      </etools-dialog>
    `;
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  processRequest(): void {
    if (this.loadingInProcess) {
      return;
    }

    if (!validateRequiredFields(this)) {
      return;
    }
    this.loadingInProcess = true;
    // get endpoint
    const endpoint: RequestEndpoint = this.isEditDialog
      ? getEndpoint(gddEndpoints.keyInterventionDetails, {
          pd_id: this.editedData.id,
          intervention_id: this.interventionId
        })
      : getEndpoint(gddEndpoints.createKeyIntervention, {intervention_id: this.interventionId});

    // get changed fields
    const diff: Partial<GDDResultLinkLowerResult> = getDifference<GDDResultLinkLowerResult>(
      this.isEditDialog ? (this.originalData as GDDResultLinkLowerResult) : {},
      this.editedData,
      {
        toRequest: true
      }
    );
    sendRequest({
      endpoint,
      method: this.isEditDialog ? 'PATCH' : 'POST',
      body: this.isEditDialog ? {id: this.editedData.id, ...diff} : diff
    })
      .then((response: any) => getStore().dispatch(updateCurrentIntervention(response.gdd)))
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  loadKeyInterventions(id: number) {
    if (id) {
      const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.ewpKeyInterventions, {
        ewpOutputId: id
      });

      sendRequest({
        endpoint
      }).then((keyInterventions: any[]) => {
        this.keyInterventions = [...keyInterventions];
      });
    } else {
      this.keyInterventions = [];
    }
  }
}
