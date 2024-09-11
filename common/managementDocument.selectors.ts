import {createSelector} from 'reselect';
import {currentIntervention, currentInterventionPermissions} from './selectors';
import {
  GDDReviewData,
  GDDReviewDataPermission
} from '../intervention-metadata/review-and-sign/managementDocument.model';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectReviewData = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDReviewData(intervention);
});

export const selectDatesAndSignaturesPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDReviewDataPermission(permissions!.edit),
      required: new GDDReviewDataPermission(permissions!.required),
      view: new GDDReviewDataPermission(permissions!.view!)
    };
  }
);
