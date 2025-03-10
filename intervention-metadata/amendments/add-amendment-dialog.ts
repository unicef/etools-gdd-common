import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-warn-message';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject, EtoolsEndpoint, GDDAmendment, LabelAndValue} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {AmendmentsKind} from './pd-amendments.models';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin.js';
import {resetInvalidElement} from '../../utils/utils';

/**
 * @customElement
 */
@customElement('gdd-add-amendment-dialog')
export class GDDAddAmendmentDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`${sharedStyles}
      <style>
        etools-input#other {
          width: 100%;
        }
        .row-h {
          padding-top: 0 !important;
          padding-bottom: 16px;
          overflow: hidden !important;
        }
        .row {
          margin: 0 9px !important;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="add-amendment"
        size="md"
        ok-btn-text="${translate('GENERAL.SAVE')}"
        dialog-title=${translate('ADD_AMENDMENT')}
        @close="${() => this.onClose()}"
        @confirm-btn-clicked="${() => this._validateAndSaveAmendment()}"
        ?show-spinner="${this.savingInProcess}"
      >
        ${this.renderKindDropdown()}
        <div class="row">
          <!-- Amendment Type -->
          <etools-dropdown-multi
            class="col-12"
            id="amendment-types"
            label="${translate('AMENDMENT_TYPES')}"
            placeholder="&#8212;"
            .options="${this.amendmentTypes}"
            .selectedValues="${this.data.types}"
            hide-search
            required
            option-label="label"
            option-value="value"
            error-message="${translate('TYPE_ERR')}"
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) => {
              this.selectedItemsChanged(detail, 'types', 'value');
              this.onTypesChanged();
            }}"
            @focus="${(event: any) => resetInvalidElement(event)}"
          >
          </etools-dropdown-multi>
        </div>
        <div class="row" ?hidden="${!this.data.types || !this.data.types!.length}">
          <etools-warn-message-lit class="col-12" .messages="${this.warnMessages}"></etools-warn-message-lit>
        </div>
        </div>
        <div class="row" ?hidden="${!this.showOtherInput}">
          <etools-input
            class="col-12"
            id="other"
            placeholder="&#8212;"
            label="${translate('OTHER')}"
            invalid
            ?required="${this.showOtherInput}"
            auto-validate
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
            .value="${this.data.other_description}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_description')}"
            @focus="${(event: any) => resetInvalidElement(event)}"
          >
          </etools-input>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Boolean}) savingInProcess = false;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  // @property({type: Array})
  // amendmentKinds: LabelAndValue[] = [
  //   {
  //     label: getTranslation(AmendmentsKindTranslateKeys[AmendmentsKind.normal]),
  //     value: AmendmentsKind.normal
  //   },
  //   {
  //     label: getTranslation(AmendmentsKindTranslateKeys[AmendmentsKind.contingency]),
  //     value: AmendmentsKind.contingency
  //   }
  // ];

  @property({type: Boolean})
  showOtherInput = false;

  @property({type: Array})
  warnMessages: string[] = [];

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    this.data = {other_description: '', types: []};
    const {intervention, amendmentTypes} = data;
    this.intervention = intervention;
    this.amendmentTypes = amendmentTypes;
  }

  onTypesChanged() {
    this.showOtherInput = this.data.types ? this.data.types.indexOf('other') > -1 : false;
    this.warnMessages = this._getSelectedAmendmentTypeWarning(this.data.types);
  }

  _getSelectedAmendmentTypeWarning(types: string[] | undefined) {
    if (!types || !types.length) {
      return [];
    }
    const messages: string[] = [];
    types.forEach((amdType: string) => {
      switch (amdType) {
        case 'admin_error':
          messages.push(getTranslation('ADMIN_ERR_MSG'));
          break;
        case 'budget_lte_20':
          messages.push(getTranslation('BUDGET_LTE_20_MSG'));
          break;
        case 'budget_gt_20':
          messages.push(getTranslation('BUDGET_GT_20_MSG'));
          break;
        case 'no_cost':
          messages.push(getTranslation('NO_COST_EXTENSION_MSG'));
          break;
        case 'change':
          messages.push(getTranslation('CHANGE_MSG'));
          break;
        case 'other':
          messages.push(getTranslation('OTHER'));
          break;
      }
    });
    return messages;
  }

  _validateAndSaveAmendment() {
    if (!validateRequiredFields(this)) {
      return;
    }
    this._saveAmendment(this.data);
  }

  _saveAmendment(newAmendment: Partial<GDDAmendment>) {
    const options = {
      method: 'POST',
      endpoint: getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.interventionAmendmentAdd, {
        intervId: this.intervention.id
      }),
      body: {
        ...newAmendment,
        kind: AmendmentsKind.normal
      }
      // body: newAmendment
    };
    this.savingInProcess = true;
    sendRequest(options)
      .then((resp: GDDAmendment) => {
        this._handleResponse(resp);
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
      })
      .finally(() => {
        this.savingInProcess = false;
      });
  }

  _handleResponse(_response: GDDAmendment) {
    this.onClose({id: _response.amended_gdd});
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this);
  }

  public onClose(response = {}) {
    fireEvent(this, 'dialog-closed', {response});
  }

  public renderKindDropdown() {
    return '';
    // return html`
    //   <div class="row-h flex-c">
    //     <!-- Amendment kind -->
    //     <etools-dropdown
    //       id="amendment-kind"
    //       label=${translate('KIND')}
    //       placeholder="&#8212;"
    //       .options="${this.amendmentKinds}"
    //       .selectedValue="${this.data.kind}"
    //       hide-search
    //       required
    //       option-label="label"
    //       option-value="value"
    //       error-message=${translate('GENERAL.REQUIRED_FIELD')}
    //       trigger-value-change-event
    //       @etools-selected-item-changed="${({detail}: CustomEvent) => {
    //         this.selectedItemChanged(detail, 'kind', 'value');
    //       }}"
    //     >
    //     </etools-dropdown>
    //   </div>
    // `;
  }
}
