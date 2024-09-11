import {createSelector} from 'reselect';
import {GDDTimingOverviewData} from './timingOverview.models';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectTimingOverview = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDTimingOverviewData(intervention);
});
