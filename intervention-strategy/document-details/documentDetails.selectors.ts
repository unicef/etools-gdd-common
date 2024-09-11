import {createSelector} from 'reselect';
import {GDDDocumentDetails, GDDDocumentDetailsPermissions} from './documentDetails.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectDocumentDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDDocumentDetails(intervention);
});

export const selectDocumentDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDDocumentDetailsPermissions(permissions!.edit),
      required: new GDDDocumentDetailsPermissions(permissions!.required)
    };
  }
);
