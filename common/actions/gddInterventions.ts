import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {gddEndpoints} from '../../utils/intervention-endpoints';
import {
  INTERVENTION_LOADING,
  SHOULD_REGET_LIST,
  SHOW_TOAST,
  UPDATE_CURRENT_INTERVENTION,
  UPDATE_E_WORK_PLAN
} from '../actionsConstants';
import {AnyObject, GDDPlannedBudget, GDD} from '@unicef-polymer/etools-types';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {EWorkPlan, PartnerReportingRequirements} from '../types/store.types';
import pick from 'lodash-es/pick';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {_sendRequest} from '@unicef-polymer/etools-modules-common/dist/utils/request-helper';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

export const updateCurrentIntervention = (intervention: AnyObject | null) => {
  if (intervention && !intervention.planned_budget) {
    intervention.planned_budget = new GDDPlannedBudget();
  }
  return {
    type: UPDATE_CURRENT_INTERVENTION,
    current: intervention
  };
};

export const setInterventionLoading = (loadingState: number | null) => {
  return {
    type: INTERVENTION_LOADING,
    loadingState: loadingState
  };
};

export const setShouldReGetList = (reGet: boolean) => {
  return {
    type: SHOULD_REGET_LIST,
    shouldReGetList: reGet
  };
};

export const setEworkPlan = (countryProgrameId: number, eWorkPlans: EWorkPlan[]) => {
  return {
    type: UPDATE_E_WORK_PLAN,
    countryProgrameId: countryProgrameId,
    eWorkPlans: eWorkPlans
  };
};

export const getIntervention = (interventionId?: string) => (dispatch: any, getState: any) => {
  if (!interventionId) {
    interventionId = getState().app.routeDetails.params.interventionId;
  }

  fireEvent(document.body.querySelector('app-shell')!, 'global-loading', {
    active: true,
    loadingSource: 'gdd-interv-get'
  });

  return sendRequest({
    endpoint: getEndpoint(gddEndpoints.intervention, {interventionId: interventionId})
  })
    .then((intervention: GDD) => {
      dispatch(updateCurrentIntervention(intervention));
    })
    .catch((err: any) => {
      if (err.status === 404) {
        throw new Error('404');
      }
    })
    .finally(() => {
      dispatch(setInterventionLoading(null));
      fireEvent(document.body.querySelector('app-shell')!, 'global-loading', {
        active: false,
        loadingSource: 'gdd-interv-get'
      });
    });
};

export const getEWorkPlan = (countryProgrameId: number) => (dispatch: any) => {
  return sendRequest({
    endpoint: getEndpoint(gddEndpoints.eWorkPlans, {countryProgrameId: countryProgrameId})
  })
    .then((eWorkplans: any[]) => {
      dispatch(setEworkPlan(countryProgrameId, eWorkplans));
    })
    .catch((err: any) => {
      console.log(err);
      throw err;
    });
};

export const showToast = (message: string, showCloseBtn = true) => {
  return {
    type: SHOW_TOAST,
    message,
    showCloseBtn
  };
};

export const setPrpCountries = (PRPCountryData: AnyObject[]) => {
  return {
    type: 'UPDATE_PRP_COUNTRIES',
    PRPCountryData
  };
};

export const patchIntervention =
  (interventionChunck: any, interventionId?: string) => (dispatch: any, getState: any) => {
    if (!interventionId) {
      interventionId = getState().app.routeDetails.params.interventionId;
    }
    const prevInterventionState = getState().gddInterventions?.current;
    return _sendRequest({
      endpoint: getEndpoint(gddEndpoints.intervention, {interventionId: interventionId}),
      body: interventionChunck,
      method: 'PATCH'
    }).then((intervention: GDD) => {
      dispatch(updateCurrentIntervention(intervention));

      if (shouldReGetList(prevInterventionState, intervention)) {
        dispatch(setShouldReGetList(true));
      }
    });
  };

function shouldReGetList(prevInterventionState: GDD, currentInterventionState: GDD) {
  const fieldsDisplayedOnList = [
    'number',
    'partner_name',
    'document_type',
    'status',
    'offices',
    'title',
    'start',
    'end',
    'sections',
    'planned_budget',
    'partner_accepted',
    'unicef_accepted',
    'unicef_court',
    'date_sent_to_partner',
    'result_links',
    'planned_budget',
    'frs',
    'frs_details'
  ];
  const prevI = pick(prevInterventionState, fieldsDisplayedOnList);
  const currentI = pick(currentInterventionState, fieldsDisplayedOnList);
  return !isJsonStrMatch(prevI, currentI);
}

export const updatePartnerReportingRequirements = (newReportingRequirements: PartnerReportingRequirements) => {
  return {
    type: 'UPDATE_PARTNER_REPORTING_REQUIREMENTS',
    partnerReportingRequirements: newReportingRequirements
  };
};
