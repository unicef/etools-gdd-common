import {GenericObject} from '@unicef-polymer/etools-types';

export const PRC_REVIEW = 'prc';
export const NON_PRC_REVIEW = 'non-prc';
export const NO_REVIEW = 'no-review';

export enum ReviewQuestionFields {
  pdIsRelevant = 'pd_is_relevant',
  budgetIsAligned = 'budget_is_aligned',
  supplyIssuesConsidered = 'supply_issues_considered'
}

export const REVIEW_QUESTIONS: Readonly<GenericObject<string>> = {
  [ReviewQuestionFields.pdIsRelevant]:
    // eslint-disable-next-line max-len
    'The proposed gPD is relevant to achieving results in the country programme document, the relevant sector workplan and/or humanitarian response plan',
  [ReviewQuestionFields.budgetIsAligned]:
    // eslint-disable-next-line max-len
    'The budget of the proposed gPD is aligned with the principles of value for money with the effective and efficient programme management costs adhering to office defined limits',
  [ReviewQuestionFields.supplyIssuesConsidered]: 'The relevant supply issues have been duly considered in the gPD'
};

export const REVIEW_ANSVERS: ReadonlyMap<string, string> = new Map([
  ['a', 'Yes, strongly agree'],
  ['b', 'Yes, agree'],
  ['c', 'No, disagree'],
  ['d', 'No, strongly disagree']
]);
