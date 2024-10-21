import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../common/budget-summary/budget-summary';
import './supply-agreement/supply-agreement';
import './results-structure/results-structure';
import './effective-efficient-programme-mgmt/effective-efficient-programme-mgmt';
import './non-financial-contribution/non-financial-contribution';
import './hq-contribution/hq-contribution';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @customElement
 */
@customElement('gdd-intervention-workplan')
export class GDDInterventionWorkplan extends LitElement {
  @property() interventionId!: number;
  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          --ecp-title-white-space: normal;
        }
      </style>

      <gdd-budget-summary></gdd-budget-summary>
      <gdd-results-structure></gdd-results-structure>
      <gdd-supply-agreements></gdd-supply-agreements>
    `;
  }

  /* TODO: Remove
      <gdd-effective-and-efficient-programme-management></gdd-effective-and-efficient-programme-management>
      <gdd-hq-contribution></gdd-hq-contribution>
      <gdd-non-financial-contribution></gdd-non-financial-contribution>
  */

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'gdd-interv-page'
    });
  }
}
