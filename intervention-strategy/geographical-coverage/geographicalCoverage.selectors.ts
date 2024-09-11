import {createSelector} from 'reselect';
import {currentInterventionPermissions} from '../../common/selectors';
import {GDDLocationsPermissions} from './geographicalCoverage.models';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectLocationsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDLocationsPermissions(permissions!.edit),
      required: new GDDLocationsPermissions(permissions!.required)
    };
  }
);
