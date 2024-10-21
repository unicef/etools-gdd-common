import {GDD, GDDPermissionsFields} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDProgrammeDocDates extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  start = '';
  end = '';
  activation_letter_attachment = '';
  status = ''; // intervention status
}

export class GDDInterventionDatesPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  start = false;
  end = false;
  activation_letter_attachment = false;
}
