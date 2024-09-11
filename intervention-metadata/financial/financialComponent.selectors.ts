import {createSelector} from 'reselect';
import {GDDFinancialComponentData, GDDFinancialComponentPermissions} from './financialComponent.models';
import {currentInterventionPermissions, currentIntervention} from '../../common/selectors';
import {Permission} from '@unicef-polymer/etools-types';
import {InterventionPermissionsFields, Intervention} from '@unicef-polymer/etools-types';

export const selectFinancialComponent = createSelector(currentIntervention, (intervention: Intervention) => {
  return new GDDFinancialComponentData(intervention);
});

export const selectFinancialComponentPermissions = createSelector(
  currentInterventionPermissions,
  (permissions: Permission<InterventionPermissionsFields>) => {
    return {
      edit: new GDDFinancialComponentPermissions(permissions!.edit),
      required: new GDDFinancialComponentPermissions(permissions!.required)
    };
  }
);
