import {GDD} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDInterventionOverview extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  document_type = '';
  cfei_number = '';
  humanitarian_flag = false;
}
