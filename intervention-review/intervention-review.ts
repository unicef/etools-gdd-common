import {LitElement, html, CSSResult, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../common/types/store.types';
import {GDDReview, User} from '@unicef-polymer/etools-types';
import './general-review-information/general-review-information';
import './review-members/review-members';
import './reviews-list/reviews-list';
import './overall-approval/overall-approval';
import '@unicef-polymer/etools-modules-common/dist/components/cancel/reason-display';
import {NO_REVIEW, PRC_REVIEW} from '../common/components/intervention/review.const';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {translate} from 'lit-translate';
import {cloneDeep} from 'lodash-es';

@customElement('gdd-intervention-review')
export class GDDInterventionReviewTab extends connectStore(LitElement) {
  @property() canEditReview = false;
  @property() canEditPRCReviews = false;
  @property() currentReview: GDDReview | null = null;
  @property() reviews: GDDReview[] = [];
  @property() unicefUsers: User[] = [];
  @property() cfeiNumber = '';
  @property() interventionStatus = '';

  get linkUrl(): string {
    return `https://www.unpartnerportal.org/cfei/open?agency=1&displayID=${encodeURIComponent(
      this.cfeiNumber
    )}&page=1&page_size=10`;
  }

  private interventionId: number | null = null;

  render() {
    // language=HTML
    return html`
      ${this.currentReview?.sent_back_comment && ['draft', 'development'].includes(this.interventionStatus)
        ? html`<reason-display .title="${translate('SECRETARY_COMMENT')}">
            <div class="text">${this.currentReview?.sent_back_comment}</div>
          </reason-display>`
        : ''}
      ${this.cfeiNumber
        ? html`<reason-display .title="${translate('CFEI_NOTIFICATION')}" .cfeiNumber="${this.cfeiNumber}">
            <div class="text">
              ${translate('GDD_COMPLETED_AFTER_UNPP')}
              <a href="${this.linkUrl}" target="_blank">${translate('GO_TO_UNPP')}</a>
            </div>
          </reason-display>`
        : ''}

      <gdd-general-review-information
        .reviews="${this.reviews}"
        .currentReview="${this.currentReview}"
        @review-changed="${this.reviewChanged}"
        .interventionId="${this.interventionId}"
      >
      </gdd-general-review-information>

      ${this.currentReview && this.currentReview.review_type != NO_REVIEW
        ? html`<gdd-review-members
              .review="${this.currentReview}"
              .interventionId="${this.interventionId}"
              .usersList="${this.unicefUsers}"
              .canEditAtLeastOneField="${this.canEditReview}"
            ></gdd-review-members>

            <gdd-reviews-list
              .review="${this.currentReview}"
              .readonly="${!this.canEditPRCReviews}"
              ?hidden="${this.currentReview?.review_type !== PRC_REVIEW}"
            ></gdd-reviews-list>

            <gdd-overall-approval
              .review="${this.currentReview}"
              .readonly="${!this.canEditReview}"
            ></gdd-overall-approval>`
        : null}
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'gdd-interv-page'
    });
  }

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(state?.app?.routeDetails, 'gdd-interventions', 'review') ||
      !state.gddInterventions.current
    ) {
      return;
    }

    this.reviews = state.gddInterventions.current.reviews;
    if (this.currentReview?.id) {
      this.currentReview = state.gddInterventions.current.reviews.find((x) => x.id === this.currentReview!.id) || null;
    }
    if (!this.currentReview && this.reviews?.length) {
      this.currentReview = state.gddInterventions.current.reviews[0];
    }
    this.unicefUsers = state.commonData?.unicefUsersData || [];
    this.canEditReview = state.gddInterventions.current.permissions!.edit.reviews || false;
    this.canEditPRCReviews = state.gddInterventions.current.permissions!.edit.prc_reviews || false;
    this.interventionId = state.gddInterventions.current.id;
    this.interventionStatus = state.gddInterventions.current.status;
    this.cfeiNumber = state.gddInterventions.current.cfei_number || '';
  }

  reviewChanged(ev: CustomEvent) {
    const selectedReview = this.reviews.find((x) => String(x.id) === String(ev.detail.id));
    if (selectedReview) {
      this.currentReview = cloneDeep(selectedReview);
    }
  }

  static get styles(): CSSResult {
    // language=css
    return css`
      *[hidden] {
        display: none !important;
      }
      reason-display {
        --flag-color: #ff9044;
        --text-wrap: none;
        --text-padding: 26px 24px 26px 80px;
      }
      :host-context([dir='rtl']) reason-display {
        --text-padding: 26px 80px 26px 24px;
      }
      a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
      }
    `;
  }
}
