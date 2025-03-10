import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {GDDComment, GenericObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';
import {GDDCommentsEndpoints} from './comments-types';
export const SET_ENDPOINT = 'SET_ENDPOINT';
export const SET_COMMENTS = 'SET_COMMENTS';
export const ADD_COMMENT = 'ADD_COMMENT';
export const UPDATE_COMMENT = 'UPDATE_COMMENT';
export const ENABLE_COMMENT_MODE = 'ENABLE_COMMENT_MODE';

export const enableCommentMode = (state: boolean) => {
  return {
    type: ENABLE_COMMENT_MODE,
    state
  };
};

export const setCommentsEndpoint = (endpoints: GDDCommentsEndpoints) => {
  return {
    type: SET_ENDPOINT,
    endpoints: endpoints
  };
};

export const addComment = (relatedTo: string, comment: GDDComment, interventionId: number) => {
  return {
    type: ADD_COMMENT,
    data: comment,
    relatedTo,
    interventionId
  };
};

export const updateComment = (relatedTo: string, comment: GDDComment, interventionId: number) => {
  return {
    type: UPDATE_COMMENT,
    data: comment,
    relatedTo,
    interventionId
  };
};

export const setComments = (comments: GenericObject<GDDComment[]>, interventionId: number) => {
  return {
    type: SET_COMMENTS,
    data: comments,
    interventionId
  };
};

export const getComments = (endpoint: EtoolsEndpoint, interventionId: number) => (dispatch: any) => {
  return _sendRequest({
    endpoint: getEndpoint(endpoint, {interventionId: interventionId})
  }).then((comments: GDDComment[]) => {
    dispatch(setComments(mapComments(comments), interventionId));
  });
};

function mapComments(comments: GDDComment[]): GenericObject<GDDComment[]> {
  return comments.reduce((commentsMap: GenericObject<GDDComment[]>, comment: GDDComment) => {
    if (!commentsMap[comment.related_to]) {
      commentsMap[comment.related_to] = [];
    }
    commentsMap[comment.related_to].push(comment);
    return commentsMap;
  }, {});
}
