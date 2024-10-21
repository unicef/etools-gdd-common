import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {GDDPrcOfficerReview} from '@unicef-polymer/etools-types';

export const SET_REVIEWS = 'SET_REVIEWS';
export const RESET_REVIEWS = 'SET_REVIEWS';

export const loadPrcMembersIndividualReviews = (reviewId: number) => (dispatch: any, getState: any) => {
  const interventionId = getState().app.routeDetails.params.interventionId;
  return sendRequest({
    endpoint: getEndpoint(gddEndpoints.officersReviews, {interventionId: interventionId, id: reviewId})
  })
    .then((reviews: any) => {
      dispatch({
        type: SET_REVIEWS,
        reviews: checkReviews(reviews)
      });
    })
    .catch((err: any) => {
      if (err.status === 404) {
        throw new Error('404');
      }
    });
};

function checkReviews(reviews: GDDPrcOfficerReview[]) {
  return reviews.filter((review: GDDPrcOfficerReview) => Boolean(review.review_date));
}
