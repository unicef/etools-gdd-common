import {createSelector} from 'reselect';
import {GDDPdUnicefDetails, GDDPdUnicefDetailsPermissions} from './pdUnicefDetails.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectPdUnicefDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDPdUnicefDetails(intervention);
});

export const selectPdUnicefDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDPdUnicefDetailsPermissions(permissions!.edit),
      required: new GDDPdUnicefDetailsPermissions(permissions!.required),
      view: new GDDPdUnicefDetailsPermissions(permissions!.view!)
    };
  }
);
