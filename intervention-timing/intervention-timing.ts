import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './reporting-requirements/partner-reporting-requirements';
import './intervention-dates/intervention-dates';
import './timing-overview/timing-overview';
import './activity-timeframes/activity-timeframes';
import './programmatic-visits/programmatic-visits';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {CommentElementMeta, CommentsMixin} from '../common/components/comments/comments-mixin';
import {RootState} from '../common/types/store.types';

/**
 * @customElement
 */
@customElement('gdd-intervention-timing')
export class GDDInterventionTiming extends CommentsMixin(LitElement) {
  @property() viewPlannedVisits = false;
  @property() viewPartnerReportingRequirements = false;
  render() {
    // language=HTML
    return html`
      <style></style>
      <gdd-timing-overview></gdd-timing-overview>
      <gdd-intervention-dates></gdd-intervention-dates>
      <gdd-activity-timeframes></gdd-activity-timeframes>
      ${this.viewPartnerReportingRequirements
        ? html`<gdd-partner-reporting-requirements
            class="content-section"
            .commentsMode="${this.commentMode}"
            comments-container
          ></gdd-partner-reporting-requirements>`
        : ''}
      ${this.viewPlannedVisits ? html`<gdd-programmatic-visits></gdd-programmatic-visits>` : ''}
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  stateChanged(state: RootState) {
    super.stateChanged(state);

    this.viewPlannedVisits = Boolean(state.interventions?.current?.permissions?.view!.planned_visits);
    this.viewPartnerReportingRequirements = Boolean(
      state.interventions?.current?.permissions?.view!.reporting_requirements
    );
  }

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    return Array.from(container.shadowRoot!.querySelectorAll('.nav-menu-item')).map((element: any, index: number) => {
      const relatedTo = `prp-${index}`;
      const relatedToDescription = element.getAttribute('title') as string;
      return {element, relatedTo, relatedToDescription};
    });
  }
}
