import {createSelector} from 'reselect';
import {GDDTimingOverviewData} from './timingOverview.models';
import {currentIntervention} from '../../common/selectors';
import {GDD} from '@unicef-polymer/etools-types';

export const selectTimingOverview = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDTimingOverviewData(intervention);
});
