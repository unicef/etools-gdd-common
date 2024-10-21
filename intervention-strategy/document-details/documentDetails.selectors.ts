import {createSelector} from 'reselect';
import {GDDDocumentDetails, GDDDocumentDetailsPermissions} from './documentDetails.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectDocumentDetails = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDDocumentDetails(intervention);
});

export const selectDocumentDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDDocumentDetailsPermissions(permissions!.edit),
      required: new GDDDocumentDetailsPermissions(permissions!.required)
    };
  }
);
