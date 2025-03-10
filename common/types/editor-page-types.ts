import {GDDActivityItem, GDDManagementBudgetItem} from '@unicef-polymer/etools-types/dist/gdd.types';

export interface GDDGDDExpectedResultExtended {
  id: number;
  code: string;
  created: string;
  cp_output: number;
  cp_output_name: string;
  intervention: number;
  gdd_key_interventions: GDDResultLinkLowerResultExtended[];
  ram_indicators: number[];
  ram_indicator_names: string[];
  total: string;
}

export declare type GDDActivity = {
  id: number;
  code: string;
  context_details: string;
  cso_cash: string;
  cso_supplies: string;
  items: GDDActivityItemExtended[];
  name: string;
  time_frames: number[];
  unicef_cash: string;
  unicef_suppies: number;
  is_active: boolean;
  created: string;
};

export interface GDDResultLinkLowerResult {
  id: number;
  name: string;
  activities: GDDActivityExtended[];
  code?: string;
  created?: string;
  result_link?: number;
  cp_output: number | null;
  total: string;
}

export type GDDActivityItemExtended = GDDActivityItem & {
  id: number;
  code: string;
  inEditMode: boolean;
  invalid: Partial<GDDInvalidItem>;
  autovalidate: Partial<GDDAutovalidateItem>;
};

type GDDAutovalidateItem = {
  name: boolean;
  unit: boolean;
  [prop: string]: boolean;
};
type GDDInvalidItem = {
  name: boolean;
  unit: boolean;
  no_units: boolean;
  unit_price: boolean;
  cso_cash: boolean;
  unicef_cash: boolean;
};

export type GDDActivityExtended = GDDActivity & {
  inEditMode: boolean;
  itemsInEditMode: boolean;
  invalid: Partial<GDDItemInvalid>;
  total: string;
};

type GDDItemInvalid = {name: boolean; context_details: boolean; time_frames: boolean};

export type GDDResultLinkLowerResultExtended = GDDResultLinkLowerResult & {
  inEditMode: boolean;
  invalid: boolean;
  invalidCpOutput: boolean;
};

export enum GDDProgrammeManagementKindChoices {
  inCountry = 'in_country',
  operational = 'operational',
  planning = 'planning'
}

export type GDDProgrammeManagementRowItemExtended = GDDManagementBudgetItem & {
  id?: number;
  code: string;
  inEditMode: boolean;
  invalid: Partial<GDDInvalidItem>;
  autovalidate: Partial<GDDAutovalidateItem>;
};

export type GDDProgrammeManagementRow = {
  code: string;
  name: string;
  context_details: string;
  cso_cash: string;
  unicef_cash: string;
  totalProgrammeManagementCash: number;
  total: string;
  items: GDDProgrammeManagementRowItemExtended[];
  id: number;
  kind: GDDProgrammeManagementKindChoices;
  inEditMode: boolean;
  itemsInEditMode: boolean;
};

export type GDDProgrammeManagementRowExtended = GDDProgrammeManagementRow & {
  inEditMode: boolean;
  itemsInEditMode: boolean;
  invalid?: Partial<{unicef_cash: boolean; cso_cash: boolean}>;
  total: string;
};
