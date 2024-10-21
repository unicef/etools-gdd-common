import {createSelector} from 'reselect';
import {currentIntervention} from '../../common/selectors';
import {GDD} from '@unicef-polymer/etools-types';

export const selectSupplyAgreement = createSelector(currentIntervention, (intervention: GDD) => {
  return (intervention && intervention.supply_items) || [];
});

export const selectSupplyAgreementPermissions = createSelector(currentIntervention, (intervention: GDD) => {
  const permissions = intervention && intervention.permissions;
  return {
    edit: {supply_items: permissions?.edit.supply_items}
  };
});
