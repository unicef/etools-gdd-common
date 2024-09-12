import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import './workplan-editor-link';
import '../common/budget-summary/budget-summary';
import {TABS} from '../common/constants';
import {translate} from 'lit-translate';
import './editor-table';

/**
 * @customElement
 */
@customElement('gdd-intervention-workplan-editor')
export class GDDInterventionWorkplanEditor extends LitElement {
  @property() interventionId!: number;
  render() {
    // language=HTML
    return html`
      <div class="top-card">
        <gdd-workplan-editor-link link="interventions/${this.interventionId}/${TABS.Workplan}">
          ${translate('BACK_TO_WORKPLAN')}
        </gdd-workplan-editor-link>

        <gdd-budget-summary embeded></gdd-budget-summary>
      </div>
      <gdd-editor-table></gdd-editor-table>
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

  static get styles() {
    // language=css
    return css`
      .top-card {
        background-color: var(--primary-background-color);
        padding: 20px 22px 1px 22px;
      }
    `;
  }
}
