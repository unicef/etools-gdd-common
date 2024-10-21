import {createSelector} from 'reselect';
import {GDDPartnerInfo, GDDPartnerInfoPermissions} from './partnerInfo.models';
import {currentIntervention, currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectPartnerDetails = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDPartnerInfo(intervention);
});

export const selectPartnerDetailsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDPartnerInfoPermissions(permissions!.edit),
      required: new GDDPartnerInfoPermissions(permissions!.required),
      view: new GDDPartnerInfoPermissions(permissions!.view!)
    };
  }
);
