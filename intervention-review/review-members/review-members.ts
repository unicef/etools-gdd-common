import {LitElement, TemplateResult, html, CSSResultArray, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {EtoolsEndpoint, GDD, GDDReview, User} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../common/actions/gddInterventions';

import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import {PRC_REVIEW} from '../../common/components/intervention/review.const';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import {addItemToListIfMissing} from '../../utils/utils';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';

@customElement('gdd-review-members')
export class GDDReviewMembers extends ComponentBaseMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      css`
        :host {
          display: block;
          margin-top: 24px;
        }
        datepicker-lite {
          margin-inline-end: 24px;
        }

        .row:not(:first-child) {
          padding-top: 0;
        }
        datepicker-lite {
          min-width: 180px;
        }
        etools-dropdown-multi {
          max-width: initial;
        }
        etools-button::part(base) {
          padding: 0 10px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        .flex-1 {
          flex: 1 1 0%;
        }
      `
    ];
  }

  @property({type: Object}) intervention: Partial<GDD> = {};
  @property() set review(review: GDDReview) {
    this.originalData = review;
    this.data = cloneDeep(review);
    addItemToListIfMissing(this.data?.overall_approver, this.users, 'id');
  }
  users!: User[];

  @property() set usersList(users: User[]) {
    this.users = users;
    addItemToListIfMissing(this.data?.overall_approver, this.users, 'id');
  }

  get showNotifyButton(): boolean {
    return (
      this.canEditAtLeastOneField && !this.editMode && this.data?.overall_approver && this.data?.authorized_officer
    );
  }
  private interventionId!: number;

  render(): TemplateResult {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        .ml-auto {
          margin-left: auto;
        }
      </style>
      <etools-content-panel class="content-section" panel-title="${translate('GDD_REVIEW_MEMBERS')}">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row" ?hidden="${this.originalData?.review_type !== PRC_REVIEW}">
          <datepicker-lite
            class="col-md-4 col-sm-12"
            label="${translate('MEETING_DATE')}"
            ?readonly="${this.isReadonly(this.editMode, true)}"
            .value="${this.data?.meeting_date}"
            selected-date-display-format="D MMM YYYY"
            fire-date-has-changed
            @date-has-changed="${(e: CustomEvent) => this.dateHasChanged(e.detail, 'meeting_date')}"
          >
          </datepicker-lite>
        </div>
        <div class="row">
          <etools-dropdown
            class="col-md-4 col-sm-12"
            label=${translate('OVERALL_APPROVER')}
            placeholder="&#8212;"
            .options="${this.users}"
            .selected="${this.getDefaultApprover(this.editMode, this.data?.overall_approver?.id)}"
            ?readonly="${this.isReadonly(this.editMode, this.canEditAtLeastOneField)}"
            option-label="name"
            option-value="id"
            ?trigger-value-change-event="${this.users.length}"
            @etools-selected-item-changed="${({detail}: CustomEvent) => {
              this.selectedUserChanged(detail, 'overall_approver');
            }}"
          >
          </etools-dropdown>
          <etools-dropdown
            class="col-md-4 col-sm-12"
            label=${translate('AUTH_OFFICER')}
            placeholder="&#8212;"
            .options="${this.users}"
            .selected="${this.getDefaultAuthOfficer(this.editMode, this.data?.authorized_officer?.id)}"
            ?readonly="${this.isReadonly(this.editMode, this.canEditAtLeastOneField)}"
            option-label="name"
            option-value="id"
            ?trigger-value-change-event="${this.users.length}"
            @etools-selected-item-changed="${({detail}: CustomEvent) => {
              this.selectedUserChanged(detail, 'authorized_officer');
            }}"
          >
          </etools-dropdown>
          <div class="col-md-4 col-sm-12 layout-horizontal align-items-center">
            <etools-button
              class="ml-auto"
              variant="primary"
              @click="${this.sendNotification}"
              ?hidden="${!this.showNotifyButton}"
            >
              ${translate('SEND_NOTIFICATIONS')}
            </etools-button>
          </div>
        </div>

        ${this.renderActions(this.editMode, true)}
      </etools-content-panel>
    `;
  }

  getDefaultApprover(editMode: boolean, id?: number) {
    if (!id && editMode) {
      return this.intervention?.unicef_focal_points?.length ? this.intervention?.unicef_focal_points[0].id : id;
    }
    return id;
  }

  getDefaultAuthOfficer(editMode: boolean, id?: number) {
    if (!id && editMode) {
      return this.intervention?.budget_owner ? this.intervention?.budget_owner.id : id;
    }
    return id;
  }

  saveData(): Promise<void> {
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(gddEndpoints.interventionReview, {
      id: this.data!.id,
      interventionId: this.interventionId
    });
    return sendRequest({
      endpoint,
      method: 'PATCH',
      body: {
        overall_approver: this.data.overall_approver?.id || null,
        authorized_officer: this.data.authorized_officer?.id || null
      }
    })
      .then((response: any) => {
        getStore().dispatch(updateCurrentIntervention(response.gdd));
        this.editMode = false;
      })
      .catch((err: any) => {
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      });
  }

  sendNotification(): void {
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(
      gddEndpoints.sendAuthorizedOfficerReviewNotification,
      {
        id: this.data!.id,
        interventionId: this.interventionId
      }
    );
    sendRequest({
      endpoint,
      method: 'POST'
    })
      .then(() => {
        fireEvent(this, 'toast', {text: getTranslation('NOTIFICATION_SENT_SUCCESS')});
      })
      .catch((err: any) => {
        if (err.response.already_sent_today) {
          fireEvent(this, 'toast', {text: `${getTranslation('NOTIFICATION_ALREADY_SENT_TODAY')}`});
          return;
        }
        const errorText = err?.response?.detail || getTranslation('TRY_AGAIN_LATER');
        fireEvent(this, 'toast', {text: `${getTranslation('CAN_NOT_SEND_NOTIFICATION')} ${errorText}`});
      });
  }
}
