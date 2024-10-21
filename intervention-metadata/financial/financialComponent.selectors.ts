import {createSelector} from 'reselect';
import {GDDFinancialComponentData, GDDFinancialComponentPermissions} from './financialComponent.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {GDDPermissionsFields, GDD} from '@unicef-polymer/etools-types';

export const selectFinancialComponent = createSelector(currentIntervention, (intervention: GDD) => {
  return new GDDFinancialComponentData(intervention);
});

export const selectFinancialComponentPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<GDDPermissionsFields>) => {
    return {
      edit: new GDDFinancialComponentPermissions(permissions!.edit),
      required: new GDDFinancialComponentPermissions(permissions!.required)
    };
  }
);
