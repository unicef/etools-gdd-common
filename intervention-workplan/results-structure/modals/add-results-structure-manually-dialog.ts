import {LitElement, html, TemplateResult} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../../utils/intervention-endpoints';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getEWorkPlan, getIntervention, patchIntervention} from '../../../common/actions/gddInterventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import {AsyncAction, GDDResultIndicator, GenericObject, EtoolsEndpoint, AnyObject} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store} from '../../../../../../../../redux/store';
import {EWorkPlan, RootState} from '../../../common/types/store.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectPdUnicefDetails} from '../../../intervention-metadata/unicef-details/pdUnicefDetails.selectors';

@customElement('gdd-add-results-structure-manually-dialog')
export class GDDAddResultsStructureManuallyDialog extends connect(store)(LitElement) {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;

  @property() errors: GenericObject<any> = {};
  @property({type: String}) spinnerText!: string;

  @property({type: Array})
  e_workplans: AnyObject[] = [];

  @property({type: Array})
  allEWorkplans!: EWorkPlan[];

  interventionId!: number;

  @property({type: Object})
  data: any;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {interventionId}: any = data;
    this.interventionId = interventionId;
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
        dialog-title="${translate('GDD_ADD_EWORKPLANS')}"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <div class="row">
          <div class="col-12">
            <etools-dropdown-multi
              id="e_workplans"
              label=${translate('E_WORKPLANS')}
              .options="${this.e_workplans}"
              class="w100"
              option-label="name"
              option-value="id"
              .selectedValues="${this.e_workplans.length ? this.data.e_workplans : null}"
           
              @etools-selected-items-changed="${({detail}: CustomEvent) => this.eWorkplansChanged(detail)}"
              trigger-value-change-event
            >
          </etools-dropdown-multi>
        </div>
      </etools-dialog>
    `;
  }

  /*
  
     ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.e_workplans)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.e_workplans) ? -1 : undefined}"
              ?required="${this.permissions?.required.e_workplans}"
  * */

  stateChanged(state: RootState) {
    this.data = cloneDeep(selectPdUnicefDetails(state));

    if (!isJsonStrMatch(this.allEWorkplans, state.gddInterventions?.eWorkPlans)) {
      this.allEWorkplans = [...(state.gddInterventions?.eWorkPlans || [])];

      this.populateEWorkplans();
    }
  }

  populateEWorkplans() {
    if (this.data.country_programme) {
      const foundWorkPlan = (this.allEWorkplans || [])[this.data.country_programme] as any;
      if (foundWorkPlan) {
        this.e_workplans = [...foundWorkPlan];
        return;
      }
      getStore().dispatch<AsyncAction>(getEWorkPlan(this.data.country_programme));
    } else {
      this.e_workplans = [];
    }
  }

  eWorkplansChanged(details: any) {
    this.data.e_workplans = details.selectedItems.map((x: any) => x.id);
  }

  resetFieldError(field: string) {
    if (!this.errors[field]) {
      return;
    }
    delete this.errors[field];
    this.requestUpdate();
  }

  processRequest() {
    this.spinnerText = getTranslation('GENERAL.SAVING_DATA');
    this.loadingInProcess = true;

    return getStore()
      .dispatch<AsyncAction>(
        patchIntervention({
          e_workplans: this.data.e_workplans
        })
      )
      .then(() =>
        getStore()
          .dispatch<AsyncAction>(getIntervention(String(this.interventionId)))
          .catch(() => Promise.resolve())
      )
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        this.loadingInProcess = false;
        this.errors = (error && error.response) || {};
        fireEvent(this, 'toast', {text: formatServerErrorAsText(error)});
      });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
