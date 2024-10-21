import {createSelector} from 'reselect';
import {GDDBudgetSummary} from './budgetSummary.models';
import {currentIntervention} from '../selectors';
import {GDD} from '@unicef-polymer/etools-types';

export const selectBudgetSummary = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDBudgetSummary(intervention);
});
