import {GDD, GDDPermissionsFields, GDDPlannedBudget} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDOtherData extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  planned_budget = new GDDPlannedBudget();
  document_type = '';
  humanitarian_flag = false;
  activation_protocol = '';
  confidential = false;
  cfei_number = '';
}

export class GDDOtherPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  document_type = true;
  document_currency = true;
  confidential = true;
  cfei_number = false;
}
