import {LitElement, html, TemplateResult} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getIntervention, patchIntervention} from '../../../common/actions/gddInterventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import {AsyncAction, GenericObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {RootState} from '../../../common/types/store.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectPdUnicefDetails} from '../../../intervention-metadata/unicef-details/pdUnicefDetails.selectors';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import '@shoelace-style/shoelace/dist/components/tree/tree.js';
import '@shoelace-style/shoelace/dist/components/tree-item/tree-item.js';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {gddEndpoints} from '../../../utils/intervention-endpoints';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';
import {repeat} from 'lit/directives/repeat.js';

@customElement('gdd-sync-results-structure-dialog')
export class GDDSyncResultsStructureDialog extends connectStore(LitElement) {
  @property() dialogOpened = true;
  @property() loadingInProcess = false;

  @property() errors: GenericObject<any> = {};
  @property({type: String}) spinnerText!: string;

  interventionId!: number;

  @property({type: Object})
  data: any;

  @state()
  resultsStructure: any;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {interventionId}: any = data;
    this.interventionId = interventionId;
    this.getResultsStructureToSync();
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
        .tree-selectable {
          --indent-guide-width: 1px;
        }
        .tree-item-cpoutput::part(item) {
            background-color: #a6dbff;
        }
        .tree-item-keyintervention::part(item) {
            background-color: #ccebff;
        }
        .tree-item-activity::part(item) {
            background-color: #fdf0d2;
        }
        etools-dialog::part(body) {
          padding: 0 !important;
        }
        .heading {
            font-size: var(--etools-font-size-12, 12px);
            line-height: 16px;
            color: var(--secondary-text-color);
        }
      </style>
      <etools-dialog
        size="lg"
        no-padding
        keep-dialog-open
        dialog-title="${translate('GDD_SYNC_RESULTS_STRUCTURE')}"
        @confirm-btn-clicked="${() => this.processRequest()}"
        @close="${this.onClose}"
        ?show-spinner="${this.loadingInProcess}"
        spinner-text="${this.spinnerText}"
        ok-btn-text=${translate('GENERAL.SYNC')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <div>
           <sl-tree class="tree-selectable" selection="multiple" @sl-selection-change="${this.selectionChange.bind(this)}">
            ${repeat(
              this.resultsStructure || [],
              (cpoutput: any) => cpoutput.id,
              (cpoutput, cpoutputIndex) =>
                html`<sl-tree-item ?selected=${cpoutput.selected} class="tree-item-cpoutput" .value="${cpoutput}">
                  <div>
                    <div class="heading">Country Programme Output</div>
                    <strong>${cpoutputIndex + 1}</strong>. ${cpoutput.cp_output_name} - ${cpoutput.id}
                  </div>
                  <sl-tree-item
                    ?hidden="${!cpoutput.ewp_key_interventions?.length}"
                    ?selected=${cpoutput.selected}
                    class="tree-item-keyintervention"
                  >
                    <div>Key Interventions</div>
                    ${repeat(
                      cpoutput.ewp_key_interventions || [],
                      (keyintervention: any) => keyintervention.id,
                      (keyintervention, keyinterventionIndex) =>
                        html`<sl-tree-item
                          ?selected=${keyintervention.selected}
                          class="tree-item-keyintervention"
                          .value="${keyintervention}"
                        >
                          <div>
                            <div class="heading">Key Intervention</div>
                            <strong>${cpoutputIndex + 1}</strong>.<strong>${keyinterventionIndex + 1}</strong>.
                            ${keyintervention.name} - ${keyintervention.id}
                          </div>
                          ${repeat(
                            keyintervention.ewp_activities || [],
                            (activity: any) => activity.id,
                            (activity, activityIndex) =>
                              html`<sl-tree-item
                                ?selected=${activity.selected}
                                class="tree-item-activity"
                                .value="${activity}"
                                ><div>
                                  <div class="heading">Activity</div>
                                  <div>
                                    <strong>${cpoutputIndex + 1}</strong>.<strong>${keyinterventionIndex +
                                    1}</strong>.<strong>${activityIndex + 1}</strong>.
                                    ${activity.title} - ${activity.id}
                                  </div>
                                  <div><small>${activity.description}</small></div>
                                </div></sl-tree-item
                              >`
                          )}
                        </sl-tree-item>`
                    )}
                  </sl-tree-item>
                  <sl-tree-item
                    ?hidden="${!cpoutput.ram_indicators?.length}"
                    ?selected=${cpoutput.selected}
                    class="tree-item-keyintervention"
                  >
                    <div>RAM Indicators</div>
                    ${repeat(
                      cpoutput.ram_indicators || [],
                      (ram_indicator: any) => ram_indicator.id,
                      (ram_indicator, _ramIndicatorIndex) =>
                        html`<sl-tree-item
                          ?selected=${ram_indicator.selected}
                          class="tree-item-ramindicator"
                          .value="${ram_indicator}"
                          ><div>
                            <div class="heading">RAM Indicator</div>
                            <div>${ram_indicator.name} - ${ram_indicator.id}</div>
                          </div></sl-tree-item
                        >`
                    )}
                  </sl-tree-item>
                </sl-tree-item>`
            )}
        </div>
      </etools-dialog>
    `;
  }

  stateChanged(state: RootState) {
    this.data = cloneDeep(selectPdUnicefDetails(state));
  }

  selectionChange(e: any) {
    const selection = e.detail.selection.reduce((acc: any[], item: any) => {
      const x = item.value;

      // Skipp all items that don't have value, because they are just dummy placeholders in ui.
      if (!x) {
        return acc;
      }

      if (x.isCpOutput) {
        if (!acc.find((y) => y.id === x.id)) {
          acc.push({id: x.id, ewp_key_interventions: [], ram_indicators: []});
        }
      }

      if (x.isRamIndicator) {
        let cp_output = acc.find((y) => y.id === x.cp_output);
        if (!cp_output) {
          cp_output = {id: x.cp_output, ewp_key_interventions: [], ram_indicators: []};
          acc.push(cp_output);
        }
        cp_output.ram_indicators.push(x.id);
      }

      if (x.isKeyIntervention) {
        let cp_output = acc.find((y) => y.id === x.cp_output);
        if (!cp_output) {
          cp_output = {id: x.cp_output, ewp_key_interventions: [], ram_indicators: []};
          acc.push(cp_output);
        }
        cp_output.ewp_key_interventions.push({id: x.id, ewp_activites: []});
      }

      if (x.isActivity) {
        let cp_output = acc.find((y) => y.id === x.cp_output);
        if (!cp_output) {
          cp_output = {id: x.cp_output, ewp_key_interventions: [], ram_indicators: []};
          acc.push(cp_output);
        }

        let key_intervention = cp_output.ewp_key_interventions.find((y: any) => y.id === x.key_intervention);
        if (!key_intervention) {
          key_intervention = {id: x.key_intervention, ewp_activities: []};
          cp_output.ewp_key_interventions.push(key_intervention);
        }
        key_intervention.ewp_activites.push(x.id);
      }

      return acc;
    }, []);

    console.log(selection);
  }

  getResultsStructureToSync() {
    this.loadingInProcess = true;
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.getSyncResultsStructure, {
      interventionId: this.interventionId
    });
    _sendRequest({
      method: 'GET',
      endpoint: endpoint
    })
      .then((result_links) => {
        this.resultsStructure = result_links.map((x: any) => ({
          id: x.id,
          parent: 0,
          isCpOutput: true,
          cp_output_name: x.cp_output_name,
          selected: true,
          ram_indicators: x.ram_indicators.map((y: any) => ({
            ...y,
            cp_output: x.id,
            isRamIndicator: true,
            selected: true
          })),
          ewp_key_interventions: x.ewp_key_interventions.map((y: any) => ({
            id: y.id,
            name: y.name,
            cp_output: x.id,
            isKeyIntervention: true,
            selected: true,
            ewp_activities: y.ewp_activities.map((z: any) => ({
              id: z.id,
              title: z.title,
              description: z.description,
              isActivity: true,
              key_intervention: y.id,
              cp_output: x.id,
              selected: true
            }))
          }))
        }));
        this.loadingInProcess = false;
      })
      .finally(() =>
        fireEvent(this, 'loading', {
          active: false,
          loadingSource: 'gdd-get-sync-results-structure'
        })
      );
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
