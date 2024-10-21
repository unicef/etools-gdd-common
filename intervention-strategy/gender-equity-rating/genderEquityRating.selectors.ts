import {createSelector} from 'reselect';
import {GDDGenderEquityRating, GDDGenderEquityRatingPermissions} from './genderEquityRating.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectGenderEquityRating = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDGenderEquityRating(intervention);
});

export const selectGenderEquityRatingPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDGenderEquityRatingPermissions(permissions!.edit),
      required: new GDDGenderEquityRatingPermissions(permissions!.required)
    };
  }
);
