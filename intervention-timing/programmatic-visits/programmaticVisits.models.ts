import {GDDPermissionsFields, GDD, GDDPlannedVisit} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDPlannedVisits extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  planned_visits: GDDPlannedVisit[] = [];
}

export class GDDPlannedVisitsPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  planned_visits = false;
}
