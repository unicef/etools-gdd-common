import {LitElement, html, CSSResultArray, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {GDDReview, GDDPrcOfficerReview} from '@unicef-polymer/etools-types';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {loadPrcMembersIndividualReviews} from '../../common/actions/officers-reviews';
import isEqual from 'lodash-es/isEqual';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../common/types/store.types';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from '../../common/components/intervention/review.const';
import {formatDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '../../common/components/intervention/review-checklist-popup';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

@customElement('gdd-reviews-list')
export class GDDReviewsList extends connectStore(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      css`
        :host {
          margin-top: 24px;
        }
        div[slot='row-data'] {
          display: flex;
          position: relative;
        }
        div[slot='row-data'] div {
          padding-inline-end: 16px;
        }
        .answer {
          font-size: var(--etools-font-size-14, 14px);
          margin-bottom: 10px;
        }
        .answer:last-child {
          margin-bottom: 0;
        }
        .editable-row {
          line-height: 24px;
        }
      `
    ];
  }

  private _review!: GDDReview;
  set review(review: GDDReview) {
    // Info: this._review is not persisted on nav to list and back to pd review (component is removed from DOM)
    const oldOfficers: number[] | undefined = this._review ? this._review.prc_officers : undefined;

    this._review = review;
    if (oldOfficers == undefined || !isEqual(oldOfficers, review?.prc_officers)) {
      getStore().dispatch<any>(loadPrcMembersIndividualReviews(review.id));
    }
  }

  @property({type: Object})
  get review(): GDDReview {
    return this._review;
  }

  @property() approvals: GDDPrcOfficerReview[] = [];
  @property() readonly = false;
  @property() currentUserId!: number;
  @property({type: Boolean})
  lowResolutionLayout = false;

  render(): TemplateResult {
    return html`
      ${sharedStyles}
      <etools-media-query
        query="(max-width: 1200px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel class="content-section" panel-title=${translate('PRC_MEMBER_REVIEWS')}>
        <etools-data-table-header
          no-title
          ?no-collapse="${!this.approvals.length}"
          .lowResolutionLayout="${this.lowResolutionLayout}"
        >
          <etools-data-table-column class="col-3">${translate('PRC_NAME')}</etools-data-table-column>
          <etools-data-table-column class="col-2">${translate('APPROVED_BY_PRC')}</etools-data-table-column>
          <etools-data-table-column class="col-5">${translate('APPROVAL_COMMENT')}</etools-data-table-column>
          <etools-data-table-column class="col-2">${translate('REVIEW_DATE_PRC')}</etools-data-table-column>
        </etools-data-table-header>
        ${this.approvals.map(
          (approval) => html`
            <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="editable-row">
                <div class="col-data col-3" data-col-header-label="${translate('PRC_NAME')}">${approval.user.name}</div>
                <div class="col-data col-2" data-col-header-label="${translate('APPROVED_BY_PRC')}">
                  <etools-icon name="${approval.overall_approval ? 'check' : 'close'}"></etools-icon>
                </div>
                <div class="col-data col-5" data-col-header-label="${translate('APPROVAL_COMMENT')}">
                  ${approval.overall_comment || '-'}
                </div>
                <div class="col-data col-2" data-col-header-label="${translate('REVIEW_DATE_PRC')}">
                  ${formatDate(approval.review_date as string, 'DD MMM YYYY')}
                </div>
                <div class="hover-block" ?hidden="${this.readonly || approval.user.id !== this.currentUserId}">
                  <etools-icon-button
                    name="create"
                    @click="${() => this.openReviewPopup(approval)}"
                  ></etools-icon-button>
                </div>
              </div>

              <div slot="row-data-details">
                ${Object.entries(REVIEW_QUESTIONS).map(
                  ([field, question]: [string, string], index: number) => html`
                    <div>
                      <label class="label">Q${index + 1}: ${question}</label>
                    </div>
                    <div class="answer">${REVIEW_ANSVERS.get((approval as any)[field]) || '-'}</div>
                  `
                )}
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.approvals.length}">
          <div slot="row-data">
            <div class="col-data col-3" data-col-header-label="${translate('PRC_NAME')}">-</div>
            <div class="col-data col-2" data-col-header-label="${translate('APPROVED_BY_PRC')}">-</div>
            <div class="col-data col-5" data-col-header-label="${translate('APPROVAL_COMMENT')}">-</div>
            <div class="col-data col-2" data-col-header-label="${translate('REVIEW_DATE_PRC')}">-</div>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(state?.app?.routeDetails, 'gpd-interventions', 'review')) {
      return;
    }
    this.approvals = state.prcIndividualReviews || [];
    this.currentUserId = state.user.data!.user;
  }

  openReviewPopup(review?: any) {
    openDialog({
      dialog: 'gdd-review-checklist-popup',
      dialogData: {
        review
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
  }
}
