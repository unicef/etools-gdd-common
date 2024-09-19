import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class PdAmendmentPermissions extends GDDModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  amendments = true;
}

export enum AmendmentsKind {
  normal = 'normal'
}

export const AmendmentsKindTranslateKeys = {
  [AmendmentsKind.normal]: 'NORMAL'
};
