import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {InfoElementStyles} from '@unicef-polymer/etools-modules-common/dist/styles/info-element-styles';
import {GDDInterventionOverview} from './interventionOverview.models';
import {selectInterventionOverview} from './interventionOverview.selectors';
import {RootState} from '../../common/types/store.types';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {formatDateLocalized} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import get from 'lodash-es/get';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate, get as getTranslation, langChanged} from 'lit-translate';
import {allPartners, currentIntervention, isUnicefUser} from '../../common/selectors';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {GDD} from '@unicef-polymer/etools-types/dist/models-and-classes/gdd.classes';
import {GDD_TABS} from '../../common/constants';
import GDD_CONSTANTS from '../../common/constants';
import {StaticPartner} from '@unicef-polymer/etools-types';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {getPageDirection} from '../../utils/utils';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

/**
 * @customElement
 */
@customElement('gdd-details-overview')
export class GDDDetailsOverview extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles, elevationStyles];
  }
  render() {
    // language=HTML
    if (!this.interventionOverview) {
      return html` ${sharedStyles}
        <etools-loading source="details-overview" active></etools-loading>`;
    }
    return html`
      ${InfoElementStyles} ${sharedStyles}
      <style>
        .data-column {
          max-width: none;
        }
        .data-column {
          margin-inline-end: 20px;
          padding-inline-start: 0px;
        }
      </style>
      <section class="elevation" elevation="1" comment-element="details">
        <div class="table not-allowed">
          <div class="data-column" ?hidden="${!this.isUnicefUser}">
            <label class="label">${translate('PARTNER_HACT_RR')}</label>
            <div class="input-label">${this.getPartnerHactRiskRatingHtml()}</div>
          </div>
          <div class="data-column" ?hidden="${!this.isUnicefUser}">
            <label class="label">${translate('PARTNER_PSEA_RR')}</label>
            <div class="input-label">${this.getPartnerPseaRiskRatingHtml()}</div>
          </div>
          <div class="data-column">
            <label class="label">${translate('CORE_VALUES_ASSESSMENT_DATE')}</label>
            <div class="input-label" ?empty="${!this.interventionPartner?.last_assessment_date}">
              ${formatDateLocalized(this.interventionPartner?.last_assessment_date)}
            </div>
          </div>
          <div class="data-column">
            <label class="label">${translate('PSEA_ASSESSMENT_DATE')}</label>
            <div class="input-label" ?empty="${!this.interventionPartner?.psea_assessment_date}">
              ${formatDateLocalized(this.interventionPartner?.psea_assessment_date)}
            </div>
          </div>
        </div>
        <div class="icon-tooltip-div">
          <info-icon-tooltip
            .tooltipText="${translate('METADATA_TOOLTIP')}"
            position="${this.dir == 'rtl' ? 'right' : 'left'}"
          >
          </info-icon-tooltip>
        </div>
      </section>
    `;
  }

  @property({type: Array})
  interventionPartner!: AnyObject;

  @property({type: Object})
  intervention!: GDD;

  @property({type: Object})
  interventionOverview!: GDDInterventionOverview;

  @property({type: Boolean})
  isUnicefUser = false;

  connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gdd-interventions', GDD_TABS.Metadata)) {
      return;
    }

    if (state.gddInterventions.current) {
      this.interventionOverview = selectInterventionOverview(state);
      this.isUnicefUser = isUnicefUser(state);
      this.intervention = currentIntervention(state);
      this.interventionPartner =
        allPartners(state).find((partner: StaticPartner) => partner.name === this.intervention.partner) || {};
      this.dir = getPageDirection(state);
    }

    super.stateChanged(state);
  }

  private _getText(value: boolean) {
    if (value === undefined) {
      return '-';
    }

    return langChanged(() => {
      if (value) {
        return getTranslation('YES');
      } else {
        return getTranslation('NO');
      }
    });
  }

  getPartnerPseaRiskRatingHtml() {
    if (!this.interventionPartner?.sea_risk_rating_name) {
      return html`${translate('NA')}`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/psea/assessments/list?partner=${this.intervention.partner_id}">
      <strong class="blue">${translateValue(this.interventionPartner.sea_risk_rating_name, 'RISK_RATINGS')}</strong></a
    >`;
  }

  getPartnerHactRiskRatingHtml() {
    if (!this.interventionPartner?.rating) {
      return html`${translate('NA')}`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/ap/engagements/list?partner__in=${this.intervention.partner_id}">
      <strong class="blue">${translateValue(this.interventionPartner.rating, 'RISK_RATINGS')}</strong></a
    >`;
  }
  getDocumentLongName(value: any) {
    if (!value) {
      return;
    }

    const name = (GDD_CONSTANTS.DOCUMENT_TYPES_LONG as any)[value.toUpperCase()];
    return translateValue(name, 'ITEM_TYPE');
  }
}
