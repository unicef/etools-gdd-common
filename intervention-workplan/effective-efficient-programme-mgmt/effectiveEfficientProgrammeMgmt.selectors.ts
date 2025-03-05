import {createSelector} from 'reselect';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {
  GDDProgrammeManagement,
  GDDProgrammeManagementActivityPermissions
} from './effectiveEfficientProgrammeMgmt.models';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectProgrammeManagement = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDProgrammeManagement(intervention);
});

export const selectProgrammeManagementActivityPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDProgrammeManagementActivityPermissions(permissions!.edit),
      required: new GDDProgrammeManagementActivityPermissions(permissions!.required)
    };
  }
);
