import {AnyObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

const EXPORT_COMMENTS = 'download_comments';
const EXPORT_RESULTS = 'export_results';
const EXPORT_PDF = 'export_pdf';
const EXPORT_XLS = 'export_xls';
const EXPORT_COMMENTS_GDD = 'download_comments_gdd';
const EXPORT_RESULTS_GDD = 'export_results_gdd';
const EXPORT_PDF_GDD = 'export_pdf_gdd';
const EXPORT_XLS_GDD = 'export_xls_gdd';

export const SEND_TO_PARTNER = 'send_to_partner';
export const SEND_TO_UNICEF = 'send_to_unicef';
export const UNLOCK = 'unlock';
export const SIGN = 'sign';
export const SIGN_BUDGET_OWNER = 'sign_budget_owner';

const ACCEPT = 'accept';
export const REVIEW = 'review';
export const PRC_REVIEW = 'individual_review';
export const CANCEL = 'cancel';
export const ACCEPT_REVIEW = 'accept_review';
export const SIGNATURE = 'signature';
export const AMENDMENT_MERGE = 'amendment_merge';
export const TERMINATE = 'terminate';
export const REJECT_REVIEW = 'reject_review';
export const ACCEPT_ON_BEHALF_OF_PARTNER = 'accept_on_behalf_of_partner';
export const SEND_BACK_REVIEW = 'send_back_review';
export const SUSPEND = 'suspend';
export const UNSUSPEND = 'unsuspend';

export const EXPORT_ACTIONS = [EXPORT_PDF, EXPORT_XLS, EXPORT_COMMENTS, EXPORT_RESULTS];
export const BACK_ACTIONS = [SEND_TO_PARTNER, SEND_TO_UNICEF, UNLOCK, REJECT_REVIEW, SEND_BACK_REVIEW];
export const ACTIONS_WITH_INPUT = [
  CANCEL,
  TERMINATE,
  REVIEW,
  PRC_REVIEW,
  REJECT_REVIEW,
  SIGN,
  ACCEPT_ON_BEHALF_OF_PARTNER,
  SEND_BACK_REVIEW
];
export const ACTIONS_WITHOUT_CONFIRM = [PRC_REVIEW, REJECT_REVIEW, SIGN];

export const ActionNamesMap: AnyObject = {
  [EXPORT_COMMENTS]: {text: translate('EXPORT_COMMENTS'), textKey: 'EXPORT_COMMENTS'},
  [EXPORT_PDF]: {text: translate('EXPORT_PDF'), textKey: 'EXPORT_PDF'},
  [EXPORT_XLS]: {text: translate('EXPORT_XLS'), textKey: 'EXPORT_XLS'},
  [EXPORT_RESULTS]: {text: translate('EXPORT_RESULTS'), textKey: 'EXPORT_RESULTS'},
  [EXPORT_COMMENTS_GDD]: {text: translate('EXPORT_COMMENTS_GDD'), textKey: 'EXPORT_COMMENTS_GDD'},
  [EXPORT_PDF_GDD]: {text: translate('EXPORT_PDF_GDD'), textKey: 'EXPORT_PDF_GDD'},
  [EXPORT_XLS_GDD]: {text: translate('EXPORT_XLS_GDD'), textKey: 'EXPORT_XLS_GDD'},
  [EXPORT_RESULTS_GDD]: {text: translate('EXPORT_RESULTS_GDD'), textKey: 'EXPORT_RESULTS_GDD'},
  [SEND_TO_PARTNER]: {text: translate('SEND_TO_PARTNER'), textKey: 'SEND_TO_PARTNER'},
  [SEND_TO_UNICEF]: {text: translate('SEND_TO_UNICEF'), textKey: 'SEND_TO_UNICEF'},
  [UNLOCK]: {text: translate('UNLOCK'), textKey: 'UNLOCK'},
  [ACCEPT]: {text: translate('ACCEPT_AS_FINAL'), textKey: 'ACCEPT_AS_FINAL'},
  [REVIEW]: {text: translate('SEND_FOR_REVIEW'), textKey: 'SEND_FOR_REVIEW'},
  [AMENDMENT_MERGE]: {text: translate('AMENDMENT_MERGE'), textKey: 'AMENDMENT_MERGE'},
  [CANCEL]: {text: translate('GENERAL.CANCEL'), textKey: 'GENERAL.CANCEL'},
  [SIGN]: {text: translate('SIGN'), textKey: 'SIGN'},
  [SIGN_BUDGET_OWNER]: {text: translate('SIGN_BUDGET_OWNER'), textKey: 'SIGN_BUDGET_OWNER'},
  [TERMINATE]: {text: translate('TERMINATE'), textKey: 'TERMINATE'},
  [REJECT_REVIEW]: {text: translate('REJECT_REVIEW'), textKey: 'REJECT_REVIEW'},
  [SUSPEND]: {text: translate('SUSPEND'), textKey: 'SUSPEND'},
  [UNSUSPEND]: {text: translate('UNSUSPEND'), textKey: 'UNSUSPEND'},
  [ACCEPT_ON_BEHALF_OF_PARTNER]: {
    text: translate('ACCEPT_ON_BEHALF_OF_PARTNER'),
    textKey: 'ACCEPT_ON_BEHALF_OF_PARTNER'
  },
  [SEND_BACK_REVIEW]: {text: translate('SEND_BACK_REVIEW'), textKey: 'SEND_BACK_REVIEW'},
  [PRC_REVIEW]: {text: translate('INDIVIDUAL_REVIEW'), textKey: 'INDIVIDUAL_REVIEW'}
};
