import {GDD, GDDPermissionsFields, AnyObject} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDPdUnicefDetails extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  offices: AnyObject[] = [];
  sections: AnyObject[] = [];
  e_workplans: AnyObject[] = [];
  unicef_focal_points: AnyObject[] = [];
  budget_owner: AnyObject = {};
  country_programme: number | null = null;
}

export class GDDPdUnicefDetailsPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  offices = true;
  sections = true;
  unicef_focal_points = true;
  budget_owner = true;
  country_programme = true;
  e_workplans = true;
  lead_section = true;
}
