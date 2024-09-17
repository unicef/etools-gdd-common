import {EtoolsEndpoint} from '@unicef-polymer/etools-types';

export interface GDDCommentsEndpoints {
  saveComments: EtoolsEndpoint;
  resolveComment: EtoolsEndpoint;
  deleteComment: EtoolsEndpoint;
}

// Related item details if any.
export interface GDDCommentRelatedItem {
  type: string;
  id: string;
  name: string;
  code?: string;
}

export interface GDDCommentItemData {
  relatedItem?: GDDCommentRelatedItem;
  relatedTo: string;
  // translate key that describes type of element - Budget Summary/Attachments/PD Output after translate
  relatedToTranslateKey: string;
  // comments count
  count: number;
  // description provided by [comment-element] or [comment-container]
  // (Now like name for activity/indicator/pd or prp tab type)
  relatedToDescription: string;
  // translate key for regular tabs that hasn't provided description (relatedToDescription)
  // would be taken from CommentsDescription mapping
  fieldDescription: string | null;
  lastCreatedMessageDate: string | null;
}
