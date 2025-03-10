import {LitElement, css, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';

import {prepareDatepickerDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../../utils/intervention-endpoints';
import './qpr-list.js';
import GDD_CONSTANTS from '../../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-date-time/calendar-lite.js';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {GDDQprListEl} from './qpr-list.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import dayjs from 'dayjs';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../../utils/intervention-labels-map';
import GenerateQuarterlyReportingRequirementsMixin from '../mixins/generate-quarterly-reporting-requirements-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

/**
 * @LitElement
 * @customElement
 */
@customElement('gdd-edit-qpr-dialog')
export class GDDEditQprDialog extends GenerateQuarterlyReportingRequirementsMixin(LitElement) {
  static get styles() {
    return [
      layoutStyles,
      css`
        etools-button#addReq,
        etools-button#regen {
          --sl-input-height-medium: 24px !important;
        }
      `
    ];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        *[hidden] {
          display: none !important;
        }

        #qpr-edit-info {
          margin-inline-end: 24px;
        }

        qpr-list {
          margin-top: 24px;
        }

        .label {
          font-size: var(--etools-font-size-14, 14px);
          color: var(--primary-text-color);
          margin-bottom: 8px;
        }

        etools-dialog::part(panel) {
          width: 960px;
        }

        calendar-lite {
          position: relative;
          width: 288px;
        }
        #regenerate-info {
          margin-inline-end: 24px;
        }
        .layout-vertical {
          padding: 8px 0px;
        }
        .layout-vertical {
          padding-inline-start: 24px;
        }
        .custom-margin {
          margin: 0px !important;
          margin-left: -24px !important;
        }
      </style>

      <etools-dialog
        id="editQprDialog"
        size="lg"
        dialog-title=${translate('GDD_EDIT_QPR_REQUIREMENTS')}
        ?opened="${this.editQprDialogOpened}"
        @confirm-btn-clicked="${() => this._saveModifiedQprData()}"
        @close="${() => this.handleEditQprDialogClosed()}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        keep-dialog-open
        ?show-spinner="${this.requestInProgress}"
        spinner-text=${translate('GENERAL.SAVING_DATA')}
      >
        <div class="row">
          <div class="col-12">
            <span id="qpr-edit-info">${translate('ALL_DATES_IN_FUTURE')}</span>
            <etools-button id="addReq" variant="text" class="no-marg no-pad font-14" @click="${this._addNewQpr}"
              >${translate('ADD_REQUIREMENT')}</etools-button
            >
          </div>
          <div class="col-12" style="padding-top:10px" ?hidden="${!this.insterventionsDatesDiffer()}">
            <span id="regenerate-info">${translate('GDD_START_END_DATE_CHANGED')}</span> &nbsp;
            <etools-button
              id="regen"
              variant="text"
              class="no-marg no-pad font-14"
              @click="${this.regenerateReportingRequirements}"
              >${translate('REGENERATE')}</etools-button
            >
          </div>
          <div class="col-12">
            <gdd-qpr-list
              id="qprList"
              with-scroll
              .qprData="${this.qprData}"
              always-show-row-actions
              ?editMode="${true}"
              @delete-qpr="${(event: CustomEvent) => this._deleteQprDatesSet(event)}"
            ></gdd-qpr-list>
          </div>
        </div>
      </etools-dialog>

      <!-- add or edit a QPR row -->
      <etools-dialog
        id="addOrModifyQprDialog"
        size="lg"
        dialog-title=${translate('GDD_EDIT_STANDARD_REPORT_REQUIREMENTS')}
        ?opened="${this.addOrModifyQprDialogOpened}"
        @confirm-btn-clicked="${() => this._updateQprData()}"
        @close="${() => this.handleAddOrModifyQprDialogClosed()}"
        keep-dialog-open
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
      >
        <div class="row" ?hidden="${this._hideEditedIndexInfo(this._qprDatesSetEditedIndex)}">
          <div class="layout-vertical">
            ${translate('EDITING_ID')} ${this._getEditedQprDatesSetId(this._qprDatesSetEditedIndex)}
          </div>
        </div>

        <div class="row custom-margin">
          <div class="layout-vertical">
            <label class="label" for="startDate">${translate(gddTranslatesMap.start_date)}</label>
            <calendar-lite
              id="startDate"
              .date="${this._editedQprDatesSet!.start_date ? this._editedQprDatesSet!.start_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value, 'start_date')}"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="layout-vertical">
            <label class="label" for="endDate">${translate('END_DATE')}</label>
            <calendar-lite
              id="endDate"
              .date="${this._editedQprDatesSet!.end_date ? this._editedQprDatesSet!.end_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value, 'end_date')}"
              hide-header
            >
            </calendar-lite>
          </div>
          <div class="layout-vertical">
            <label class="label" for="dueDate">${translate('DUE_DATE')}</label>
            <calendar-lite
              id="dueDate"
              .date="${this._editedQprDatesSet!.due_date ? this._editedQprDatesSet!.due_date : ''}"
              format="YYYY-MM-DD"
              @date-changed="${({detail}: CustomEvent) => this.changed(detail.value, 'due_date')}"
              hide-header
            >
            </calendar-lite>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({type: Boolean})
  addOrModifyQprDialogOpened = false;

  @property({type: Boolean})
  editQprDialogOpened = true;

  @property({type: Object})
  _qprDatesSetModel = {
    start_date: null,
    end_date: null,
    due_date: null
  };

  @property({type: Object})
  _editedQprDatesSet: AnyObject = {start_date: null, end_date: null, due_date: null};

  @property({type: Number})
  _qprDatesSetEditedIndex = -1;

  @query('#editQprDialog')
  editQprDialog!: EtoolsDialog;

  @property({type: Array})
  qprData!: any[];

  @property({type: String})
  interventionStart!: string;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Boolean})
  requestInProgress = false;

  @property({type: String})
  interventionStatus = '';

  @property({type: Array})
  initialReportingReq!: [];

  set dialogData(data: any) {
    const {qprData, interventionId}: any = data;
    this.qprData = qprData;
    this.interventionId = interventionId;
    this.interventionStart = data.interventionStart;
    this.interventionEnd = data.interventionEnd;
    this.interventionStatus = data.interventionStatus;
    this.initialReportingReq = data.initialReportingReq;

    this.addEventListener('edit-qpr', this._editQprDatesSet as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('edit-qpr', this._editQprDatesSet as any);
  }

  changed(value: string, item: string) {
    if (this._editedQprDatesSet) {
      const newDate = dayjs(new Date(value)).format('YYYY-MM-DD');
      this._editedQprDatesSet[item] = newDate;
    }
  }

  handleAddOrModifyQprDialogClosed() {
    this.editQprDialogOpened = true;
    this.addOrModifyQprDialogOpened = false;
  }

  handleEditQprDialogClosed() {
    this.editQprDialogOpened = false;
    if (!this.editQprDialogOpened && !this.addOrModifyQprDialogOpened) {
      fireEvent(this, 'dialog-closed', {confirmed: false});
    }
  }

  _addNewQpr() {
    this._editedQprDatesSet = Object.assign({}, this._qprDatesSetModel);
    this.addOrModifyQprDialogOpened = true;
    this.editQprDialogOpened = false;
  }

  regenerateReportingRequirements() {
    this.requestInProgress = true;
    this.qprData = this.generateQPRData(this.interventionStart, this.interventionEnd);
    setTimeout(() => (this.requestInProgress = false));
  }

  insterventionsDatesDiffer() {
    if (!['draft', 'development'].includes(this.interventionStatus)) {
      return false;
    }
    if (!this.initialReportingReq || !this.initialReportingReq.length) {
      return false;
    }
    return this.qprData && this.qprData.length
      ? this.interventionStart != this.qprData[0].start_date ||
          this.interventionEnd != this.qprData[this.qprData.length - 1].end_date
      : true;
  }

  _duplicateDueDate(dueDate: any) {
    const foundQpr = this.qprData.find((d: any) => d.due_date === dueDate);
    if (this._qprDatesSetEditedIndex > -1 && foundQpr) {
      const foundQprIndex = this.qprData.indexOf(foundQpr);
      return foundQprIndex !== +this._qprDatesSetEditedIndex;
    }
    return !!foundQpr;
  }

  _validateDataBeforeAdd() {
    if (!this._editedQprDatesSet.due_date || !this._editedQprDatesSet.start_date || !this._editedQprDatesSet.end_date) {
      fireEvent(this, 'toast', {
        text: getTranslation('DATES_REQUIRED')
      });
      return false;
    }
    if (this._duplicateDueDate(this._editedQprDatesSet.due_date)) {
      fireEvent(this, 'toast', {
        text: getTranslation('REQUIREMENT_DATES_NOT_ADDED')
      });
      return false;
    }
    return true;
  }

  _updateQprData() {
    if (!this._validateDataBeforeAdd()) {
      this.addOrModifyQprDialogOpened = true;
      this.editQprDialogOpened = false;
      return;
    }
    this.editQprDialogOpened = true;
    this.addOrModifyQprDialogOpened = false;
    const auxQprData = [...this.qprData];
    if (this._qprDatesSetEditedIndex < 0) {
      // add
      auxQprData.push(this._editedQprDatesSet);
    } else {
      // edit
      auxQprData.splice(this._qprDatesSetEditedIndex, 1, this._editedQprDatesSet);
    }
    this.qprData = [...auxQprData];
    this._qprDatesSetEditedIndex = -1;
    this.editQprDialogOpened = true;
    this.addOrModifyQprDialogOpened = false;
    this.requestUpdate();
  }

  _editQprDatesSet(e: CustomEvent, qprData: any) {
    if (!this.qprData) {
      this.qprData = qprData;
    }
    this._qprDatesSetEditedIndex = e.detail.index;
    this._editedQprDatesSet = Object.assign({}, this.qprData[this._qprDatesSetEditedIndex]);
    this.addOrModifyQprDialogOpened = true;
    this.editQprDialogOpened = false;
  }

  _deleteQprDatesSet(event: CustomEvent) {
    // Forcing ui update
    this.qprData = [...this.qprData.filter((_item: AnalyserNode, index: number) => index !== event.detail.index)];
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  _getEditedQprDatesSetId(index: number) {
    const dialog = this.shadowRoot!.querySelector(`#qprList`) as GDDQprListEl;
    if (dialog) {
      return dialog.getIndex(index, this.qprData.length);
    }
    return;
  }

  _saveModifiedQprData() {
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.reportingRequirements, {
      intervId: this.interventionId,
      reportType: GDD_CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR
    });
    const dialog = this.editQprDialog as EtoolsDialog;
    dialog.startSpinner();
    sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.qprData}
    })
      .then((response: any) => {
        dialog.stopSpinner();
        fireEvent(this, 'dialog-closed', {confirmed: true, response: response.reporting_requirements});
      })
      .catch((error: any) => {
        EtoolsLogger.error('Failed to save/update qpr data!', 'edit-qpr-dialog', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        dialog.stopSpinner();
      });
  }

  prepareDatepickerDate(dateStr: string) {
    const date = prepareDatepickerDate(dateStr);
    if (date === null) {
      const now = dayjs(new Date()).format('YYYY-MM-DD');
      this._editedQprDatesSet.start_date = now;
      this._editedQprDatesSet.end_date = now;
      this._editedQprDatesSet.due_date = now;
      return prepareDatepickerDate(now);
    } else {
      return date;
    }
  }
}

export {GDDEditQprDialog as GDDEditQprDialogEl};
