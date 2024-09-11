import {createSelector} from 'reselect';
import {GDDHqContributionData, GDDHqContributionPermissions} from './hqContribution.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectHqContributionData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDHqContributionData(intervention);
});

export const selectHqContributionPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDHqContributionPermissions(permissions!.edit),
      required: new GDDHqContributionPermissions(permissions!.required)
    };
  }
);
