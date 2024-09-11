import {createSelector} from 'reselect';
import {GDDBudgetSummary} from './budgetSummary.models';
import {currentIntervention} from '../selectors';
import {Intervention} from '@unicef-polymer/etools-types';

export const selectBudgetSummary = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDBudgetSummary(intervention);
});
