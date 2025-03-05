import {GDD, GDDPermissionsFields, AnyObject} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDPdEWorkplans extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  e_workplans: AnyObject[] = [];
  country_programme: number | null = null;
}

export class GDDPdEWorkplansPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  e_workplans = true;
}
