import {createSelector} from 'reselect';
import {GDDPartnerInfo, GDDPartnerInfoPermissions} from './partnerInfo.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectPartnerDetails = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDPartnerInfo(intervention);
});

export const selectPartnerDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDPartnerInfoPermissions(permissions!.edit),
      required: new GDDPartnerInfoPermissions(permissions!.required),
      view: new GDDPartnerInfoPermissions(permissions!.view!)
    };
  }
);
