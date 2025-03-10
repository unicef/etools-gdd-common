import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import './qpr/quarterly-reporting-requirements';
import './hr/humanitarian-reporting-req-unicef';
import './hr/humanitarian-reporting-req-cluster';
import './srr/special-reporting-requirements';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {GDDHumanitarianReportingReqUnicefEl} from './hr/humanitarian-reporting-req-unicef';
import {GDDQuarterlyReportingRequirementsEL} from './qpr/quarterly-reporting-requirements';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {GDDReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {selectReportingRequirementsPermissions} from './reportingRequirementsPermissions.selectors';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {isUnicefUser} from '../../common/selectors';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {AnyObject, GDD, Permission} from '@unicef-polymer/etools-types';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import {callClickOnSpacePushListener} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {gddTranslatesMap} from '../../utils/intervention-labels-map';
import {sectionContentStyles} from '@unicef-polymer/etools-modules-common/dist/styles/content-section-styles-polymer';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import {isActiveTab} from '../../utils/utils';

/**
 * @LitElement
 * @customElement
 */
@customElement('gdd-partner-reporting-requirements')
export class GDDPartnerReportingRequirements extends connectStore(LitElement) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sectionContentStyles} ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        /* ------------------------------- */

        .reporting-req-data {
          border-inline-start: 1px solid var(--darker-divider-color);
          flex: 1 1 0%;
          margin-block-end: 24px;
        }

        .nav-menu {
          background: var(--primary-background-color);
          min-width: 320px;
          margin-top: 9px;
          margin-bottom: 8px;
        }

        .nav-menu-item {
          display: flex;
          align-items: center;
          height: 48px;
          padding-inline-start: 24px;
          padding-inline-end: 24px;
          font-size: var(--etools-font-size-14, 14px);
          font-weight: bold;
          text-transform: capitalize;
          cursor: pointer;
          height: 45px;
          text-wrap: nowrap;
        }

        .nav-menu-item[selected] {
          color: var(--primary-color);
          background-color: var(--medium-theme-background-color);
        }

        .nav-menu-item {
          color: var(--secondary-text-color);
          padding-inline-start: 24px;
          padding-inline-end: 24px;
          font-size: var(--etools-font-size-14, 14px);
          font-weight: bold;
          text-transform: capitalize;
        }
        .nav-menu-item:focus-visible {
          outline: 0;
          box-shadow:
            0 6px 10px 0 rgba(0, 0, 0, 0.14),
            0 1px 18px 0 rgba(0, 0, 0, 0.12),
            0 3px 5px -1px rgba(0, 0, 0, 0.4);
          background-color: rgba(170, 165, 165, 0.2);
        }
        /* ------------------------------- */

        .edit-rep-req {
          color: var(--primary-text-color);
          margin-inline-start: 16px;
        }

        info-icon-tooltip {
          --iit-margin: 0 5px 0 0;
        }

        :host-context([dir='rtl']) info-icon-tooltip {
          --iit-margin: 0 0 0 5px;
        }
        .d-flex {
          display: flex;
        }
        @media (max-width: 768px) {
          .reports-menu {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            box-sizing: border-box;
            border-bottom: 1px solid var(--darker-divider-color);
          }
          .nav-menu-item {
            width: 100%;
          }
          .d-flex {
            flex-wrap: wrap;
          }
          .reporting-req-data {
            border-inline-start: none;
          }
        }
      </style>
      <etools-content-panel
        show-expand-btn
        class="content-section"
        panel-title=${translate(gddTranslatesMap.reporting_requirements)}
      >
        <div class="row">
          <div class="col-12 d-flex">
            <div class="reports-menu nav-menu">
              <div
                name="special"
                title=${translate('GDD_SPECIAL_REPORT')}
                class="nav-menu-item"
                ?selected="${this.isSelected('special')}"
                @click="${this.selectType}"
                tabindex="0"
                id="clickable"
              >
                <info-icon-tooltip
                  id="iit-sp"
                  ?hidden="${this.isReadonly}"
                  .tooltipText="${translate('GDD_SPECIAL_REPORT_TOOLTIP')}"
                ></info-icon-tooltip>
                ${translate('GDD_SPECIAL_REPORT')} (${this.specialRequirementsCount})
              </div>
              <div
                name="qtyProgress"
                title=${translate('GDD_PROGRESS_REPORTS')}
                class="nav-menu-item qpr"
                ?selected="${this.isSelected('qtyProgress')}"
                @click="${this.selectType}"
                tabindex="0"
                id="clickable"
              >
                <info-icon-tooltip
                  id="iit-qpr"
                  ?hidden="${this.isReadonly}"
                  .tooltipText="${translate('GDD_PROGRESS_REPORT_TOOLTIP')}"
                ></info-icon-tooltip>
                <span>${translate('GDD_PROGRESS_REPORTS')} (${this.qprRequirementsCount})</span>
                <etools-icon-button
                  class="edit-rep-req"
                  name="create"
                  @click="${this._openQprEditDialog}"
                  ?hidden="${this._hideRepReqEditBtn(this.isReadonly, this.qprRequirementsCount)}"
                ></etools-icon-button>
              </div>
            </div>
            <div class="reporting-req-data">
              <gdd-special-reporting-requirements
                ?hidden="${!isActiveTab(this.selectedReportType, 'special')}"
                name="special"
                .interventionId="${this.interventionId}"
                .requirementsCount="${this.specialRequirementsCount}"
                .editMode="${!this.isReadonly}"
                @count-changed=${(e: CustomEvent) => this.updateSRRCount(e.detail)}
              >
              </gdd-special-reporting-requirements>

              <gdd-quarterly-reporting-requirements
                ?hidden="${!isActiveTab(this.selectedReportType, 'qtyProgress')}"
                id="qpr"
                name="qtyProgress"
                .interventionId="${this.interventionId}"
                .interventionStart="${this.interventionStart}"
                .interventionEnd="${this.interventionEnd}"
                .requirementsCount="${this.qprRequirementsCount}"
                .interventionStatus="${this.intervention?.status}"
                .editMode="${!this.isReadonly}"
                @count-changed=${(e: CustomEvent) => this.updateQPRCount(e.detail)}
              >
              </gdd-quarterly-reporting-requirements>
            </div>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnSpacePushListener(el));
  }

  @property({type: String})
  selectedReportType = 'special';

  @property({type: Number})
  interventionId!: number;

  @property({type: Date})
  interventionStart!: Date;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Array})
  GDDExpectedResults!: [];

  // count properties
  @property({type: Number})
  qprRequirementsCount = 0;

  @property({type: Number})
  hrUnicefRequirementsCount = 0;

  @property({type: Number})
  hrClusterRequirementsCount = 0;

  @property({type: Number})
  specialRequirementsCount = 0;

  @property({type: Object})
  reportingRequirementsPermissions!: Permission<GDDReportingRequirementsPermissions>;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Boolean})
  isUnicefUser!: boolean;

  @property({type: Boolean})
  commentsMode!: boolean;

  @property({type: Boolean})
  isReadonly!: boolean;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', 'timing')) {
      return;
    }
    if (!get(state, 'gddInterventions.current')) {
      return;
    }
    this.isUnicefUser = isUnicefUser(state);
    this.reportingRequirementsPermissions = selectReportingRequirementsPermissions(state);
    const currentIntervention = get(state, 'gddInterventions.current');
    this.intervention = cloneDeep(currentIntervention) as GDD;
    this.interventionId = this.intervention.id;
    this.interventionStart = this.intervention.start;
    this.interventionEnd = this.intervention.end;
    this.GDDExpectedResults = this.intervention.result_links;
    this.isReadonly = this._isReadOnly();
  }

  updateQPRCount(value: any) {
    if (value) {
      this.qprRequirementsCount = value.count;
    }
  }

  updateHRUCount(value: any) {
    if (value) {
      this.hrUnicefRequirementsCount = value.count;
    }
  }

  updateHRCCount(value: any) {
    if (value) {
      this.hrClusterRequirementsCount = value.count;
    }
  }

  updateSRRCount(value: any) {
    if (value) {
      this.specialRequirementsCount = value.count;
    }
  }

  _isReadOnly() {
    return (
      this.commentsMode ||
      !this.reportingRequirementsPermissions ||
      !this.reportingRequirementsPermissions.edit.reporting_requirements
    );
  }

  _openQprEditDialog() {
    const dialog = this.shadowRoot!.querySelector(`#qpr`) as GDDQuarterlyReportingRequirementsEL;
    dialog.openQuarterlyRepRequirementsDialog();
  }

  _openHruEditDialog() {
    const dialog = this.shadowRoot!.querySelector(`#hru`) as GDDHumanitarianReportingReqUnicefEl;
    dialog.openUnicefHumanitarianRepReqDialog();
  }

  _hideRepReqEditBtn(readonly: boolean, qprCount: number) {
    return qprCount === 0 || readonly;
  }

  selectType(event: MouseEvent): void {
    if (this.commentsMode) {
      return;
    }
    const tab: string = (event.currentTarget as HTMLElement).getAttribute('name') as string;
    this.selectedReportType = tab;
  }

  isSelected(type: string): boolean {
    return type === this.selectedReportType;
  }

  getHumanitarianLink(hrClusterRequirementsCount: number) {
    // The link it's hidden for the moment (#28753)
    return html``;
    return this.isUnicefUser
      ? html` <div
          name="humanitarianCluster"
          title=${translate('HUMANITARIAN_REPORTS_CLUSTER')}
          class="nav-menu-item"
          ?selected="${this.isSelected('humanitarianCluster')}"
          @click="${this.selectType}"
          tabindex="0"
          id="clickable"
        >
          ${translate('HUMANITARIAN_REPORTS_CLUSTER')} (${hrClusterRequirementsCount})
        </div>`
      : html``;
  }
}
