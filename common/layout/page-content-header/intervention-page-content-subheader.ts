import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * @LitElement
 * @customElement
 */
@customElement('gdd-intervention-page-content-subheader')
export class GDDInterventionPageContentSubheader extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: flex;
          flex-direction: column;

          background-color: var(--primary-background-color);
          border-bottom: 1px solid var(--dark-divider-color);
        }

        .content-subheader-row {
          display: flex;
          flex-direction: column;
        }

        @media print {
          :host {
            padding: 0;
            border-bottom: none;
            min-height: 0 !important;
            margin-bottom: 16px;
          }
        }

        @media (max-width: 576px) {
          :host {
            padding: 0 5px;
          }
        }
      </style>

      <div class="content-subheader-row">
        <slot></slot>
      </div>
    `;
  }
}
