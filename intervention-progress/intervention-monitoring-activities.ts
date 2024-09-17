import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {translate} from 'lit-translate';
import get from 'lodash-es/get';
import {RootState} from '../common/types/store.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import './monitoring-visits-list';
import {GDD_TABS} from '../common/constants';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';

@customElement('gdd-intervention-monitoring-activities')
export class GDDInterventionMonitoringActivities extends connectStore(LitElement) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <etools-content-panel
        id="monitoring-visits-panel"
        class="content-section"
        panel-title=${translate('MONITORING_ACTIVITIES_SUBTAB')}
      >
        <gdd-monitoring-visits-list
          .interventionId="${this.intervention?.id}"
          .partnerId="${this.intervention?.partner_id}"
        >
        </gdd-monitoring-visits-list>
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  intervention!: Intervention;

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(
        get(state, 'app.routeDetails'),
        'gdd-interventions',
        GDD_TABS.MonitoringActivities
      )
    ) {
      return;
    }

    if (get(state, 'gddInterventions.current')) {
      this.intervention = cloneDeep(get(state, 'gddInterventions.current'));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'gdd-interv-page'
    });
  }
}
