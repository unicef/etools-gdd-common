import {createSelector} from 'reselect';
import {
  GDDNonFinancialContributionData,
  GDDNonFinancialContributionPermissions
} from './nonFinancialContribution.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectNonFinancialContribution = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDNonFinancialContributionData(intervention);
});

export const selectNonFinancialContributionPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDNonFinancialContributionPermissions(permissions!.edit),
      required: new GDDNonFinancialContributionPermissions(permissions!.required)
    };
  }
);
