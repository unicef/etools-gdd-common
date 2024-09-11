import {createSelector} from 'reselect';
import {GDDReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {currentInterventionPermissions} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';

export const selectReportingRequirementsPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDReportingRequirementsPermissions(permissions!.edit),
      required: new GDDReportingRequirementsPermissions(permissions!.required)
    };
  }
);
