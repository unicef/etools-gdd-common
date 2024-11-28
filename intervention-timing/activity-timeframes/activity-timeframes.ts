import {LitElement, html, TemplateResult, CSSResultArray} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {RootState} from '../../common/types/store.types';
import {ActivityTime, groupByYear, GroupedActivityTime, serializeTimeFrameData} from '../../utils/timeframes.helper';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {ActivityTimeframesStyles} from './activity-timeframes.styles';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {GDDActivity, GenericObject, GDDQuarter, GDDActivityTimeframe} from '@unicef-polymer/etools-types';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GDD, GDDResultLinkLowerResult, GDDExpectedResult} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {repeat} from 'lit/directives/repeat.js';

@customElement('gdd-activity-timeframes')
export class GDDActivityTimeframes extends CommentsMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=css
    return [layoutStyles, ActivityTimeframesStyles];
  }

  @property() intervention: GDD | null = null;
  @property() language = 'en';

  protected render(): TemplateResult {
    if (!this.intervention) {
      return html``;
    }

    const timeFrames: GroupedActivityTime[] = this.getTimeFrames();
    const mappedActivities: GenericObject<GDDActivity[]> = this.getActivities();
    return html`
      ${sharedStyles}
      <style>
        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('ACTIVITY_TIMEFRAMES')}
        comment-element="activity-timeframes"
      >
        ${!timeFrames.length
          ? html`
              <div class="align-items-baseline">
                <p>${translate('ACTIVITY_TIMES_MSG')}</p>
              </div>
            `
          : ''}
        <div class="row align-items-center time-frames">
          ${repeat(
            timeFrames,
            (timeFrames) => timeFrames[1],
            ([year, frames]: GroupedActivityTime, index: number) => html`
              <div class="col-12 align-items-center time-frames">
                <!--      Year title        -->
                <div class="year">${year}</div>

                <div class="frames-grid">
                  ${repeat(
                    frames,
                    (frame) => frame.frameDisplay,
                    ({name, frameDisplay, id}: ActivityTime, index: number) => html`
                      <!--   Frame data   -->
                      <div class="frame ${index === frames.length - 1 ? 'hide-border' : ''}">
                        <div class="frame-name">${name}</div>
                        <div class="frame-dates">${frameDisplay}</div>
                      </div>

                      <div class="activities-container ${index === frames.length - 1 ? 'hide-border' : ''}">
                        <div class="no-activities" ?hidden="${mappedActivities[id].length}">
                          - ${translate('NO_ACTIVITIES')}
                        </div>
                        ${mappedActivities[id].map(
                          ({name: activityName}: GDDActivity) => html`
                            <div class="activity-name">${translate('ACTIVITY')} ${activityName}</div>
                          `
                        )}
                      </div>
                    `
                  )}
                </div>
              </div>
              <div class="year-divider" ?hidden="${index === timeFrames.length - 1}"></div>
            `
          )}
        </div>
      </etools-content-panel>
    `;
  }

  stateChanged(state: RootState): void {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'gpd-interventions', 'timing')) {
      return;
    }
    this.language = state.activeLanguage.activeLanguage; // Set language property in order to trigger re-render
    this.intervention = state.gddInterventions.current;
    super.stateChanged(state);
  }

  private getTimeFrames(): GroupedActivityTime[] {
    if (!this.intervention) {
      return [];
    }
    // process time frames
    const quarters: GDDQuarter[] = this.intervention.quarters || [];
    const serialisedFrames: ActivityTime[] = serializeTimeFrameData(quarters as GDDActivityTimeframe[]);
    return groupByYear(serialisedFrames);
  }

  private getActivities(): GenericObject<GDDActivity[]> {
    if (!this.intervention) {
      return {};
    }

    // get activities array
    const keyInterventions: GDDResultLinkLowerResult[] = this.intervention.result_links
      .map(({gdd_key_interventions}: GDDExpectedResult) => gdd_key_interventions)
      .flat();
    const activities: GDDActivity[] = keyInterventions
      .map(({activities}: GDDResultLinkLowerResult) => activities)
      .flat();

    // map activities to time frames
    const quarters: GDDQuarter[] = this.intervention.quarters || [];
    const mappedActivities: GenericObject<GDDActivity[]> = quarters.reduce(
      (data: GenericObject<GDDActivity[]>, quarter: GDDQuarter) => ({
        ...data,
        [quarter.id]: []
      }),
      {}
    );
    activities.forEach((activity: GDDActivity) => {
      activity.time_frames.forEach((id: number) => {
        mappedActivities[id].push(activity);
      });
    });
    return mappedActivities;
  }
}
