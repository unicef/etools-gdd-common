import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import './partner-details/partner-info';
import './details-overview/details-overview';
import './unicef-details/unicef-details';
import './amendments/pd-amendments';
import './fund-reservations/fund-reservations';
import './review-and-sign/review-and-sign';
import './other/other';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../common/types/store.types';
import {GDDPermissionsFields, Permission} from '@unicef-polymer/etools-types';
import {currentInterventionPermissions, currentPage, currentSubpage} from '../common/selectors';
import {selectDatesAndSignaturesPermissions} from '../common/managementDocument.selectors';
import './financial/financial-component';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';

/**
 * @customElement
 */
export class GDDInterventionMetadata extends connectStore(LitElement) {
  @property({type: Object})
  permissions!: Permission<GDDPermissionsFields>;

  @property() showSignatureAndDates = false;

  render() {
    // language=HTML
    return html`
      <style></style>

      <gdd-details-overview></gdd-details-overview>
      <gdd-partner-info></gdd-partner-info>
      <gdd-unicef-details></gdd-unicef-details>
      <gdd-financial-component></gdd-financial-component>
      ${this.permissions?.view!.frs ? html`<gdd-fund-reservations></gdd-fund-reservations>` : ''}
      ${this.permissions?.view!.amendments ? html`<gdd-pd-amendments></gdd-pd-amendments>` : ''}
      ${this.showSignatureAndDates ? html`<gdd-review-and-sign></gdd-review-and-sign>` : ''}
      <gdd-other-metadata></gdd-other-metadata>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'gdd-interv-page'
    });
  }

  stateChanged(state: RootState): void {
    if (
      currentPage(state) !== 'gdd-interventions' ||
      currentSubpage(state) !== 'metadata' ||
      !state.gddInterventions.current
    ) {
      return;
    }
    this.permissions = currentInterventionPermissions(state);
    if (this.permissions) {
      this.setShowSignatureAndDates(state);
    }
  }

  setShowSignatureAndDates(state: RootState) {
    const viewPerm = selectDatesAndSignaturesPermissions(state)?.view;
    this.showSignatureAndDates = Object.values(viewPerm).some((perm) => perm === true);
  }
}

window.customElements.define('gdd-intervention-metadata', GDDInterventionMetadata);
