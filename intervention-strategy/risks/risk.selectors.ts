import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {GDD} from '@unicef-polymer/etools-types';

export const selectRisks = createSelector(currentIntervention, (intervention: GDD) => {
  return (intervention && intervention.risks) || [];
});
