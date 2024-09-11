import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDProgrammeDocDates extends GDDModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  start = '';
  end = '';
  contingency_pd = false;
  activation_letter_attachment = '';
  status = ''; // intervention status
}

export class GDDInterventionDatesPermissions extends GDDModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  start = false;
  end = false;
  activation_letter_attachment = false;
}
