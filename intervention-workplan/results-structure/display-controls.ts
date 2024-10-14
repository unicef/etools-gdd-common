/* eslint-disable max-len */
import {LitElement, html, TemplateResult, CSSResultArray, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {
  callClickOnEnterPushListener,
  callClickOnSpacePushListener
} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import {GDD_TABS} from '../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import {SlSelectEvent} from '@shoelace-style/shoelace/dist/events/sl-select.js';

export const RESULT_VIEW = 'result_view';
export const BUDGET_VIEW = 'budget_view';
export const COMBINED_VIEW = 'combined_view';

@customElement('gdd-display-controls')
export class GDDDisplayControls extends LitElement {
  @property({type: Boolean, attribute: 'show-inactive-toggle'}) showInactiveToggle = false;
  @property() interventionId!: number | null;

  protected render(): TemplateResult {
    return html`
      <style>
        @media (max-width: 1080px) {
          .editorLink {
            display: none;
          }
        }
      </style>
      <sl-switch id="showInactive" ?hidden="${!this.showInactiveToggle}" @sl-change=${this.inactiveChange}>
        ${translate('SHOW_INACTIVE')}
      </sl-switch>
    `;
  }

  firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    this.shadowRoot!.querySelectorAll('#view-toggle-button, .add-button etools-icon-button, etools-icon').forEach(
      (el) => callClickOnSpacePushListener(el)
    );
    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnEnterPushListener(el));
  }

  inactiveChange(e: CustomEvent): void {
    if (!e.target) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    fireEvent(this, 'show-inactive-changed', {value: element.checked});
  }

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      css`
        :host {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        :host(:not([show-inactive-toggle])) {
          justify-content: flex-end;
        }
        #showInactive {
          margin-inline-end: 8px;
        }
        #view-menu-button {
          display: block;
          height: 32px;
          color: #5c5c5c;
          padding: 0;
          box-sizing: border-box;
        }
        a:focus,
        etools-button:focus {
          box-shadow: rgb(170 165 165 / 40%) 0 0 5px 4px;
        }

        etools-button:focus-visible {
          outline: none !important;
        }

        sl-dropdown sl-menu-item:focus-visible::part(base) {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--sl-color-neutral-1000);
        }

        sl-menu-item::part(base) {
          line-height: 38px;
        }

        sl-menu-item[checked]::part(checked-icon) {
          color: var(--sl-color-primary-600);
          width: 24px;
          visibility: visible;
        }

        sl-menu-item[checked]::part(base) {
          background-color: #dcdcdc;
          color: var(--sl-color-neutral-1000);
        }

        sl-menu-item[checked]:focus-visible::part(base) {
          background-color: #cfcfcf;
        }

        a {
          text-decoration: none;
          margin-inline-start: 16px;
          border-radius: 8px;
          outline: none;
        }
        .editor-link {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          padding: 0 10px;
          border: 1px solid #009688;
          border-radius: 8px;
          color: #009688;
          font-weight: 500;
          font-size: var(--etools-font-size-14, 14px);
          line-height: 16px;
          text-decoration: none;
          box-sizing: border-box;
        }
        svg {
          margin-inline-start: 10px;
        }
        etools-button {
          --sl-input-height-medium: 32px;
          --sl-color-neutral-700: rgb(92, 92, 92);
          --sl-color-neutral-300: rgb(92, 92, 92);
          --sl-input-border-radius-medium: 10px;
          border-radius: 10px;
          --sl-spacing-medium: 12px;
          --sl-color-primary-50: transparent;
          --sl-color-primary-300: rgb(92, 92, 92);
          --sl-color-primary-700: rgb(92, 92, 92);
        }
      `
    ];
  }
}
