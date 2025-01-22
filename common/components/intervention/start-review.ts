import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {NON_PRC_REVIEW} from './review.const';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';

/**
 * @LitElement
 * @customElement
 */
@customElement('gdd-start-review')
export class GDDStartReview extends connectStore(LitElement) {
  @property() type = NON_PRC_REVIEW;

  render() {
    return html`
      ${sharedStyles}
      <style>
        .content {
          margin-top: 16px;
          padding-inline-start: 24px;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        ok-btn-text="${translate('START')}"
        dialog-title="${translate('SEND_FOR_REVIEW')}"
        @confirm-btn-clicked="${() => this.startReview()}"
      >
        <div class="content">${translate('CONFIRM_REVIEW_START')}</div>
      </etools-dialog>
    `;
  }

  startReview(): void {
    fireEvent(this, 'dialog-closed', {
      confirmed: true,
      response: this.type
    });
  }
}
