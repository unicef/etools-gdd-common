import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import GDD_CONSTANTS from '../../../common/constants';
import './edit-hru-dialog.js';
import './hru-list.js';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import {GDDExpectedResult} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

/**
 * @customElement
 * @LitElement
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin PaginationMixin
 */
@customElement('gdd-humanitarian-reporting-req-unicef')
export class GDDHumanitarianReportingReqUnicef extends PaginationMixin(ReportingRequirementsCommonMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      <style>
        :host {
          display: block;
        }
        *[hidden] {
          display: none !important;
        }
        .mt-12 {
          margin-block-start: 20px;
        }
      </style>
      <div class="mt-12" ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="col-12">${translate('NO_HUMANITARIAN_REPORT')}</div>
        <div class="col-12" ?hidden="${!this._showAdd(this.GDDExpectedResults, this.editMode)}">
          <etools-button
            variant="text"
            class="no-marg no-pad font-14"
            @click="${this.openUnicefHumanitarianRepReqDialog}"
          >
            ${translate('ADD_REQUIREMENTS')}
          </etools-button>
        </div>
        <div class="col-12" ?hidden="${this._thereAreHFIndicators(this.GDDExpectedResults)}">
          ${translate('CAN_BE_MODIFIED_PROMPT')}
        </div>
      </div>

      <div class="col-12" ?hidden="${this._empty(this.reportingRequirements)}">
        <gdd-hru-list id="hruList" .hruData="${this.paginatedReports}" .paginator="${this.paginator}" disable-sorting>
        </gdd-hru-list>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${this.visibleRangeChanged}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>
      </div>
    `;
  }

  @property({type: Array})
  GDDExpectedResults!: [];

  @property({type: Array})
  paginatedReports!: any[];

  @property({type: Date})
  interventionStart!: Date;

  @property({type: Boolean})
  editMode!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('reporting-requirements-loaded', this.dataWasLoaded as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('reporting-requirements-loaded', this.dataWasLoaded as any);
  }

  dataWasLoaded() {
    this.paginator = {...this.paginator, page: 1, page_size: 10, count: this.reportingRequirements.length};
  }

  _paginate(pageNumber: number, pageSize: number) {
    if (!this.reportingRequirements) {
      return;
    }
    this.paginatedReports = (this.reportingRequirements || []).slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
  }

  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }

  _reportingRequirementsSaved(reportingRequirements: any[]) {
    this._onReportingRequirementsSaved(reportingRequirements);
    this.paginator = {...this.paginator, page: 1};
    this.updateReportingRequirements(reportingRequirements, GDD_CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR);
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getReportType() {
    return GDD_CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR;
  }

  openUnicefHumanitarianRepReqDialog() {
    if (!this.interventionStart) {
      fireEvent(this, 'toast', {
        text: getTranslation('FILL_START_DATE')
      });
      return;
    }
    let hruData = [];
    if (this.requirementsCount > 0) {
      hruData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }
    openDialog({
      dialog: 'gdd-edit-hru-dialog',
      dialogData: {
        hruData: cloneDeep(hruData),
        selectedDate: '',
        interventionId: this.interventionId,
        interventionStart: this.interventionStart
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._reportingRequirementsSaved(response);
    });
  }

  _thereAreHFIndicators(GDDExpectedResults: GDDExpectedResult[]) {
    if (!GDDExpectedResults) {
      return false;
    }
    // const hfIndicator = GDDExpectedResults.find((r: any) => {
    //   return r.gdd_key_interventions.find((key_intervention: any) => {
    //     return key_intervention.applied_indicators.find((i: any) => {
    //       return i.is_active && i.is_high_frequency;
    //     });
    //   });
    // });
    return false; // hfIndicator ? true : false;
  }

  _showAdd(GDDExpectedResults: GDDExpectedResult[], editMode: boolean) {
    if (!editMode) {
      return false;
    }
    return this._thereAreHFIndicators(GDDExpectedResults);
  }
}

export {GDDHumanitarianReportingReqUnicef as GDDHumanitarianReportingReqUnicefEl};
