import {GDDCommentsCollection} from '../components/comments/comments.reducer';
import {
  AnyObject,
  Disaggregation,
  EnvFlags,
  LabelAndValue,
  LocationObject,
  Site,
  MinimalAgreement,
  RouteDetails,
  GDD,
  CpOutput,
  Section,
  GenericObject,
  EtoolsUser,
  CountryProgram
} from '@unicef-polymer/etools-types';
import {GDDCommentsEndpoints} from '../components/comments/comments-types';
import {UploadStatusState} from '../reducers/upload-status';

export interface AppState {
  routeDetails: RouteDetails;
  toastNotification: {
    active: boolean;
    message: string;
    showCloseBtn: boolean;
  };
}

export interface GDDInterventionsState {
  current: GDD | null;
  interventionLoading: number | null;
  partnerReportingRequirements: PartnerReportingRequirements;
  shouldReGetList: boolean;
}

export interface AgreementsState {
  list: MinimalAgreement[] | null;
}

export interface UserState {
  data: EtoolsUser | null;
  permissions: AnyObject | null;
}

export interface CommonDataState {
  unicefUsersData: [];
  partners: [];
  locations: LocationObject[];
  sites: Site[];
  sections: Section[];
  disaggregations: Disaggregation[];
  cpOutputs: CpOutput[];
  locationTypes: [];
  documentTypes: [];
  genderEquityRatings: [];
  interventionAmendmentTypes: LabelAndValue[];
  interventionStatuses: LabelAndValue[];
  offices: [];
  currencies: LabelAndValue[];
  envFlags: EnvFlags | null;
  riskTypes: LabelAndValue[];
  fileTypes: any[];
  cashTransferModalities: any[];
  PRPCountryData: any[];
  countryProgrammes: CountryProgram[];
  loadedTimestamp: number;
  providedBy: LabelAndValue[];
}

export interface RootState {
  app: AppState;
  gddInterventions: GDDInterventionsState;
  prcIndividualReviews: any[];
  agreements: AgreementsState;
  user: UserState;
  commonData: CommonDataState;
  gddCommentsData: {
    commentsModeEnabled: boolean;
    collection: GenericObject<GDDCommentsCollection>;
    endpoints: GDDCommentsEndpoints;
  };
  uploadStatus: UploadStatusState;
  activeLanguage: any;
}

export interface PartnerReportingRequirements {
  qpr: any;
  hr: any;
  sr: any;
  special: any;
}
