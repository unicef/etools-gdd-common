import {createSelector} from 'reselect';
import {GDDInterventionOverview} from './interventionOverview.models';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectInterventionOverview = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDInterventionOverview(intervention);
});
