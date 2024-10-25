import {LitElement, TemplateResult, html, css, CSSResultArray} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {InterventionQuarter} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

@customElement('gdd-time-intervals')
export class GDDTimeIntervals extends LitElement {
  @property() quarters: InterventionQuarter[] = [];
  @property() selectedTimeFrames: number[] = [];
  @property({type: Boolean, reflect: true, attribute: true}) readonly: boolean | undefined = false;
  @property({type: Boolean}) invalid = false;

  protected render(): TemplateResult | TemplateResult[] {
    return this.quarters.length
      ? html` <style>
            :host([without-popup]) {
              cursor: text;
            }
          </style>
          ${this.quarters.map(
            (quarter: InterventionQuarter) =>
              html`
                <sl-tooltip>
                  <div slot="content">
                    <strong>${quarter.name}:</strong>
                    ${formatDate(quarter.start, 'DD MMM')} - ${formatDate(quarter.end, 'DD MMM')}
                    ${formatDate(quarter.start, 'YYYY')}
                  </div>
                  <div id="quarter_${quarter.id}" class="quarter ${this.isSelected(quarter) ? 'selected' : ''}">
                    ${quarter.name}
                  </div>
                </sl-tooltip>
              `
          )}
          <div ?hidden="${!this.invalid}" class="invalid">${translate('PLS_SELECT_TIME_PERIODS')}</div>`
      : html`
          <etools-info-tooltip class="" icon-first custom-icon>
            <etools-icon name="info" slot="custom-icon"></etools-icon>
            <div slot="message">${translate('ACTIVITY_TIMES_MSG')}</div>
          </etools-info-tooltip>
        `;
  }

  private isSelected(quater: InterventionQuarter): boolean {
    return this.selectedTimeFrames.includes(quater.id);
  }

  static get styles(): CSSResultArray {
    // language=css
    return [
      css`
        :host {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          cursor: pointer;
          place-content: flex-start;
          max-width: 92px;
        }
        .quarter {
          height: 20px;
          width: 20px;
          padding: 0 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background-color: #a3a3a3;
          font-family: Roboto;
          font-size: var(--etools-font-size-12, 12px);
          font-weight: 500;
          color: #ffffff;
          box-sizing: border-box;
        }
        .quarter.selected {
          background-color: #558a5b;
        }
        .invalid {
          color: var(--error-color);
          padding: 4px 0;
          font-size: var(--etools-font-size-12, 12px);
        }
        etools-icon {
          color: var(--primary-color);
        }
      `
    ];
  }
}
