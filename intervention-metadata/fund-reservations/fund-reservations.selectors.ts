import {createSelector} from 'reselect';
import {currentInterventionPermissions} from '../../common/selectors';
import {GDDFundReservationsPermissions} from './fund-reservations.models';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields} from '@unicef-polymer/etools-types';

export const selectFundReservationPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDFundReservationsPermissions(permissions!.edit),
      required: new GDDFundReservationsPermissions(permissions!.required)
    };
  }
);
