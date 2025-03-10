import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import dayjs from 'dayjs';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-date-time/calendar-lite';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import './hru-list.js';
import GDD_CONSTANTS from '../../../common/constants.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {gddEndpoints} from '../../../utils/intervention-endpoints.js';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';

/**
 * @LitElement
 * @customElement
 * @appliesMixin EndpointsMixin
 */

@customElement('gdd-edit-hru-dialog')
export class GDDEditHruDialog extends connectStore(LitElement) {
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

        #add-selected-date {
          display: inline-block;
          width: auto;
          padding-inline-end: 0;
        }

        .start-date {
          padding-bottom: 24px;
          max-width: 300px;
        }

        calendar-lite {
          position: relative;
        }
        #dtPickerStDate::part(dp-calendar) {
          height: 390px;
        }
      </style>

      <etools-dialog
        id="editHruDialog"
        size="lg"
        dialog-title=${translate('EDIT_DATES_HUMANITARIAN_REPORT')}
        @confirm-btn-clicked="${this._saveHurData}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        keep-dialog-open
        ?hidden="${this.datePickerOpen}"
        @close="${() => this._onClose()}"
        spinner-text=${translate('GENERAL.SAVING_DATA')}
      >
        <div class="start-date">
          <datepicker-lite
            id="dtPickerStDate"
            label=${translate('SELECT_START_DATE')}
            .value="${this.repStartDate}"
            required
            min-date="${this.interventionStart}"
            auto-validate
            open="${this.datePickerOpen}"
            selected-date-display-format="D MMM YYYY"
            fire-date-has-changed
            @date-has-changed="${(e: CustomEvent) => {
              this.repStartDate = e.detail.date;
            }}"
          >
          </datepicker-lite>
        </div>
        <div>${translate('HUMANITARIAN_REPORT_PROMPT')}</div>

        <div class="row padding-v">
          <div class="col-md-6">
            <div class="w100">
              <calendar-lite
                id="datepicker"
                min-date="${this.repStartDate}"
                .date="${this.selectedDate ? this.selectedDate : ''}"
                @date-changed="${({detail}: CustomEvent) => this.changed(detail.value)}"
                format="YYYY-MM-DD"
                hide-header
              >
              </calendar-lite>
            </div>
            <div class="padding-v w100">
              <etools-button
                variant="text"
                class="no-marg no-pad font-14"
                id="add-selected-date"
                @click="${() => this._addToList()}"
              >
                ${translate('ADD_SELECTED_DATE')}
              </etools-button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="row" ?hidden="${!this._empty(this.hruData.length)}">${translate('NO_DATES_ADDED')}</div>
            <gdd-hru-list
              id="hruList"
              class="col-12"
              with-scroll
              .hruData="${this.hruData}"
              ?hidden="${this._empty(this.hruData.length)}"
              ?editMode="${true}"
              @delete-hru="${this._deleteHruDate}"
            >
            </gdd-hru-list>
          </div>
        </div>
      </etools-dialog>
    `;
  }
  @property({type: Date})
  interventionStart!: Date | string;

  @property({type: Date})
  _repStartDate!: Date | string;

  @property({type: String})
  selectedDate!: string;

  @property({type: Array})
  hruData: AnyObject[] = [];

  @property({type: Number})
  _hruEditedIndex = -1;

  @property({type: Boolean})
  datePickerOpen = false;

  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
  }

  @property({type: String})
  get interventionId() {
    return this._interventionId;
  }
  set repStartDate(newValue: Date | string) {
    const newStartDate = dayjs(newValue).startOf('day');
    if (this.selectedDate) {
      const currentSelectedDate = dayjs(this.selectedDate).startOf('day');
      // Check if selectedDate is lower than the new repStartDate
      if (currentSelectedDate.isBefore(newStartDate)) {
        // Reset selectedDate
        this.selectedDate = '';
      }
    }

    // Set the repStartDate property
    this._repStartDate = newStartDate.format('YYYY-MM-DD');
  }

  get repStartDate() {
    return this._repStartDate;
  }

  set dialogData(data: any) {
    const {hruData, selectedDate, interventionId, interventionStart}: any = data;
    this.hruData = hruData;
    this.selectedDate = selectedDate;
    this.interventionId = interventionId;
    this.interventionStart = interventionStart;

    this._setDefaultStartDate();
  }

  _setDefaultStartDate() {
    if (isEmptyObject(this.hruData)) {
      this.repStartDate = this.interventionStart;
    } else {
      this.repStartDate = this._getSavedStartDate();
    }
  }
  _getSavedStartDate() {
    this.hruData.sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return this.hruData[0].start_date;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _empty(listLength: number) {
    return listLength === 0 || !listLength;
  }

  _addToList() {
    const repStartDate = dayjs(this.repStartDate).startOf('day');

    if (!this.selectedDate || !repStartDate.isValid()) {
      fireEvent(this, 'toast', {
        text: getTranslation('PLEASE_SELECT_DATE')
      });
      return;
    }
    const alreadySelected = this.hruData.find((d: any) => d.end_date === this.selectedDate);
    if (alreadySelected) {
      fireEvent(this, 'toast', {
        text: getTranslation('DATE_ALREADY_ADDED')
      });
      return;
    }
    const auxHruData = [...this.hruData];
    auxHruData.push({
      end_date: dayjs(this.selectedDate).format('YYYY-MM-DD'),
      due_date: this._oneDayAfterEndDate(this.selectedDate)
    });
    this.hruData = [...auxHruData];
  }

  _oneDayAfterEndDate(endDt: string) {
    return dayjs(endDt).add(1, 'days').format('YYYY-MM-DD');
  }

  _deleteHruDate(e: CustomEvent) {
    const auxHruData = this.hruData;
    auxHruData.splice(e.detail.index, 1);
    this.hruData = [...auxHruData];
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  updateStartDates(startDate: any) {
    if (isEmptyObject(this.hruData)) {
      return;
    }
    this.hruData[0].start_date = startDate;

    this._calculateStartDateForTheRestOfItems();
  }

  _calculateStartDateForTheRestOfItems() {
    let i;
    for (i = 1; i < this.hruData.length; i++) {
      this.hruData[i].start_date = this._computeStartDate(i);
    }
  }

  _computeStartDate(i: number) {
    return dayjs(this.hruData[i - 1].end_date)
      .add(1, 'days')
      .format('YYYY-MM-DD');
  }

  _saveHurData() {
    if (!this.validate()) {
      return;
    }

    if (!this.validate()) {
      return;
    }

    this.updateStartDates(this.repStartDate);
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.reportingRequirements, {
      intervId: this.interventionId,
      reportType: GDD_CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR
    });
    const dialog = this.shadowRoot!.querySelector(`#editHruDialog`) as unknown as EtoolsDialog;
    dialog.startSpinner();
    sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.hruData}
    })
      .then((response: any) => {
        dialog.stopSpinner();
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response.reporting_requirements});
      })
      .catch((error: any) => {
        EtoolsLogger.error('Failed to save/update HR data!', 'edit-hru-dialog', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        dialog.stopSpinner();
      });
  }

  validate() {
    return validateRequiredFields(this);
  }

  changed(value: string) {
    this.selectedDate = dayjs(new Date(value)).format('YYYY-MM-DD');
  }
}
