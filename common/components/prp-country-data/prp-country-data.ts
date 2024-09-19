import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
// eslint-disable-next-line max-len
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {setPrpCountries} from '../../actions/gddInterventions';
import get from 'lodash-es/get';
import {gddEndpoints} from '../../../utils/intervention-endpoints';

@customElement('gdd-prp-country-data')
export class GDDPrpCountryData extends EndpointsLitMixin(LitElement) {
  getPRPCountries() {
    if (!(get(getStore().getState(), 'commonData.PRPCountryData') || []).length) {
      this.fireRequest(gddEndpoints, 'getPRPCountries', {}).then((prpCountries: any[]) => {
        getStore().dispatch(setPrpCountries(prpCountries));
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (!window.location.href.includes('/government/')) {
      this.getPRPCountries();
    }
  }
}
