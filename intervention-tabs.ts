import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import './common/layout/page-content-header/intervention-page-content-header';
import './common/layout/page-content-header/intervention-page-content-subheader';
import '@unicef-polymer/etools-modules-common/dist/components/cancel/reason-display';
import '@unicef-polymer/etools-modules-common/dist/layout/status/etools-status';
import './intervention-actions/intervention-actions';
import './common/components/prp-country-data/prp-country-data';
import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {getStore, getStoreAsync} from '@unicef-polymer/etools-utils/dist/store.util';
import {currentPage, currentSubpage, isUnicefUser, currentSubSubpage, currentUser} from './common/selectors';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {getIntervention} from './common/actions/gddInterventions';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {PageContentHeaderSlottedStyles} from './common/layout/page-content-header/page-content-header-slotted-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {buildUrlQueryString} from '@unicef-polymer/etools-utils/dist/general.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {enableCommentMode, getComments, setCommentsEndpoint} from './common/components/comments/comments.actions';
import {gddCommentsData} from './common/components/comments/comments.reducer';
import {Store} from 'redux';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {EnvFlags, EtoolsEndpoint, GDDExpectedResult, GDD} from '@unicef-polymer/etools-types';
import {AsyncAction, RouteDetails} from '@unicef-polymer/etools-types';
import {gddInterventions} from './common/reducers/interventions';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {prcIndividualReviews} from './common/reducers/officers-reviews';
import {uploadStatus} from './common/reducers/upload-status';
import GDD_CONSTANTS, {GDD_TABS} from './common/constants';
import UploadMixin from '@unicef-polymer/etools-modules-common/dist/mixins/uploads-mixin';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {RESET_UNSAVED_UPLOADS, RESET_UPLOADS_IN_PROGRESS} from './common/actions/actionsContants';
import {RootState} from './common/types/store.types';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from './utils/intervention-endpoints';
import {GDDCommentsEndpoints} from './common/components/comments/comments-types';
import {GDDCommentsPanels} from './common/components/comments-panels/comments-panels';
import './unresolved-other-info';
import {gddTranslatesMap} from './utils/intervention-labels-map';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import {isActiveTab} from './utils/utils';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
/**
 * @LitElement
 * @customElement
 */
@customElement('gdd-intervention-tabs')
export class GDDInterventionTabs extends connectStore(UploadMixin(LitElement)) {
  static get styles() {
    // language=css
    return [
      elevationStyles,
      PageContentHeaderSlottedStyles,
      css`
        :host {
          flex: 1;
          width: 100%;
          flex-direction: column;
        }
        :host(:not([hidden])) {
          display: flex !important;
        }
        :host([is-in-amendment]) {
          border: 5px solid #ffd28b;
          box-sizing: border-box;
        }
        .page-content {
          margin: 24px;
          flex: 1;
        }
        .amendment-info {
          position: sticky;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          background-color: #ffd28b;
          height: 50px;
          z-index: 99;
        }
        .amendment-info a {
          margin-inline-start: 7px;
          cursor: pointer;
          text-decoration: underline;
        }
        @media (max-width: 576px) {
          .page-content {
            margin: 5px;
          }
        }

        etools-status-lit {
          margin-top: 0;
          border-top: 0;
        }
      `
    ];
  }

  render() {
    if (!this.intervention) {
      return html``;
    }
    // main template
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          --ecp-header-bg: #ffffff;
          --ecp-header-color: var(--primary-text-color);
        }

        etools-status {
          justify-content: center;
        }
        .flag {
          color: var(--primary-text-color);
          background-color: whitesmoke;
          padding: 5px 0;
          padding-inline-end: 14px;
          padding-inline-start: 10px;
          width: 100%;
          border-radius: 25px;
        }
        .dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          background-color: #52c2e6;
          border-radius: 50%;
          margin-inline-end: 3px;
        }

        div[slot='tabs'] {
          width: 100%;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        .intervention-partner {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: var(--etools-font-size-18, 18px);
          font-weight: 700;
          display: block;
        }
        .intervention-number {
          font-size: var(--etools-font-size-16, 16px);
        }

        reason-display {
          --text-padding: 26px 24px 26px 80px;
        }
        :host-context([dir='rtl']) reason-display {
          --text-padding: 26px 80px 26px 24px;
        }
        sl-tab-group {
          --indicator-color: var(--primary-color);
          max-width: calc(100% - 2px);
        }
        sl-tab-group::part(tabs) {
          border-bottom: 0;
        }
        sl-tab-group::part(active-tab-indicator) {
          bottom: 0;
        }
        sl-tab:not([active])::part(base) {
          color: var(--secondary-text-color);
        }
        sl-tab::part(base) {
          text-transform: uppercase;
          min-width: 120px;
          place-content: center;
          opacity: 0.8;
        }
        sl-tab::part(base):focus-visible {
          outline: 0;
          opacity: 1;
          font-weight: 700;
        }
      </style>

      <!-- Loading PRP country data -->
      <gdd-prp-country-data></gdd-prp-country-data>

      <gdd-intervention-page-content-header ?is-in-amendment="${this.isInAmendment}">
        <span class="intervention-partner" slot="page-title">${this.intervention.partner}</span>
        <span class="intervention-number" slot="page-title">${this.intervention.number}</span>
        <div slot="mode">
          <sl-switch id="commentMode" ?checked="${this.commentMode}" @sl-change="${this.commentModeChange}"
            >${translate('GENERAL.COMMENT_MODE')}
          </sl-switch>
          <info-icon-tooltip
            id="iit-locations"
            class="iit"
            position="right"
            .tooltipText="${translate('COMMENT_MODE_USAGE_DESCRIPTION')}"
          ></info-icon-tooltip>
        </div>

        <div slot="statusFlag" ?hidden="${!this.showPerformedActionsStatus()}">
          <span class="icon flag">
            <span class="dot"></span>
            ${this.getPerformedAction()}
          </span>
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <gdd-intervention-actions
            .actions="${this.availableActions}"
            .interventionPartial=${this.getInterventionDetailsForActionsDisplay(this.intervention)}
            .userIsBudgetOwner="${this.userIsBudgetOwner}"
          ></gdd-intervention-actions>
        </div>
      </gdd-intervention-page-content-header>

      <gdd-intervention-page-content-subheader>
        <etools-status-lit
          .statuses="${this.intervention.status_list.map((x: any) => [
            x[0],
            getTranslatedValue(x[0], 'COMMON_DATA.INTERVENTIONSTATUSES')
          ])}"
          .activeStatus="${this.intervention.status}"
        ></etools-status-lit>

        <sl-tab-group @sl-tab-show="${this.handleTabChange}">
          ${this.pageTabs?.map(
            (t) =>
              html` <sl-tab
                @mousedown="${this.handleTabActivate}"
                slot="nav"
                panel="${t.tab}"
                ?active="${this.activeTab === t.tab}"
                ?hidden="${t.hidden}"
                >${t.tabLabel}</sl-tab
              >`
          )}
        </sl-tab-group>
      </gdd-intervention-page-content-subheader>

      <div class="page-content">
        ${this.intervention.cancel_justification
          ? html`<reason-display .justification=${this.intervention.cancel_justification}></reason-display>`
          : ''}
        ${this.intervention.other_info
          ? html` <gdd-unresolved-other-info-review
              .data="${this.otherInfo}"
              .editPermissions="${this.intervention.permissions?.edit.other_info}"
            ></gdd-unresolved-other-info-review>`
          : html``}
        <gdd-intervention-metadata ?hidden="${!isActiveTab(this.activeTab, GDD_TABS.Metadata)}">
        </gdd-intervention-metadata>
        <gdd-intervention-strategy
          ?hidden="${!isActiveTab(this.activeTab, GDD_TABS.Strategy)}"
        ></gdd-intervention-strategy>
        <gdd-intervention-workplan
          ?hidden="${!isActiveTab(this.activeTab, GDD_TABS.Workplan)}"
          .interventionId="${this.interventionId}"
        ></gdd-intervention-workplan>
        <gdd-intervention-timing ?hidden="${!isActiveTab(this.activeTab, GDD_TABS.Timing)}"> </gdd-intervention-timing>
        <gdd-intervention-review ?hidden="${!isActiveTab(this.activeTab, GDD_TABS.Review)}"></gdd-intervention-review>
        <gdd-intervention-attachments ?hidden="${!isActiveTab(this.activeTab, GDD_TABS.Attachments)}">
        </gdd-intervention-attachments>
        <gdd-intervention-progress
          .activeSubTab="${this.activeTab}"
          ?hidden="${!(
            isActiveTab(this.activeTab, GDD_TABS.ImplementationStatus) ||
            isActiveTab(this.activeTab, GDD_TABS.MonitoringActivities) ||
            isActiveTab(this.activeTab, GDD_TABS.Reports) ||
            isActiveTab(this.activeTab, GDD_TABS.ResultsReported)
          )}"
        ></gdd-intervention-progress>
      </div>

      <div class="amendment-info" ?hidden="${!this.isInAmendment}">
        ${translate('GDD_AMENDMENT_MODE_TEXT')}
        <a href="${Environment.basePath}gpd-interventions/${this.intervention?.original_gdd}/metadata">
          ${translate('ORIGINAL_VERSION')}
        </a>
      </div>
    `;
  }

  @property({type: Array})
  pageTabs = [
    {
      tab: GDD_TABS.Metadata,
      tabLabel: translate('METADATA_TAB'),
      tabLabelKey: 'METADATA_TAB',
      hidden: false
    },
    {
      tab: GDD_TABS.Strategy,
      tabLabel: translate('BACKGROUND_TAB'),
      tabLabelKey: 'BACKGROUND_TAB',
      hidden: false
    },
    {
      tab: GDD_TABS.Workplan,
      tabLabel: translate('WORKPLAN_TAB'),
      tabLabelKey: 'WORKPLAN_TAB',
      hidden: false
    },
    {
      tab: GDD_TABS.Timing,
      tabLabel: translate('TIMING_TAB') as unknown as string,
      tabLabelKey: 'TIMING_TAB',
      hidden: false
    }
  ];

  progressTabTemplate = [
    {
      tab: GDD_TABS.ImplementationStatus,
      tabLabel: translate('IMPLEMENTATION_STATUS_SUBTAB'),
      tabLabelKey: 'IMPLEMENTATION_STATUS_SUBTAB',
      hidden: false
    },
    {
      tab: GDD_TABS.MonitoringActivities,
      tabLabel: translate('MONITORING_ACTIVITIES_SUBTAB'),
      tabLabelKey: 'MONITORING_ACTIVITIES_SUBTAB',
      hidden: false
    }
  ];

  private commentsPanel: GDDCommentsPanels | null = null;

  @property({type: String})
  uploadEndpoint: string = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.attachmentsUpload).url;

  @property({type: String})
  activeTab = GDD_TABS.Metadata;

  @property({type: String})
  activeSubTab = '';

  @property({type: String})
  currentLanguage!: string;

  @property({type: Object})
  intervention!: GDD | null;

  @property({type: Boolean})
  commentMode = false;

  @property()
  availableActions: string[] = [];

  @property({type: Boolean})
  isUnicefUser = false;

  @property({type: Boolean})
  userIsBudgetOwner = false;

  @property({type: Boolean, attribute: 'is-in-amendment', reflect: true})
  isInAmendment = false;

  @property({type: Object})
  otherInfo!: {other_info: string};

  /*
   * Used to avoid unnecessary get intervention request
   */
  _routeDetails: RouteDetails | null = null;

  // id from route params
  private interventionId: string | null = null;

  private isGDDApp = Environment.basePath === '/government/';

  connectedCallback() {
    super.connectedCallback();
    // this._showInterventionPageLoadingMessage();

    // Override ajax error parser inside @unicef-polymer/etools-utils/dist/etools-ajax
    // for string translation using lit-translate and translatesMap from within
    // interventions-tab-pages
    window.ajaxErrorParserTranslateFunction = (key = '') => {
      return getTranslatedValue(gddTranslatesMap[key] || key);
    };

    const commentsEndpoints: GDDCommentsEndpoints = {
      saveComments: gddEndpoints.comments,
      deleteComment: gddEndpoints.deleteComment,
      resolveComment: gddEndpoints.resolveComment
    };
    getStoreAsync().then((store: Store<RootState>) => {
      (store as any).addReducers({
        gddCommentsData: gddCommentsData,
        gddInterventions: gddInterventions,
        prcIndividualReviews: prcIndividualReviews,
        uploadStatus
      });
      getStore().dispatch(setCommentsEndpoint(commentsEndpoints));
      getStore().dispatch(enableCommentMode(Boolean(this._routeDetails?.queryParams?.comment_mode)));
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  public stateChanged(state: RootState) {
    const notInterventionTabs: boolean =
      currentPage(state) !== 'gpd-interventions' || currentSubpage(state) === 'list' || currentSubpage(state) === 'new';
    const needToReset = Boolean(notInterventionTabs && (this._routeDetails || this.intervention));
    const commentsState = Boolean(state.app?.routeDetails?.queryParams?.comment_mode);
    this.checkCommentsMode(commentsState, notInterventionTabs);
    if (needToReset) {
      this.resetPageData();
    }
    if (notInterventionTabs || state.gddInterventions?.interventionLoading || !currentUser(state)) {
      return;
    }
    this.setActiveTab(state);
    // this.activeSubTab = currentSubSubpage(state) as string; //TODO - clean up after Rob agrees with new Tabs
    this.isUnicefUser = isUnicefUser(state);

    // add attribute to host to edit specific styles
    this.dataset.activeTab = this.activeTab;

    // check permissions after intervention was loaded
    if (state.gddInterventions?.current && !this.hasPermissionsToAccessPage(state)) {
      this.goToPageNotFound();
      return;
    }
    const currentInterventionId = get(state, 'app.routeDetails.params.interventionId');
    const currentIntervention = get(state, 'gddInterventions.current');
    this.otherInfo = {other_info: currentIntervention?.other_info as string};

    // check if intervention was changed
    if (!isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);

      if (currentIntervention && currentIntervention.budget_owner) {
        this.userIsBudgetOwner = currentIntervention.budget_owner.id === get(state, 'user.data.user');
      }

      this.availableActions = this.checkExportOptionsAvailability(
        this.intervention?.available_actions || [],
        this.intervention!
      );
      // set amendment attribute on host to add border and other styles
      this.isInAmendment = Boolean(this.intervention?.in_amendment);
      this.checkTabs(state);
    }

    // check if we need to load intervention and comments
    if (currentInterventionId !== this.interventionId) {
      this.interventionId = currentInterventionId!;
      this.loadInterventionData(currentInterventionId!);
    }

    if (state.uploadStatus) {
      this.uploadsStateChanged(state);
    }

    if (this.currentLanguage !== state.activeLanguage.activeLanguage) {
      if (this.currentLanguage) {
        // language was already set, this is language change
        this.pageTabs = this.applyTabsTitleTranslation(this.pageTabs);
      }
      this.currentLanguage = state.activeLanguage.activeLanguage;
    }

    // on routing change
    if (!isJsonStrMatch(state.app!.routeDetails!, this._routeDetails)) {
      this._routeDetails = cloneDeep(state.app!.routeDetails);
      fireEvent(this, 'scroll-up');
    }
  }

  setActiveTab(state: RootState) {
    this.activeTab = currentSubpage(state) as string;
    /**
     * Avoid 2 tabs partially selected in situations like:
     * - after language change
     * - navigating to a different Tab by clicking a comment in Comments Panel
     */
    setTimeout(() => this.shadowRoot?.querySelector('sl-tab-group')?.syncIndicator());
  }

  checkCommentsMode(newState: boolean, notInterventionTabs: boolean): void {
    if (this.commentMode === newState) {
      return;
    }
    this.commentMode = newState;

    if (!this.commentMode && this.commentsPanel) {
      this.commentsPanel.remove();
      this.commentsPanel = null;
    } else if (this.commentMode && !this.commentsPanel && !notInterventionTabs) {
      this.commentsPanel = document.createElement('gdd-comments-panels') as GDDCommentsPanels;
      document.body.append(this.commentsPanel);
    }

    if (!notInterventionTabs) {
      setTimeout(() => {
        getStore().dispatch(enableCommentMode(this.commentMode));
      }, 10);
    }
  }

  applyTabsTitleTranslation(pageTabs: any[]): any[] {
    try {
      return pageTabs.map((item) => {
        return {
          ...item,
          tabLabel: getTranslation(item.tabLabelKey),
          subtabs: item.subtabs?.map((subTab: any) => ({
            ...subTab,
            label: getTranslation(subTab.labelKey)
          }))
        };
      });
    } catch (ex) {
      console.log(ex);
      return this.pageTabs;
    }
  }

  checkExportOptionsAvailability(availableActions: string[], intervention: GDD) {
    if (
      availableActions &&
      availableActions.includes('export_results') &&
      !this.showExportResults(intervention.status, intervention.result_links)
    ) {
      return availableActions.filter((x: string) => x !== 'export_results');
    }
    return availableActions;
  }

  showExportResults(status: string, resultLinks: GDDExpectedResult[]) {
    return (
      [
        GDD_CONSTANTS.STATUSES.Draft.toLowerCase(),
        GDD_CONSTANTS.STATUSES.Review.toLowerCase(),
        GDD_CONSTANTS.STATUSES.Signature.toLowerCase(),
        GDD_CONSTANTS.STATUSES.Signed.toLowerCase(),
        GDD_CONSTANTS.STATUSES.Active.toLowerCase()
      ].indexOf(status) > -1 &&
      resultLinks &&
      resultLinks.length
    );
  }

  hasPermissionsToAccessPage(state: RootState) {
    const unicefUser = isUnicefUser(state);
    const tab = currentSubpage(state);
    const subTab = currentSubSubpage(state);

    const attachmentRestricted =
      tab === GDD_TABS.Attachments && !state.gddInterventions.current?.permissions?.view!.attachments;

    const reviewRestricted = tab === GDD_TABS.Review && !state.gddInterventions.current?.permissions?.view!.reviews;
    const restrictedSubTabs =
      (!unicefUser || this.isGDDApp) &&
      [
        GDD_TABS.ResultsReported,
        GDD_TABS.Reports,
        GDD_TABS.ImplementationStatus,
        GDD_TABS.MonitoringActivities
      ].includes(subTab);
    return !attachmentRestricted && !reviewRestricted && !restrictedSubTabs;
  }

  checkTabs(state: RootState): void {
    this.checkAttachmentsTab(state);
    this.checkReviewTab(state);

    this.handleProgressTabVisibility(state.commonData?.envFlags, state?.user.data?.is_unicef_user);
    this.pageTabs = [...this.pageTabs];
  }

  handleProgressTabVisibility(envFlags: EnvFlags | null, isUnicefUser?: boolean) {
    if (!isUnicefUser || this.isGDDApp) {
      return; // ONLY visible for unicef users
    }

    const progressTabs = this.pageTabs.find((x) =>
      [GDD_TABS.ImplementationStatus, GDD_TABS.MonitoringActivities].includes(x.tab)
    );

    if (!progressTabs) {
      this.pageTabs.push(...cloneDeep(this.progressTabTemplate));
    }
    if (envFlags && !envFlags.prp_mode_off && !this.pageTabs?.find((t: any) => t.tab === GDD_TABS.ResultsReported)) {
      // @ts-ignore
      this.pageTabs.push(
        {
          tabLabel: translate('RESULTS_REPORTED_SUBTAB'),
          tabLabelKey: 'RESULTS_REPORTED_SUBTAB',
          tab: GDD_TABS.ResultsReported,
          hidden: false
        },
        {tabLabel: translate('REPORTS'), tabLabelKey: 'REPORTS', tab: GDD_TABS.Reports, hidden: false}
      );
    }
    const tabsToHideInAmendment = [GDD_TABS.MonitoringActivities, GDD_TABS.ResultsReported, GDD_TABS.Reports];
    this.pageTabs.forEach((item) => {
      if (tabsToHideInAmendment.includes(item.tab)) {
        item.hidden = this.isInAmendment;
      }
    });
    // this.toggleSubtabs(progressTab, envFlags);
  }

  toggleSubtabs(progressTab: any, envFlags: EnvFlags | null) {
    // Results Reported, Reports tabs are visible only for unicef users if flag prp_mode_off is not ON
    // @ts-ignore
    if (
      envFlags &&
      !envFlags.prp_mode_off &&
      !progressTab?.subtabs?.find((t: any) => t.value === GDD_TABS.ResultsReported)
    ) {
      // @ts-ignore
      progressTab?.subtabs?.push(
        {
          label: translate('RESULTS_REPORTED_SUBTAB'),
          labelKey: 'RESULTS_REPORTED_SUBTAB',
          value: GDD_TABS.ResultsReported
        },
        {label: translate('REPORTS'), labelKey: 'REPORTS', value: GDD_TABS.Reports}
      );
    }
  }

  checkReviewTab(state: RootState): void {
    const tabIndex = this.pageTabs.findIndex((x) => x.tab === 'review');
    const unicefUser = get(state, 'user.data.is_unicef_user');
    if (tabIndex === -1 && unicefUser) {
      const pasteTo = this.pageTabs.findIndex((x) => x.tab === GDD_TABS.ImplementationStatus);
      this.pageTabs.splice(pasteTo, 0, {
        tab: GDD_TABS.Review,
        tabLabel: translate('REVIEW_TAB'),
        tabLabelKey: 'REVIEW_TAB',
        hidden: false
      });
    }
  }

  checkAttachmentsTab(state: RootState): void {
    const tabIndex = this.pageTabs.findIndex((x) => x.tab === 'attachments');
    const canView = get(state, 'gddInterventions.current.permissions.view.attachments');
    if (tabIndex === -1 && canView) {
      const pasteTo = this.pageTabs.findIndex((x) => x.tab === GDD_TABS.ImplementationStatus);
      this.pageTabs.splice(pasteTo, 0, {
        tab: GDD_TABS.Attachments,
        tabLabel: translate('ATTACHMENTS_TAB') as unknown as string,
        tabLabelKey: 'ATTACHMENTS_TAB',
        hidden: false
      });
    } else if (tabIndex !== -1 && !canView) {
      this.pageTabs.splice(tabIndex, 1);
    }
  }

  showPerformedActionsStatus() {
    return (
      ['draft', 'development'].includes(this.intervention!.status) &&
      (this.intervention!.partner_accepted ||
        this.intervention!.unicef_accepted ||
        (!this.intervention!.unicef_court && !!this.intervention!.date_sent_to_partner) ||
        (this.intervention!.unicef_court &&
          !!this.intervention!.submission_date &&
          !!this.intervention!.date_sent_to_partner))
    );
  }

  getPerformedAction() {
    if (!['draft', 'development'].includes(this.intervention!.status)) {
      return '';
    }
    if (this.intervention!.partner_accepted && this.intervention!.unicef_accepted) {
      return translate('PARTNER_AND_UNICEF_ACCEPTED');
    }
    if (!this.intervention!.partner_accepted && this.intervention!.unicef_accepted) {
      return translate('UNICEF_ACCEPTED');
    }
    if (this.intervention!.partner_accepted && !this.intervention!.unicef_accepted) {
      return translate('PARTNER_ACCEPTED');
    }
    if (!this.intervention!.unicef_court && !!this.intervention!.date_sent_to_partner) {
      return translate('SENT_TO_PARTNER');
    }

    if (
      this.intervention!.unicef_court &&
      !!this.intervention!.submission_date &&
      !!this.intervention!.date_sent_to_partner
    ) {
      return translate('SENT_TO_UNICEF');
    }
    return '';
  }

  async handleTabActivate(e: CustomEvent) {
    const confirmLeave = await this.confirmLeaveUploadsUnsavedDialog(e);
    if (!confirmLeave) {
      e.preventDefault();
    }
  }

  handleTabChange(e: CustomEvent) {
    const newTabName: string = e.detail.name;
    if (newTabName === this.activeTab) {
      return;
    }
    this.tabChanged(newTabName, this.activeTab, '', this.activeSubTab);
  }

  async confirmLeaveUploadsUnsavedDialog(e: CustomEvent) {
    if (Number(this.uploadsInProgress) > 0 || Number(this.unsavedUploads) > 0) {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: translate('LEAVE_UPLOADS_UNSAVED'),
          confirmBtnText: translate('LEAVE'),
          cancelBtnText: translate('STAY')
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      if (confirmed) {
        getStore().dispatch({type: RESET_UNSAVED_UPLOADS});
        getStore().dispatch({type: RESET_UPLOADS_IN_PROGRESS});
        e.currentTarget?.dispatchEvent(e);
      }

      return confirmed;
    }

    return true;
  }

  tabChanged(newTabName: string, oldTabName: string | undefined, newSubTab: string, _oldSubTab: string) {
    if (oldTabName === undefined) {
      // page load, tab init, component is gonna be imported in loadPageComponents action
      return;
    }
    if (newTabName !== oldTabName) {
      const tabControl = this.shadowRoot!.querySelector(`intervention-${newTabName}`);
      if (tabControl && !tabControl.shadowRoot) {
        // show loading message if tab was not already loaded
        this._showInterventionPageLoadingMessage();
      }

      const newPath = this._geNewUrlPath(newTabName, newSubTab);

      history.pushState(window.history.state, '', newPath);
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  _geNewUrlPath(newTabName: string, newSubTab: string) {
    if (this._routeDetails?.subRouteName == 'progress' && this._routeDetails?.queryParams) {
      // clean up lingering query str
      delete this._routeDetails?.queryParams?.size;
    }
    const stringParams: string = buildUrlQueryString(this._routeDetails!.queryParams || {});
    let newPath = `gpd-interventions/${this.intervention!.id}/${newTabName}`;
    if (newSubTab) {
      newPath += `/${newSubTab}`;
    } else {
      this.activeSubTab = '';
    }
    newPath += stringParams !== '' ? `?${stringParams}` : '';

    return newPath;
  }

  goToPageNotFound() {
    history.pushState(window.history.state, '', 'not-found');
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  commentModeChange(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    // initial load
    if (element.checked === this.commentMode) {
      return;
    }
    history.pushState(window.history.state, '', this.computeNewPath(element.checked));
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  computeNewPath(commentMode: boolean) {
    const queryParams = {...(this._routeDetails!.queryParams || {})};
    if (commentMode) {
      queryParams['comment_mode'] = 'true';
    } else {
      delete queryParams['comment_mode'];
    }
    const stringParams: string = buildUrlQueryString(queryParams);
    return this._routeDetails!.path + (stringParams !== '' ? `?${stringParams}` : '');
  }

  _showInterventionPageLoadingMessage() {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'gdd-interv-page'
    });
  }

  private resetPageData(): void {
    fireEvent(this, 'scroll-up');
    this._routeDetails = null;
    this.intervention = null;
    this.interventionId = null;
    this.isInAmendment = false;
  }

  private loadInterventionData(currentInterventionId: string | number): void {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'gdd-intervention-tabs'
    });
    getStore()
      .dispatch<AsyncAction>(getIntervention(String(currentInterventionId)))
      .catch((err: any) => {
        if (err.message === '404') {
          this.goToPageNotFound();
        }
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'gdd-intervention-tabs'
        })
      );
    getStore().dispatch<AsyncAction>(getComments(gddEndpoints.comments, Number(currentInterventionId)));
  }

  private getInterventionDetailsForActionsDisplay(intervention: GDD) {
    if (!intervention) {
      return {};
    }
    return {
      id: intervention.id,
      status: intervention.status,
      submission_date: intervention.submission_date,
      in_amendment: intervention.in_amendment
    };
  }
}
