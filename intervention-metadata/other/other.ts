import {html, LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {patchIntervention} from '../../common/actions/gddInterventions';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {listenForLangChanged, translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {GDDOtherData, GDDOtherPermissions} from './other.models';
import {selectOtherData, selectOtherPermissions} from './other.selectors';
import {gddTranslatesMap} from '../../utils/intervention-labels-map';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

/**
 * @customElement
 */
@customElement('gdd-other-metadata')
export class GDDOther extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="other" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        .row {
          position: relative;
          display: flex;
          padding: 3px 0;
        }

        .row > * {
          padding-inline-start: 40px;
          box-sizing: border-box;
        }

        sl-switch#confidential {
          margin-top: 25px;
        }

        #iit-confidential {
          margin-top: 20px;
          margin-inline-start: 8px;
        }

        etools-textarea::part(textarea) {
          max-height: 96px;
          overflow-y: auto;
        }
        .confidential-row {
          margin-top: -4px;
          padding-bottom: 12px;
        }
        etools-input {
          width: 100%;
        }
      </style>

      <etools-content-panel show-expand-btn panel-title=${translate('OTHER')} comment-element="other-metadata">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <div class="col-md-4 col-12">
            <etools-dropdown
              id="currencyDd"
              option-value="value"
              option-label="label"
              label=${translate(gddTranslatesMap.currency)}
              placeholder="&#8212;"
              .options="${this.currencies}"
              .selected="${this.data.planned_budget.currency}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.document_currency)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.document_currency) ? -1 : undefined}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (detail === undefined || detail.selectedItem === null) {
                  return;
                }
                this.data.planned_budget.currency = detail.selectedItem ? detail.selectedItem.value : '';
                this.requestUpdate();
              }}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
          <div class="col-md-4 col-12" ?hidden="${!this.permissions?.view?.confidential}">
            <sl-switch
              id="confidential"
              ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit?.confidential)}"
              ?checked="${this.data.confidential}"
              @sl-change="${(e: CustomEvent) =>
                this.valueChanged({value: (e.target! as SlSwitch).checked}, 'confidential')}}"
            >
              ${translate('CONFIDENTIAL')}
            </sl-switch>
            <info-icon-tooltip
              id="iit-confidential"
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit?.confidential)}"
              .tooltipText="${translate('GDD_CONFIDENTIAL_INFO')}"
            ></info-icon-tooltip>
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Boolean})
  autoValidate = false;

  @property({type: Object})
  originalData!: GDDOtherData;

  @property({type: Object})
  data!: GDDOtherData;

  @property({type: Object})
  permissions!: Permission<GDDOtherPermissions>;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  documentTypes: LabelAndValue[] = [];

  @property({type: Array})
  currencies!: LabelAndValue[];

  @property({type: Boolean})
  autoValidateProtocol = false;

  constructor() {
    super();
    listenForLangChanged(this.handleLanguageChanged.bind(this));
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('editMode') && !this.editMode) {
      // reset validation for #unppNumber field
      const elem = this.shadowRoot?.querySelector<EtoolsInput>('#unppNumber')!;
      if (elem) {
        elem.invalid = false;
      }
    }
  }
  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', 'metadata')) {
      return;
    }
    if (!state.gddInterventions.current) {
      return;
    }
    if (!isJsonStrMatch(this.currencies, state.commonData!.currencies)) {
      this.currencies = [...state.commonData!.currencies];
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.documentTypes)) {
      this.documentTypes = [
        ...state.commonData!.documentTypes.map((x: any) => ({
          ...x,
          label: getTranslatedValue(x.label, 'ITEM_TYPE')
        }))
      ];
    }
    this.data = selectOtherData(state);
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  handleLanguageChanged() {
    this.documentTypes = [
      ...getStore()
        .getState()
        .commonData!.documentTypes.map((x: any) => ({
          ...x,
          label: getTranslatedValue(x.label, 'ITEM_TYPE')
        }))
    ];
  }

  private setPermissions(state: any) {
    this.permissions = selectOtherPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.cleanUp(cloneDeep(this.data))))
      .then(() => {
        this.editMode = false;
      });
  }

  /**
   * Backend errors out otherwise
   */
  cleanUp(data: GDDOtherData) {
    if (!data || !data.planned_budget) {
      return data;
    }
    return this.removeUnchangedData(data);
  }

  removeUnchangedData(data: GDDOtherData) {
    Object.keys(data).forEach((key) => {
      if (key == 'planned_budget') {
        if (!this.permissions.edit.document_currency) {
          // @ts-ignore
          delete data.planned_budget;
        } else {
          data.planned_budget = {
            id: data.planned_budget.id,
            currency: data.planned_budget.currency
          };
        }
      }
      // @ts-ignore
      if (this.originalData[key] == data[key]) {
        // @ts-ignore
        delete data[key];
      }
    });
    return data;
  }
}
