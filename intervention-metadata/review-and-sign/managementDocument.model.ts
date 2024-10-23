import {GDD, GDDPermissionsFields, MinimalUser} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDReviewData extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
  }
  document_type = '';
  agreement = '';
  prc_review_attachment: string | null = null;
  submission_date_prc = '';
  submission_date = '';
  submitted_to_prc = false;
  review_date_prc = '';
  frs_details = [];
  signed_pd_attachment: string | null = null;
  status = '';
  partner_authorized_officer_signatory: MinimalUser | null = null;
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  unicef_signatory: MinimalUser | null = null;
  days_from_submission_to_approved = '';
  days_from_review_to_approved = '';
  termination_doc_attachment = '';
}

export class GDDReviewDataPermission extends GDDModelsBase {
  constructor(permissions: GDDPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  partner_authorized_officer_signatory = true;
  signed_by_partner_date = true;
  signed_by_unicef_date = true;
  unicef_signatory = true;
  signed_pd_attachment = true;
}
