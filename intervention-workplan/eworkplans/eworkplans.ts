import {LitElement, TemplateResult, html, CSSResultArray} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import {AnyObject, AsyncAction} from '@unicef-polymer/etools-types';
import {EWorkPlan, RootState} from '../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getEWorkPlan, patchIntervention} from '../../common/actions/gddInterventions';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {selectPdEWorkplans, selectPdEWorkplansPermissions} from './eworkplans.selectors';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {GDDPdEWorkplans} from './eworkplans.models';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {GDD_TABS} from '../../common/constants';

@customElement('gdd-eworkplans')
export class GDDEWorkplans extends ComponentBaseMixin(connectStore(LitElement)) {
  errors: any;
  static get styles(): CSSResultArray {
    // language=CSS
    return [layoutStyles];
  }

  @property() interventionId!: number;

  @property({type: Array})
  e_workplans: AnyObject[] = [];

  @property({type: Array})
  allEWorkplans!: EWorkPlan[];

  @property({type: Object})
  originalData!: GDDPdEWorkplans;

  @property({type: Object})
  data!: GDDPdEWorkplans;

  render(): TemplateResult {
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
      </style>
      
      <etools-content-panel class="content-section" panel-title="${translate('E_WORKPLANS')}">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
            <div class="col-md-4 col-12">
                <etools-dropdown-multi
                id="e_workplans"
                label=${translate('E_WORKPLANS')}
                .options="${this.e_workplans}"
                class="w100"
                option-label="name"
                option-value="id"
                .selectedValues="${this.e_workplans.length ? this.data?.e_workplans : null}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.e_workplans)}"
                ?required="${this.permissions?.required.e_workplans}"
                @etools-selected-items-changed="${({detail}: CustomEvent) =>
                  this.selectedItemsChanged(detail, 'e_workplans')}"
                trigger-value-change-event
                >
            </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', GDD_TABS.Workplan)) {
      return;
    }

    this.data = cloneDeep(selectPdEWorkplans(state));
    this.originalData = cloneDeep(this.data);

    if (!isJsonStrMatch(this.allEWorkplans, state.gddInterventions?.eWorkPlans)) {
      this.allEWorkplans = [...(state.gddInterventions?.eWorkPlans || [])];

      this.populateEWorkplans();
    }

    this.permissions = selectPdEWorkplansPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    super.stateChanged(state);
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

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention({e_workplans: this.data.e_workplans || []}))
      .then(() => {
        this.editMode = false;
      });
  }
}
