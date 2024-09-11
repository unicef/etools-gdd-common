import {createSelector} from 'reselect';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {
  GDDProgrammeManagement,
  GDDProgrammeManagementActivityPermissions
} from './effectiveEfficientProgrammeMgmt.models';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectProgrammeManagement = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDProgrammeManagement(intervention);
});

export const selectProgrammeManagementActivityPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDProgrammeManagementActivityPermissions(permissions!.edit),
      required: new GDDProgrammeManagementActivityPermissions(permissions!.required)
    };
  }
);
