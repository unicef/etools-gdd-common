import {
  INTERVENTION_LOADING,
  SHOULD_REGET_LIST,
  UPDATE_CURRENT_INTERVENTION,
  UPDATE_E_WORK_PLAN,
  UPDATE_PARTNER_REPORTING_REQUIREMENTS
} from '../actionsConstants';
import {GDD} from '@unicef-polymer/etools-types';
import {PartnerReportingRequirements, EWorkPlan} from '../types/store.types';
import {RESET_CURRENT_ITEM} from '../actions/actionsContants';

export interface GDDInterventionsState {
  current: GDD | null;
  interventionLoading: number | null;
  partnerReportingRequirements: PartnerReportingRequirements;
  eWorkPlans: EWorkPlan[];
  shouldReGetList: boolean;
}

const INITIAL_STATE: GDDInterventionsState = {
  current: null,
  interventionLoading: null,
  partnerReportingRequirements: {special: [], qpr: [], hr: [], sr: []},
  shouldReGetList: false,
  eWorkPlans: []
};

export const gddInterventions = (state = INITIAL_STATE, action: any) => {
  let eWorkPlansCopy;
  switch (action.type) {
    case UPDATE_CURRENT_INTERVENTION:
      return {
        ...state,
        current: action.current
      };
    case RESET_CURRENT_ITEM:
      return {
        ...state,
        current: null
      };
    case UPDATE_PARTNER_REPORTING_REQUIREMENTS:
      return {
        ...state,
        partnerReportingRequirements: action.partnerReportingRequirements
      };
    case INTERVENTION_LOADING:
      return {
        ...state,
        interventionLoading: action.loadingState
      };
    case UPDATE_E_WORK_PLAN:
      eWorkPlansCopy = state.eWorkPlans.slice(0);
      eWorkPlansCopy[action.countryProgrameId] = action.eWorkPlans;
      return {
        ...state,
        eWorkPlans: eWorkPlansCopy
      };
    case SHOULD_REGET_LIST:
      return {
        ...state,
        shouldReGetList: action.shouldReGetList
      };
    default:
      return state;
  }
};
