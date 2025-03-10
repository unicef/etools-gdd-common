import {LitElement, html, TemplateResult} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../../utils/intervention-endpoints';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getIntervention} from '../../../common/actions/gddInterventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import {AsyncAction, GDDResultIndicator, GenericObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {areEqual} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

@customElement('gdd-cp-output-dialog')
export class GDDCpOutputDialog extends LitElement {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;

  @property() indicators: GDDResultIndicator[] = [];
  @property() selectedIndicators: number[] = [];
  @property() selectedCpOutput?: number;
  @property() errors: GenericObject<any> = {};
  @property() cpOutputs: any[] = [];
  @property({type: String}) spinnerText!: string;

  cpOutputId!: number;
  cpOutputName!: string;
  resultLinkId!: number;
  interventionId!: number;
  canChangeCPOutput = false;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {resultLink, interventionId, canChangeCpOp}: any = data;
    if (resultLink) {
      this.cpOutputId = resultLink.cp_output;
      this.selectedCpOutput = Number(resultLink.cp_output);
      this.cpOutputName = resultLink.cp_output_name;
      this.selectedIndicators = [...(resultLink.ram_indicators || [])];
      this.resultLinkId = resultLink.id;
    }
    this.interventionId = interventionId;
    this.canChangeCPOutput = canChangeCpOp;
    this.loadEWPOutputs(this.interventionId);
  }

  get dialogTitle(): string {
    let title = '';
    if (this.cpOutputName) {
      title = this.canChangeCPOutput
        ? getTranslation('EDIT_CP_OUTPUT')
        : getTranslation('INDICATORS_FOR_CP_OUTPUT') + this.cpOutputName;
    } else {
      title = getTranslation('ADD_CP_OUTPUT');
    }
    return title;
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
      </style>
      <etools-dialog
        size="md"
        keep-dialog-open
        dialog-title="${this.dialogTitle}"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <div class="row">
          ${!this.cpOutputId || this.canChangeCPOutput
            ? html`
                <div class="col-12">
                  <etools-dropdown
                    class="validate-input"
                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                      this.onCpOutputSelected(detail.selectedItem)}"
                    ?trigger-value-change-event="${!this.loadingInProcess}"
                    .selected="${this.selectedCpOutput}"
                    ?readonly="${!!this.cpOutputId}"
                    label=${translate('CP_OUTPUT')}
                    placeholder="&#8212;"
                    .options="${this.cpOutputs}"
                    option-label="name"
                    option-value="id"
                    allow-outside-scroll
                    dynamic-align
                    required
                    ?invalid="${this.errors.cp_output}"
                    .errorMessage="${this.errors.cp_output && this.errors.cp_output[0]}"
                    @focus="${() => this.resetFieldError('cp_output')}"
                    @click="${() => this.resetFieldError('cp_output')}"
                  ></etools-dropdown>
                </div>
              `
            : html``}
          <div class="col-12">
            <etools-dropdown-multi
              class="validate-input disabled-as-readonly"
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.onIndicatorsSelected(detail.selectedItems)}"
              ?trigger-value-change-event="${!this.loadingInProcess}"
              .selectedValues="${this.selectedIndicators}"
              label=${translate('RAM_INDICATORS')}
              placeholder="&#8212;"
              .options="${this.indicators}"
              option-label="name"
              option-value="id"
              allow-outside-scroll
              dynamic-align
              ?invalid="${this.errors.ram_indicators}"
              ?disabled="${!this.selectedCpOutput}"
              .errorMessage="${this.errors.ram_indicators && this.errors.ram_indicators[0]}"
              @focus="${() => this.resetFieldError('ram_indicators')}"
              @click="${() => this.resetFieldError('ram_indicators')}"
            ></etools-dropdown-multi>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  onIndicatorsSelected(data: GDDResultIndicator[]) {
    const newIndicators = data.map(({id}: GDDResultIndicator) => id);
    if (!areEqual(this.selectedIndicators, newIndicators)) {
      this.selectedIndicators = newIndicators;
    }
  }

  onCpOutputSelected(cpOutput: any) {
    if (this.selectedCpOutput !== Number(cpOutput.id)) {
      this.selectedCpOutput = Number(cpOutput.id);
      this.selectedIndicators = [];
      console.log(cpOutput);
      this.loadRamIndicators(cpOutput.cp_output_id);
    }
  }

  resetFieldError(field: string) {
    if (!this.errors[field]) {
      return;
    }
    delete this.errors[field];
    this.requestUpdate();
  }

  processRequest() {
    if (!this.cpOutputId && !this.selectedCpOutput) {
      this.errors.cp_output = [getTranslation('GENERAL.REQUIRED_FIELD')];
      this.requestUpdate();
      return;
    }
    this.spinnerText = getTranslation('GENERAL.SAVING_DATA');
    this.loadingInProcess = true;
    const endpoint = this.cpOutputId
      ? getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.resultLinkGetDelete, {
          interventionId: this.interventionId,
          result_link: this.resultLinkId
        })
      : getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.resultLinks, {
          id: this.interventionId
        });
    const method = this.cpOutputId ? 'PATCH' : 'POST';
    const body: GenericObject<any> = {ram_indicators: this.selectedIndicators};
    if (!this.cpOutputId || this.cpOutputId !== this.selectedCpOutput) {
      body.cp_output = this.selectedCpOutput;
    }
    sendRequest({
      endpoint,
      body,
      method
    })
      .then(() =>
        getStore()
          .dispatch<AsyncAction>(getIntervention(String(this.interventionId)))
          .catch(() => Promise.resolve())
      )
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: formatServerErrorAsText(error)});
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  private loadRamIndicators(cpOutputId?: number): void {
    if (!cpOutputId) {
      this.indicators = [];
      return;
    }
    this.spinnerText = getTranslation('GENERAL.LOADING');
    this.loadingInProcess = true;
    sendRequest({
      endpoint: getEndpoint(gddEndpoints.ramIndicators, {id: cpOutputId})
    }).then((data: GDDResultIndicator[]) => {
      this.loadingInProcess = false;
      this.indicators = data;
    });
  }

  loadEWPOutputs(id: number) {
    if (id) {
      const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.ewpOutputs, {
        gddId: id
      });

      sendRequest({
        endpoint
      }).then((cpOutputs: any[]) => {
        this.cpOutputs = [...cpOutputs];
        // temporary until we refactor cp_output object on gdd response to ewp_output_id, cp_output_id.
        // Now cp_output is actually ewp_output_id
        const selectedCpOuputObject = this.cpOutputs.find((x: any) => x.id === this.cpOutputId);
        if (selectedCpOuputObject) {
          this.loadRamIndicators(selectedCpOuputObject.cp_output_id);
        }
      });
    } else {
      this.cpOutputs = [];
    }
  }
}
