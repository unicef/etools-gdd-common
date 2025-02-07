import {createSelector} from 'reselect';
import {GDDPdEWorkplans, GDDPdEWorkplansPermissions} from './eworkplans.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectPdEWorkplans = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDPdEWorkplans(intervention);
});

export const selectPdEWorkplansPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDPdEWorkplansPermissions(permissions!.edit),
      required: new GDDPdEWorkplansPermissions(permissions!.required),
      view: new GDDPdEWorkplansPermissions(permissions!.view!)
    };
  }
);
