import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import GDD_CONSTANTS from '../../../common/constants';
import GenerateQuarterlyReportingRequirementsMixin from '../mixins/generate-quarterly-reporting-requirements-mixin';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

import './edit-qpr-dialog';
import './qpr-list';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin GenerateQuarterlyReportingRequirementsMixin
 */

@customElement('gdd-quarterly-reporting-requirements')
export class GDDQuarterlyReportingRequirements extends GenerateQuarterlyReportingRequirementsMixin(
  ReportingRequirementsCommonMixin(LitElement)
) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        *[hidden] {
          display: none !important;
        }
      </style>

      <div class="col-12" ?hidden="${this._empty(this.reportingRequirements)}">
        <gdd-qpr-list .qprData="${this.reportingRequirements}"></gdd-qpr-list>
      </div>

      <div ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="col-12">${translate('NO_GDD_REPORTING_REQUIREMENTS')}</div>
        <div class="col-12" ?hidden="${!this.editMode}">
          <etools-button
            variant="text"
            class="no-marg no-pad font-14"
            @click="${this.openQuarterlyRepRequirementsDialog}"
          >
            ${translate('ADD_REQUIREMENTS')}
          </etools-button>
        </div>
      </div>
    `;
  }

  @property({type: String})
  interventionStatus = '';

  @property({type: String})
  interventionStart!: string;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Boolean})
  editMode!: boolean;

  @property() dialogOpened = true;

  openQuarterlyRepRequirementsDialog() {
    if (!this.interventionStart || !this.interventionEnd) {
      fireEvent(this, 'toast', {
        text: getTranslation('GDD_REPORT_PROMPT')
      });
      return;
    }
    let qprData: any[];
    if (this.requirementsCount === 0) {
      qprData = this.generateQPRData(this.interventionStart, this.interventionEnd);
    } else {
      qprData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }

    openDialog({
      dialog: 'gdd-edit-qpr-dialog',
      dialogData: {
        qprData: cloneDeep(qprData),
        interventionId: this.interventionId,
        interventionStart: this.interventionStart,
        interventionEnd: this.interventionEnd,
        interventionStatus: this.interventionStatus,
        initialReportingReq: this.reportingRequirements
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._onReportingRequirementsSaved(response);
      this.updateReportingRequirements(response, GDD_CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR);
    });
  }

  _getReportType() {
    return GDD_CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR;
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }
}

export {GDDQuarterlyReportingRequirements as GDDQuarterlyReportingRequirementsEL};
