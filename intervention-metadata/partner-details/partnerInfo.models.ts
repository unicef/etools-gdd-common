import {Intervention, InterventionPermissionsFields, MinimalUser} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDPartnerInfo extends GDDModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  partner_id: number | null = null;
  partner = '';
  partner_vendor = '';
  partner_focal_points: MinimalUser[] = [];
  agreement: number | null = null;
}

export class GDDPartnerInfoPermissions extends GDDModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  partner_focal_points = false;
  agreement = false;
}
