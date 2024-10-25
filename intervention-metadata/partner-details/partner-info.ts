import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {selectPartnerDetails, selectPartnerDetailsPermissions} from './partnerInfo.selectors';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {GDDPartnerInfo, GDDPartnerInfoPermissions} from './partnerInfo.models';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {patchIntervention} from '../../common/actions/gddInterventions';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../common/types/store.types';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission, PartnerStaffMember, MinimalAgreement} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation, langChanged} from 'lit-translate';

/**
 * @customElement
 */
@customElement('gdd-partner-info')
export class GDDPartnerInfoElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .placeholder {
          color: var(--secondary-text-color);
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title="${translate('PARTNER_DETAILS')}"
        comment-element="partner-details"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row">
          <div class="col-md-8 col-12">
            <etools-input
              class="w100"
              label=${translate('GOVERNMENT_ORGANIZATION')}
              .value="${this.data?.partner}"
              required
              readonly
              always-float-label
              tabindex="-1"
            >
            </etools-input>
          </div>
          <div class="col-md-4 col-12">
            <etools-dropdown
              id="agreements"
              label=${translate('AGREEMENTS')}
              .options="${this.partnerAgreements}"
              .selected="${this.data?.agreement}"
              option-value="id"
              option-label="agreement_number_status"
              readonly
              auto-validate
            >
            </etools-dropdown>
          </div>
          <div class="col-md-8 col-12">
            <etools-input
              class="w100"
              label=${translate('PARTNER_VENDOR_NUMBER')}
              .value="${this.data?.partner_vendor}"
              tabindex="-1"
              readonly
              always-float-label
            >
            </etools-input>
          </div>
          <div class="col-md-8 col-12" ?hidden="${!this.permissions?.view!.partner_focal_points}">
            <etools-dropdown-multi
              label=${translate('PARTNER_FOCAL_POINTS')}
              .selectedValues="${this.data?.partner_focal_points?.map((f: any) => f.id)}"
              .options="${langChanged(() => this.formattedPartnerStaffMembers)}"
              option-label="name"
              option-value="id"
              ?required=${this.permissions?.required.partner_focal_points}
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) =>
                this.selectedUsersChanged(detail, 'partner_focal_points')}"
              ?hidden="${this.isReadonly(this.editMode, this.permissions?.edit.partner_focal_points)}"
            >
            </etools-dropdown-multi>
            ${this.isReadonly(this.editMode, this.permissions?.edit.partner_focal_points)
              ? html`<label for="focalPointsDetails" class="label">${translate('PARTNER_FOCAL_POINTS')}</label>
                  <div id="focalPointsDetails">
                    ${this.renderReadonlyUserDetails(
                      this.originalData?.partner_focal_points ? this.originalData?.partner_focal_points : []
                    )}
                  </div>`
              : html``}
          </div>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: GDDPartnerInfo;

  @property({type: Object})
  data!: GDDPartnerInfo;

  @property({type: Object})
  permissions!: Permission<GDDPartnerInfoPermissions>;

  @property({type: Array})
  partnerStaffMembers!: PartnerStaffMember[];

  @property({type: Array})
  partnerAgreements!: MinimalAgreement[];

  get formattedPartnerStaffMembers() {
    return this.partnerStaffMembers?.map((member: PartnerStaffMember) => ({
      name: `${
        !member.active
          ? `[${getTranslation('INACTIVE')}]`
          : member.has_active_realm
          ? ''
          : `[${getTranslation('NO_ACCESS')}]`
      } ${member.first_name} ${member.last_name} (${member.email})`,
      id: member.id
    }));
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async stateChanged(state: RootState) {
    if (
      !state.gddInterventions.current ||
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gdd-interventions', 'metadata')
    ) {
      return;
    }

    super.stateChanged(state);
    await this.setPartnerDetailsAndPopulateDropdowns(state);

    this.permissions = selectPartnerDetailsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  async setPartnerDetailsAndPopulateDropdowns(state: any) {
    const newPartnerDetails = selectPartnerDetails(state);

    if (!isJsonStrMatch(this.originalData, newPartnerDetails)) {
      const partnerIdHasChanged = this.partnerIdHasChanged(newPartnerDetails);
      if (partnerIdHasChanged) {
        this.partnerStaffMembers = await this.getAllPartnerStaffMembers(newPartnerDetails.partner_id!);
      }
      // Wait for partnerStaffMembers to be set, to avoid timing issues on dropdown selectedItems
      this.data = cloneDeep(newPartnerDetails);
      this.originalData = cloneDeep(this.data);
    }

    const agreements = get(state, 'agreements.list');
    if (agreements) {
      this.partnerAgreements = this.filterAgreementsByPartner(agreements, newPartnerDetails.partner_id!);
    }
  }

  filterAgreementsByPartner(agreements: MinimalAgreement[], partnerId: number) {
    return agreements.filter((a: any) => String(a.partner) === String(partnerId));
  }

  partnerIdHasChanged(newPartnerDetails: GDDPartnerInfo) {
    return get(this.data, 'partner_id') !== newPartnerDetails.partner_id;
  }

  getAllPartnerStaffMembers(partnerId: number) {
    return sendRequest({
      endpoint: getEndpoint(gddEndpoints.partnerStaffMembers, {id: partnerId})
    }).then((resp) => {
      return resp.sort(
        (a: PartnerStaffMember, b: PartnerStaffMember) =>
          Number(b.active) - Number(a.active) ||
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      );
    });
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.formatUsersData(this.data)))
      .then(() => {
        this.editMode = false;
      });
  }
  private formatUsersData(data: GDDPartnerInfo) {
    return {partner_focal_points: (data.partner_focal_points || []).map((u: any) => u.id)};
  }
}
