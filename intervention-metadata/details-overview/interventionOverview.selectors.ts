import {createSelector} from 'reselect';
import {GDDInterventionOverview} from './interventionOverview.models';
import {currentIntervention} from '../../common/selectors';
import {GDD} from '@unicef-polymer/etools-types';

export const selectInterventionOverview = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDInterventionOverview(intervention);
});
