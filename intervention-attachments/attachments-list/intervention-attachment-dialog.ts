import {LitElement, html, TemplateResult, CSSResultArray, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../common/actions/gddInterventions';
import {
  validateRequiredFields,
  resetRequiredFields
} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {IdAndName, GenericObject, ReviewAttachment, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

@customElement('gdd-intervention-attachment-dialog')
export class GDDInterventionAttachmentDialog extends connectStore(LitElement) {
  static get styles(): CSSResultArray {
    // language=css
    return [
      layoutStyles,
      css`
        etools-upload {
          margin-top: 14px;
        }
        etools-checkbox {
          display: block;
          margin-top: 18px;
        }
      `
    ];
  }
  @property() savingInProcess = false;
  @property() data: Partial<ReviewAttachment> = {};

  private interventionId!: number;
  private fileTypes: IdAndName[] = [];
  private errors: GenericObject<any> = {};

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {attachment} = data;
    this.data = attachment ? {...attachment} : {active: true};
  }

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}

      <etools-dialog
        size="md"
        keep-dialog-open
        dialog-title=${translate('ATTACHMENT')}
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <etools-loading ?active="${this.savingInProcess}"></etools-loading>
        <div class="row">
          <div class="col-12">
            <!-- Document Type -->
            <etools-dropdown
              class="validate-input flex-1"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.updateField('type', detail.selectedItem && detail.selectedItem.id)}"
              ?trigger-value-change-event="${!this.savingInProcess}"
              .selected="${this.data?.type}"
              label=${translate('SELECT_DOC_TYPE')}
              placeholder="—"
              .options="${this.fileTypes}"
              option-label="name"
              option-value="id"
              allow-outside-scroll
              dynamic-align
              required
              ?invalid="${this.errors?.type}"
              .errorMessage="${(this.errors?.type && this.errors.type[0]) || translate('GENERAL.REQUIRED_FIELD')}"
              @focus="${() => this.resetFieldError('type', this)}"
              @click="${() => this.resetFieldError('type', this)}"
            ></etools-dropdown>
          </div>
          <div class="col-12">
            <!-- Attachment -->
            <etools-upload
              label=${translate('ATTACHMENT')}
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt,.xml,.xls,.xlt,.xlsx,.xlsm,.xlsb,.xltx,.xltm"
              .showDeleteBtn="${false}"
              ?readonly="${this.data.id}"
              required
              .fileUrl="${this.data && (this.data.attachment || this.data.attachment_document)}"
              .uploadEndpoint="${gddEndpoints.attachmentsUpload.url!}"
              @upload-finished="${(event: CustomEvent) => this.fileSelected(event.detail)}"
              ?invalid="${this.errors?.attachment_document}"
              .errorMessage="${this.errors?.attachment_document && this.errors.attachment_document[0]}"
              @focus="${() => this.resetFieldError('attachment_document', this)}"
              @click="${() => this.resetFieldError('attachment_document', this)}"
            ></etools-upload>
          </div>
          <div class="col-12">
            <etools-checkbox
              ?checked="${!this.data?.active}"
              @sl-change="${(e: any) => this.updateField('active', !e.target.checked)}"
            >
              ${translate('INVALID')}
            </etools-checkbox>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  stateChanged(state: any): void {
    this.interventionId = state.gddInterventions?.current.id;
    this.fileTypes =
      state.commonData.fileTypes.map((x: any) => ({
        ...x,
        name: getTranslatedValue(x.name, 'FILE_TYPES')
      })) || [];
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  updateField(field: keyof ReviewAttachment, value: any): void {
    this.data[field] = value;
  }

  resetFieldError(field: string, el: any): void {
    delete this.errors[field];
    resetRequiredFields(el);
    this.performUpdate();
  }

  protected fileSelected({success}: {success?: any; error?: string}): void {
    if (success) {
      this.data.attachment_document = success.id || null;
      this.data = {...this.data};
    }
  }

  processRequest(): void {
    if (this.savingInProcess) {
      return;
    }
    if (!validateRequiredFields(this)) {
      return;
    }
    this.savingInProcess = true;
    const {id, active, type} = this.data;
    const body = id
      ? {
          id,
          active,
          type
        }
      : {
          attachment_document: this.data.attachment_document,
          active,
          type
        };
    const endpoint = id
      ? getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.updatePdAttachment, {
          id: this.interventionId,
          attachment_id: id
        })
      : getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.pdAttachments, {
          id: this.interventionId
        });
    sendRequest({
      endpoint,
      method: id ? 'PATCH' : 'POST',
      body
    })
      .then((response: any) => {
        getStore().dispatch(updateCurrentIntervention(response.gdd));
        this.onClose();
      })
      .catch((error: any) => {
        this.errors = error.response;
      })
      .finally(() => {
        this.savingInProcess = false;
      });
  }
}
