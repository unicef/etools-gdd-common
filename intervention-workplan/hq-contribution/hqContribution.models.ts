import {GDD, GDDPermissionsFields, GDDPlannedBudget} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDHqContributionData extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  hq_support_cost = '';
  planned_budget = new GDDPlannedBudget();
}

export class GDDHqContributionPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  hq_support_cost = true;
  planned_budget = true;
}
