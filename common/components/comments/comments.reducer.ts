import {Reducer} from 'redux';
import {SET_ENDPOINT, ADD_COMMENT, ENABLE_COMMENT_MODE, SET_COMMENTS, UPDATE_COMMENT} from './comments.actions';
import {InterventionComment, GenericObject} from '@unicef-polymer/etools-types';
import {GDDCommentsEndpoints} from './comments-types';

export type GDDCommentsCollection = GenericObject<InterventionComment[]>;
export type GDDCommentsState = {
  commentsModeEnabled: boolean;
  collection: GenericObject<GDDCommentsCollection>;
  endpoints: GDDCommentsEndpoints;
};
const INITIAL: GDDCommentsState = {
  commentsModeEnabled: false,
  collection: {},
  endpoints: {} as GDDCommentsEndpoints
};

export const gddCommentsData: Reducer<GDDCommentsState, any> = (state = INITIAL, action) => {
  switch (action.type) {
    case SET_ENDPOINT:
      return {
        ...state,
        endpoints: action.endpoints
      };
    case SET_COMMENTS:
      return {
        ...state,
        commentsModeEnabled: state.commentsModeEnabled,
        collection: setCommentsToCollection(state.collection, action.interventionId, action.data)
      };
    case ADD_COMMENT:
      return {
        ...state,
        commentsModeEnabled: state.commentsModeEnabled,
        collection: addCommentToCollection(state.collection, action.interventionId, action.relatedTo, action.data)
      };
    case UPDATE_COMMENT:
      return {
        ...state,
        commentsModeEnabled: state.commentsModeEnabled,
        collection: updateComment(state.collection, action.interventionId, action.relatedTo, action.data)
      };
    case ENABLE_COMMENT_MODE:
      return {
        ...state,
        commentsModeEnabled: action.state
      };
    default:
      return state;
  }
};

function setCommentsToCollection(
  collection: GenericObject<GDDCommentsCollection>,
  id: number,
  comments: GenericObject<InterventionComment[]>
): GenericObject<GDDCommentsCollection> {
  collection[id] = comments;
  return collection;
}

function addCommentToCollection(
  collection: GenericObject<GDDCommentsCollection>,
  id: number,
  relatedTo: string,
  comment: InterventionComment
): GenericObject<GDDCommentsCollection> {
  if (!collection[id]) {
    collection[id] = {};
  }
  const currentComments = collection[id][relatedTo] || [];
  collection[id][relatedTo] = [...currentComments, comment];
  return collection;
}

function updateComment(
  collection: GenericObject<GDDCommentsCollection>,
  id: number,
  relatedTo: string,
  comment: InterventionComment
): GenericObject<GDDCommentsCollection> {
  const currentComments = collection[id][relatedTo] || [];
  const index: number = currentComments.findIndex(({id}: InterventionComment) => id === comment.id);
  if (index === -1) {
    console.warn("Comment which you want to update doesn't exists");
    return collection;
  }
  const updatedComments: InterventionComment[] = [...currentComments];
  updatedComments.splice(index, 1, comment);
  collection[id][relatedTo] = updatedComments;
  return collection;
}
