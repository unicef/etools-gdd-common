import pick from 'lodash-es/pick';
import {
  GDD,
  GDDPermissionsFields,
  GDDPlannedBudget,
  GDDManagementBudget,
  AnyObject
} from '@unicef-polymer/etools-types';

export class GDDModelsBase {
  setObjProperties(dataSource: GDD | GDDPermissionsFields | GDDPlannedBudget | GDDManagementBudget) {
    Object.assign(this, pick(dataSource, Object.keys(this as AnyObject)));
  }
  setObjProperty(propKey: string, propValue: AnyObject) {
    (<any>this)[propKey] = propValue;
  }
}
