import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDPrcDocumentData extends GDDModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  prc_review_attachment: string | null = null;
  submitted_to_prc = false;
  status = '';
}

export class GDDPrcDocumentPermissions extends GDDModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  prc_review_attachment = true;
}
