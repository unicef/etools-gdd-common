import {createSelector} from 'reselect';
import {GDDProgrammeDocDates, GDDInterventionDatesPermissions} from './interventionDates.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectInterventionDates = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDProgrammeDocDates(intervention);
});

export const selectInterventionDatesPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDInterventionDatesPermissions(permissions!.edit),
      required: new GDDInterventionDatesPermissions(permissions!.required)
    };
  }
);
