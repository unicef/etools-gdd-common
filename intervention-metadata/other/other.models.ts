import {Intervention, InterventionPermissionsFields, PlannedBudget} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDOtherData extends GDDModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  planned_budget = new PlannedBudget();
  document_type = '';
  humanitarian_flag = false;
  activation_protocol = '';
  confidential = false;
  cfei_number = '';
}

export class GDDOtherPermissions extends GDDModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  document_type = true;
  document_currency = true;
  confidential = true;
  cfei_number = false;
}
