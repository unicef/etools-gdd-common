import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import './attachments-list/attachments-list';
import './prc-document/prc-document';
/**
 * @customElement
 */
@customElement('gdd-intervention-attachments')
export class GDDInterventionAttachments extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        :host {
          --ecp-title-white-space: wrap;
        }
      </style>
      <gdd-attachments-list></gdd-attachments-list>
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
}
