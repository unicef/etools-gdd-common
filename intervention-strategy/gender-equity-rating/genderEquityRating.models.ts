import {GDD, GDDPermissionsFields} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDGenderEquityRating extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  gender_rating = '';
  gender_narrative = '';
  equity_rating = '';
  equity_narrative = '';
  sustainability_rating = '';
  sustainability_narrative = '';
}

export class GDDGenderEquityRatingPermissions extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  gender_rating = true;
  equity_rating = true;
  sustainability_rating = true;
  gender_narrative = true;
  equity_narrative = true;
  sustainability_narrative = true;
}
