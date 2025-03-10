import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import './update-fr-numbers';
import {GDDUpdateFrNumbers} from './update-fr-numbers';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {patchIntervention} from '../../common/actions/gddInterventions';
import {GDDFundReservationsPermissions} from './fund-reservations.models';
import {selectFundReservationPermissions} from './fund-reservations.selectors';
import {isUnicefUser} from '../../common/selectors';
import {AnyObject, AsyncAction, EtoolsEndpoint, Permission} from '@unicef-polymer/etools-types';
import {GDD, GDDFrsDetails, GDDFr} from '@unicef-polymer/etools-types';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import ContentPanelMixin from '@unicef-polymer/etools-modules-common/dist/mixins/content-panel-mixin';
import {getArraysDiff} from '@unicef-polymer/etools-utils/dist/array.util';
import {listenForLangChanged} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 */
@customElement('gdd-fund-reservations')
export class GDDFundReservations extends CommentsMixin(ContentPanelMixin(FrNumbersConsistencyMixin(LitElement))) {
  static get styles() {
    return [frWarningsStyles];
  }

  render() {
    if (!this.isUnicefUser) {
      return html``;
    }
    if (!this.intervention) {
      return html`<etools-loading source="fund-res" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          margin-bottom: 24px;
        }

        #frs-container {
          padding: 16px 0;
        }

        .fr-number {
          padding: 8px 12px;
          font-size: var(--etools-font-size-16, 16px);
          box-sizing: border-box;
        }

        .warning {
          padding: 32px 24px;
        }

        .warning,
        .fr-number {
          line-height: 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('FUND_RESERVATIONS')}
        comment-element="fund-reservations"
      >
        <etools-icon-button
          slot="panel-btns"
          name="add-box"
          @click="${() => this._openFrsDialog()}"
          ?hidden="${!this.permissions.edit.frs}"
        ></etools-icon-button>
        <div id="frs-container" ?hidden="${!this.thereAreFrs(this.intervention.frs_details)}">
          <etools-info-tooltip
            class="frs-inline-list"
            icon-first
            custom-icon
            .hideTooltip="${!this.frsConsistencyWarningIsActive(this._frsConsistencyWarning)}"
          >
            <div slot="field">
              ${this.intervention.frs_details.frs.map(
                (item: AnyObject) => html`<span class="fr-number">${item.fr_number}</span>`
              )}
            </div>
            <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
            <span slot="message"><span>${this._frsConsistencyWarning}</span></span>
          </etools-info-tooltip>
        </div>
        <div class="warning" ?hidden="${this.thereAreFrs(this.intervention.frs_details)}">
          ${this._getNoFrsWarningText(String(this.intervention.id))}
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions!: Permission<GDDFundReservationsPermissions>;

  @property({type: Object})
  intervention!: GDD;

  @property({type: Object})
  frsDialogEl!: GDDUpdateFrNumbers;

  @property({type: Object})
  _lastGDDFrsDetailsReceived!: GDDFrsDetails | null;

  @property({type: String})
  _frsConsistencyWarning!: string | boolean;

  @property({type: Boolean})
  isUnicefUser!: boolean;

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', 'metadata') ||
      !state.gddInterventions.current
    ) {
      return;
    }
    this.isUnicefUser = isUnicefUser(state);
    const currentIntervention = get(state, 'gddInterventions.current');
    if (currentIntervention && !isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);
      this._GDDFrsDetailsChanged(this.intervention.frs_details);
    }

    this.sePermissions(state);
    super.stateChanged(state);
  }

  private sePermissions(state: any) {
    const newPermissions = selectFundReservationPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.permissions = newPermissions;
    }
  }

  constructor() {
    super();
    listenForLangChanged(() => {
      this._GDDFrsDetailsChanged(this.intervention?.frs_details);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._createFrsDialogEl();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // remove update frs el on fr el detached
    this._removeFrsDialogEl();
  }

  _createFrsDialogEl() {
    // init frs update element
    this.frsDialogEl = document.createElement('gdd-update-fr-numbers') as GDDUpdateFrNumbers;
    this.frsDialogEl.setAttribute('id', 'frNumbersUpdateEl');

    // attach frs update handler (on modal/dialog close)
    this.frNumbersUpdateHandler = this.frNumbersUpdateHandler.bind(this);
    this.frsDialogEl.addEventListener('update-frs-dialog-close', this.frNumbersUpdateHandler as any);

    document.querySelector('body')!.appendChild(this.frsDialogEl);
  }

  _removeFrsDialogEl() {
    if (this.frsDialogEl) {
      this.frsDialogEl.removeEventListener('update-frs-dialog-close', this.frNumbersUpdateHandler as any);
      document.querySelector('body')!.removeChild(this.frsDialogEl);
    }
  }

  _openFrsDialog() {
    // populate dialog with current frs numbers deep copy
    const currentFrs = this._getCurrentFrs();
    const frs = currentFrs.map((fr: GDDFr) => {
      return {fr_number: fr.fr_number};
    });

    this.frsDialogEl.data = frs;
    this.frsDialogEl.interventionStatus = this.intervention.status;
    this.frsDialogEl.openDialog();
    this.openContentPanel();
  }

  // get original/initial intervention frs numbers
  _getCurrentFrs(): GDDFr[] {
    return this.intervention.frs_details && this.intervention.frs_details.frs instanceof Array
      ? this.intervention.frs_details.frs
      : [];
  }

  frNumbersUpdateHandler(e: CustomEvent) {
    e.stopImmediatePropagation();
    const frNumbers = e.detail.frs;
    if (frNumbers.length === 0) {
      this._handleEmptyFrsAfterUpdate();
      return;
    }
    // FR Numbers not empty
    this._handleNotEmptyFrsAfterUpdate(frNumbers);
  }

  /**
   * After FR Numbers update the numbers list might be empty.
   * This can happen if the user removed all the existing numbers or if there is no change made
   */
  _handleEmptyFrsAfterUpdate() {
    const frsBeforeUpdate = this._getCurrentFrs();
    if (frsBeforeUpdate.length !== 0) {
      // all FR Numbers have been deleted
      this._triggerPdFrsUpdate(new GDDFrsDetails());
    }
  }

  /**
   * Updates made and FR Numbers list is not empty
   */
  _handleNotEmptyFrsAfterUpdate(frNumbers: string[]) {
    const diff = getArraysDiff(this._getCurrentFrs(), frNumbers, 'fr_number');
    if (!diff.length) {
      // no changes have been made to FR Numbers
      this.frsDialogEl.closeDialog();
    } else {
      // request FR Numbers details from server
      this._triggerGDDFrsDetailsRequest(frNumbers);
    }
  }

  // handle frs validations warning confirmation
  _frsInconsistenciesConfirmationHandler(confirmed: boolean) {
    if (confirmed) {
      // confirmed, add numbers to intervention
      this._triggerPdFrsUpdate(Object.assign({}, this._lastGDDFrsDetailsReceived));
      this._lastGDDFrsDetailsReceived = null;
    } else {
      // frs warning not confirmed/cancelled, frs update is canceled
      // re-check frs warning on initial data
      this._GDDFrsDetailsChanged(this.intervention.frs_details);
    }
  }

  /**
   * Get FR Numbers details from server
   */
  _triggerGDDFrsDetailsRequest(frNumbers: string[]) {
    (this.frsDialogEl as GDDUpdateFrNumbers).startSpinner();

    let url =
      getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.frNumbersDetails).url +
      '?values=' +
      frNumbers.join(',');
    if (this.intervention.id) {
      url += '&gdd=' + this.intervention.id;
    }

    sendRequest({endpoint: {url: url}})
      .then((resp: GDDFrsDetails) => {
        this._GDDFrsDetailsSuccessHandler(resp);
      })
      .catch((error: any) => {
        this._GDDFrsDetailsErrorHandler(error.response);
      });
  }

  /*
   * Frs details received, check frs consistency
   */
  _GDDFrsDetailsSuccessHandler(GDDFrsDetails: GDDFrsDetails) {
    GDDFrsDetails.currencies_match = this._frsCurrenciesMatch(GDDFrsDetails.frs);

    const inconsistencyMsg = this.checkFrsConsistency(GDDFrsDetails, this.intervention, true);
    this._frsConsistencyWarning = inconsistencyMsg;

    if (inconsistencyMsg) {
      // there are inconsistencies
      this._lastGDDFrsDetailsReceived = GDDFrsDetails;

      this._openFrsInconsistenciesDialog(inconsistencyMsg);
    } else {
      // append FR numbers to intervention
      this._triggerPdFrsUpdate(GDDFrsDetails);
    }
  }

  /**
   * frs details request failed
   */
  _GDDFrsDetailsErrorHandler(responseErr: any) {
    this.frsDialogEl.stopSpinner();
    let toastMsg =
      responseErr && responseErr.error
        ? responseErr.error
        : (getTranslation('ADD_UPDATE_FR_NUMBER_ERR') as unknown as string);
    if (toastMsg.includes('HTTPConnection')) {
      const index = toastMsg.indexOf('HTTPConnection');
      toastMsg = toastMsg.slice(0, index);
    }
    // show the invalid frs warning
    fireEvent(this, 'toast', {
      text: toastMsg
    });
  }

  // trigger FR Numbers update on main intervention
  _triggerPdFrsUpdate(newGDDFrsDetails: GDDFrsDetails) {
    const frsIDs = (newGDDFrsDetails.frs || []).map((fr) => fr.id);
    this.frsDialogEl.closeDialog();
    getStore().dispatch<AsyncAction>(patchIntervention({frs: frsIDs}));
  }

  thereAreFrs(_GDDFrsDetails: any) {
    const frs = this._getCurrentFrs();
    return !!frs.length;
  }

  async _openFrsInconsistenciesDialog(inconsistencyMsg: string) {
    this.frsDialogEl.closeDialog();
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: html`${inconsistencyMsg} <br /><br />Do you want to continue?`,
        confirmBtnText: translate('YES')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
    this._frsInconsistenciesConfirmationHandler(confirmed);
  }

  _getNoFrsWarningText(interventionId: string) {
    let msg = translate('NO_FR_NUM_ADDED') as unknown as string;
    if (!interventionId) {
      msg = translate('CAN_NOT_ADD_FR_NUM') as unknown as string;
    }
    return msg;
  }

  _GDDFrsDetailsChanged(GDDFrsDetails: GDDFrsDetails) {
    if (!GDDFrsDetails) {
      return;
    }
    setTimeout(() => {
      this._frsConsistencyWarning = this.checkFrsConsistency(GDDFrsDetails, this.intervention);
    }, 100);
  }
}
