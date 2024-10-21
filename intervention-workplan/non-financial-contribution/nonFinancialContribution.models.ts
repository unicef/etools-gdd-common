import {GDD, GDDPermissionsFields} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDNonFinancialContributionData extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  ip_program_contribution = '';
}

export class GDDNonFinancialContributionPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  ip_program_contribution = true;
}
