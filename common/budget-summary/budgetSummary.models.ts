import {GDD} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../models/models.base';

export class GDDBudgetSummary extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention.planned_budget);
    this.hq_support_cost = intervention.hq_support_cost!;
  }
  currency = '';
  hq_support_cost = '';
  programme_effectiveness = '';
  partner_contribution_local = '';
  unicef_cash_local = '';
  total_supply = 0;
  partner_contribution_percent = 0;
  total_local = 0;
  total_unicef_contribution_local = 0;
  total_cash_local = 0;
  total_hq_cash_local = 0;
  partner_supply_local = 0;
  total_partner_contribution_local = 0;
}
