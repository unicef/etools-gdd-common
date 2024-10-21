import {createSelector} from 'reselect';
import {GDDPlannedVisits, GDDPlannedVisitsPermissions} from './programmaticVisits.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectPlannedVisits = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDPlannedVisits(intervention);
});

export const selectPlannedVisitsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDPlannedVisitsPermissions(permissions!.edit),
      required: new GDDPlannedVisitsPermissions(permissions!.required)
    };
  }
);
