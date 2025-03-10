import {LitElement, html, CSSResultArray, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {GDDReview} from '@unicef-polymer/etools-types';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from '../../common/components/intervention/review.const';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '../../common/components/intervention/review-checklist-popup';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

@customElement('gdd-overall-approval')
export class GDDOverallApproval extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      css`
        :host {
          margin-top: 24px;
          --list-row-wrapper-padding: 0;
          --list-row-wrapper-padding-inline: 0;
        }
        .no-approval {
          padding: 16px 24px;
        }

        .label {
          font-size: var(--etools-font-size-12, 12px);
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .answer,
        .value {
          font-size: var(--etools-font-size-16, 16px);
          line-height: 24px;
          color: var(--primary-text-color);
          word-break: break-word;
        }
        .info-block {
          margin-inline-end: 1.5rem;
          min-width: 110px;
        }
        etools-data-table-row::part(edt-list-row-wrapper):hover {
          background-color: var(--primary-background-color);
        }
        .multiline {
          white-space: pre-line;
        }
        .answer:not(:last-of-type) {
          margin-bottom: 20px;
        }
        .row.row-padding {
          padding: 16px 24px;
        }
      `
    ];
  }

  @property() review!: GDDReview;
  @property() readonly = false;

  render(): TemplateResult {
    return html`
      ${sharedStyles}
      <etools-content-panel class="content-section" panel-title=${translate('OVERALL_REVIEW')}>
        <div slot="panel-btns" ?hidden="${this.readonly}">
          <etools-icon-button name="create" @click="${() => this.openReviewPopup()}"></etools-icon-button>
        </div>
        <etools-data-table-row class="overall-row" no-collapse details-opened>
          <div slot="row-data">
            <div class="row row-padding">
              <div class="col-10">
                <div class="label">${translate('REVIEW_DATE_PRC')}</div>
                <div class="value">
                  ${this.review.review_date ? formatDate(this.review.review_date, 'DD MMM YYYY') : '-'}
                </div>
              </div>
              <div class="col-2">
                <div class="label">${translate('APPROVED_BY_PRC')}</div>
                <div class="value">
                  ${typeof this.review.overall_approval === 'boolean'
                    ? html` <etools-icon name="${this.review.overall_approval ? 'check' : 'close'}"></etools-icon>`
                    : '-'}
                </div>
              </div>
            </div>
            <div class="row row-padding">
              <div class="col-12 label">${translate('SIGN_BUDGET_OWNER')}</div>
              <div class="col-12 value">
                ${typeof this.review.is_recommended_for_approval === 'boolean'
                  ? html` <etools-icon
                      name="${this.review.is_recommended_for_approval ? 'check' : 'close'}"
                    ></etools-icon>`
                  : '-'}
              </div>
            </div>
            <div class="row row-padding">
              <div class="col-12 label">${translate('APPROVAL_COMMENT')}</div>
              <div class="col-12 value">${this.review?.overall_comment || '-'}</div>
            </div>
            <div class="row row-padding">
              <div class="col-12 label">${translate('ACTIONS_LIST')}</div>
              <div class="col-12 value multiline">${this.review?.actions_list || '-'}</div>
            </div>
            <div class="row row-padding">
              ${Object.entries(REVIEW_QUESTIONS).map(
                ([field]: [string, string], index: number) => html`
                  <label class="col-12 label">Q${index + 1}: ${translateValue(field, 'GDD_REVIEW_QUESTIONS')}</label>
                  <div class="col-12 answer">
                    ${translateValue(
                      REVIEW_ANSVERS.get(String(this.review[field as keyof GDDReview])) || '-',
                      'REVIEW_ANSWERS'
                    )}
                  </div>
                `
              )}
            </div>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  openReviewPopup() {
    openDialog({
      dialog: 'gdd-review-checklist-popup',
      dialogData: {
        isOverall: true
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
  }
}
