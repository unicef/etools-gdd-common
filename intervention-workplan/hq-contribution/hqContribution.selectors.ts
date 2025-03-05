import {createSelector} from 'reselect';
import {GDDHqContributionData, GDDHqContributionPermissions} from './hqContribution.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectHqContributionData = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDHqContributionData(intervention);
});

export const selectHqContributionPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDHqContributionPermissions(permissions!.edit),
      required: new GDDHqContributionPermissions(permissions!.required)
    };
  }
);
