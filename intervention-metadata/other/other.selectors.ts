import {createSelector} from 'reselect';
import {GDDOtherData, GDDOtherPermissions} from './other.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectOtherData = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDOtherData(intervention);
});

export const selectOtherPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDOtherPermissions(permissions!.edit),
      required: new GDDOtherPermissions(permissions!.required),
      view: new GDDOtherPermissions(permissions!.view!)
    };
  }
);
