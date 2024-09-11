import {InterventionPermissionsFields, Intervention, PlannedVisit} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDPlannedVisits extends GDDModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  planned_visits: PlannedVisit[] = [];
}

export class GDDPlannedVisitsPermissions extends GDDModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  planned_visits = false;
}
