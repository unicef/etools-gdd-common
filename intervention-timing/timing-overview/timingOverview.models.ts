// @lajos TO DO: values are populated
// @lajos TO DO: check with backend about cfei_number and humanitarian values, where they shuld come from

import {GDD} from '@unicef-polymer/etools-types';
import {GDDModelsBase} from '../../common/models/models.base';

export class GDDTimingOverviewData extends GDDModelsBase {
  constructor(intervention: GDD) {
    super();
    this.setObjProperties(intervention);
    this.date_last_amended = intervention.amendments[0]?.signed_by_unicef_date || '';
  }
  created = '';
  date_sent_to_partner = '';
  submission_date = '';
  submission_date_prc = '';
  review_date_prc = '';
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  days_from_submission_to_approved = '';
  days_from_review_to_approved = '';
  date_last_amended = '';
}
