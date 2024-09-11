import {createSelector} from 'reselect';
import {GDDPrcDocumentData, GDDPrcDocumentPermissions} from './prcDocument.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectPrcDocumentData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDPrcDocumentData(intervention);
});

export const selectPrcDocumentPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDPrcDocumentPermissions(permissions!.edit),
      required: new GDDPrcDocumentPermissions(permissions!.required)
    };
  }
);
