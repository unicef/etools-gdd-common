import {EtoolsEndpoint} from '@unicef-polymer/etools-types';

export interface EtoolsEndpoints {
  intervention: EtoolsEndpoint;
  interventionAction: EtoolsEndpoint;
  partnerStaffMembers: EtoolsEndpoint;
  partnerAgreements: EtoolsEndpoint;
  specialReportingRequirements: EtoolsEndpoint;
  reportingRequirements: EtoolsEndpoint;
  specialReportingRequirementsUpdate: EtoolsEndpoint;
  monitoringVisits: EtoolsEndpoint;
  fmActivities: EtoolsEndpoint;
  partnerTPMActivities: EtoolsEndpoint;
  interventionTPMActivities: EtoolsEndpoint;
  resultLinksDetails: EtoolsEndpoint;
  resultLinks: EtoolsEndpoint;
  ramIndicators: EtoolsEndpoint;
  resultLinkGetDelete: EtoolsEndpoint;
  keyInterventionDetails: EtoolsEndpoint;
  createKeyIntervention: EtoolsEndpoint;
  gddActivityDetails: EtoolsEndpoint;
  gddActivities: EtoolsEndpoint;
  interventionBudgetUpdate: EtoolsEndpoint;
  supplyAgreementAdd: EtoolsEndpoint;
  supplyAgreementEdit: EtoolsEndpoint;
  attachmentsUpload: EtoolsEndpoint;
  supplyItemsUpload: EtoolsEndpoint;
  interventionAmendmentAdd: EtoolsEndpoint;
  interventionAmendmentDelete: EtoolsEndpoint;
  frNumbersDetails: EtoolsEndpoint;
  comments: EtoolsEndpoint;
  resolveComment: EtoolsEndpoint;
  deleteComment: EtoolsEndpoint;
  createIndicator: EtoolsEndpoint;
  getEditDeleteIndicator: EtoolsEndpoint;
  cpOutputRamIndicators: EtoolsEndpoint;
  interventionProgress: EtoolsEndpoint;
  prpToken: EtoolsEndpoint;
  reports: EtoolsEndpoint;
  GDDExpectedResultsExport: EtoolsEndpoint;
  riskDelete: EtoolsEndpoint;
  pdAttachments: EtoolsEndpoint;
  updatePdAttachment: EtoolsEndpoint;
  lowerResultsDelete: EtoolsEndpoint;
  getPrpClusterIndicators: EtoolsEndpoint;
  getPrpClusterIndicator: EtoolsEndpoint;
  getResponsePlans: EtoolsEndpoint;
  hrClusterReportingRequirements: EtoolsEndpoint;
  getPRPCountries: EtoolsEndpoint;
  downloadComment: EtoolsEndpoint;
  exportPdf: EtoolsEndpoint;
  exportXls: EtoolsEndpoint;
  interventionReview: EtoolsEndpoint;
  sendReviewNotification: EtoolsEndpoint;
  sendAuthorizedOfficerReviewNotification: EtoolsEndpoint;
  officersReviews: EtoolsEndpoint;
  officerReviewData: EtoolsEndpoint;
  interventionPVDelete: EtoolsEndpoint;
  exportReviewPdf: EtoolsEndpoint;
  eWorkPlans: EtoolsEndpoint;
  ewpOutputs: EtoolsEndpoint;
  ewpKeyInterventions: EtoolsEndpoint;
  ewpActivities: EtoolsEndpoint;
  getSyncResultsStructure: EtoolsEndpoint;
  syncResultsStructure: EtoolsEndpoint;
}

export const gddEndpoints: EtoolsEndpoints = {
  eWorkPlans: {
    template: '/api/gdd/dropdown-options/e-workplans/?country_programme_id=<%=countryProgrameId%>'
  },
  ewpOutputs: {
    template: '/api/gdd/dropdown-options/ewp-outputs/?gdd_id=<%=gddId%>'
  },
  ewpKeyInterventions: {
    template: '/api/gdd/dropdown-options/ewp-key-interventions/?ewp_output_id=<%=ewpOutputId%>'
  },
  ewpActivities: {
    template: '/api/gdd/dropdown-options/ewp-activities/?ewp_key_intervention_id=<%=keyInterventionId%>'
  },
  intervention: {
    template: '/api/gdd/gdds/<%=interventionId%>/'
  },
  getSyncResultsStructure: {
    template: '/api/gdd/gdds/<%=interventionId%>/sync-results-structure/'
  },
  syncResultsStructure: {
    template: '/api/gdd/gdds/<%=interventionId%>/sync-results-structure/'
  },
  interventionAction: {
    template: '/api/gdd/gdds/<%=interventionId%>/<%=action%>/'
  },
  partnerStaffMembers: {
    template: '/api/pmp/v3/partners/<%=id%>/staff-members/'
  },
  partnerAgreements: {
    template: '/api/pmp/v3/agreements/?partner_id=<%=id%>'
  },
  specialReportingRequirements: {
    template: '/api/gdd/gdds/<%=intervId%>/special-reporting-requirements/'
  },
  reportingRequirements: {
    template: '/api/gdd/gdds/<%=intervId%>/reporting-requirements/<%=reportType%>/'
  },
  specialReportingRequirementsUpdate: {
    template: '/api/gdd/gdds/<%=intervId%>/special-reporting-requirements/<%=reportId%>/'
  },
  monitoringVisits: {
    template: '/api/t2f/travels/activities/partnership/<%=id%>/?year=<%=year%>'
  },
  fmActivities: {
    url: '/api/v1/field-monitoring/planning/activities/?page_size=all'
  },
  partnerTPMActivities: {
    template:
      '/api/tpm/activities/?tpm_visit__status=unicef_approved&is_pv=true&date__year=<%=year%>&partner=<%=partnerId%>'
  },
  interventionTPMActivities: {
    template:
      '/api/tpm/activities/?tpm_visit__status=unicef_approved&date__year=<%=year%>&intervention=<%=interventionId%>'
  },
  resultLinksDetails: {
    template: '/api/gdd/gdds/<%=id%>/results-structure/'
  },
  resultLinks: {
    template: '/api/gdd/gdds/<%=id%>/result-links/'
  },
  resultLinkGetDelete: {
    template: '/api/gdd/gdds/<%=interventionId%>/result-links/<%=result_link%>/'
  },
  ramIndicators: {
    template: '/api/v2/reports/results/<%=id%>/indicators/'
  },
  keyInterventionDetails: {
    template: '/api/gdd/gdds/<%=intervention_id%>/key-interventions/<%=pd_id%>/'
  },
  createKeyIntervention: {
    template: '/api/gdd/gdds/<%=intervention_id%>/key-interventions/'
  },
  gddActivities: {
    template: '/api/gdd/gdds/<%=interventionId%>/key-interventions/<%=keyInterventionId%>/activities/'
  },
  gddActivityDetails: {
    template: '/api/gdd/gdds/<%=interventionId%>/key-interventions/<%=keyInterventionId%>/activities/<%=activityId%>/'
  },
  interventionBudgetUpdate: {
    template: '/api/gdd/gdds/<%=interventionId%>/budget/'
  },
  supplyAgreementAdd: {
    template: '/api/gdd/gdds/<%=interventionId%>/supply/'
  },
  supplyAgreementEdit: {
    template: '/api/gdd/gdds/<%=interventionId%>/supply/<%=supplyId%>/'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  },
  supplyItemsUpload: {
    template: '/api/gdd/gdds/<%=interventionId%>/supply/upload/'
  },
  interventionAmendmentAdd: {
    template: '/api/gdd/gdds/<%=intervId%>/amendments/'
  },
  interventionAmendmentDelete: {
    template: '/api/gdd/gdds/amendments/<%=amendmentId%>/'
  },
  frNumbersDetails: {
    url: '/api/gdd/frs'
  },
  comments: {
    template: '/api/comments/v1/governments/gdd/<%=interventionId%>/'
  },
  resolveComment: {
    template: '/api/comments/v1/governments/gdd/<%=interventionId%>/<%=commentId%>/resolve/'
  },
  deleteComment: {
    template: '/api/comments/v1/governments/gdd/<%=interventionId%>/<%=commentId%>/delete/'
  },
  downloadComment: {
    template: '/api/comments/v1/governments/gdd/<%=interventionId%>/csv/'
  },
  lowerResultsDelete: {
    template: '/api/gdd/gdds/<%=intervention_id%>/key-interventions/<%=lower_result_id%>/'
  },
  createIndicator: {
    template: '/api/gdd/gdds/lower-results/<%=id%>/indicators/'
  },
  getEditDeleteIndicator: {
    template: '/api/gdd/gdds/applied-indicators/<%=id%>/'
  },
  cpOutputRamIndicators: {
    template: '/api/v2/interventions/<%=intervention_id%>/output_cp_indicators/<%=cp_output_id%>/'
  },
  interventionProgress: {
    template: '/api/unicef/<%=countryId%>/programme-document/<%=pdId%>/progress/?external=1',
    token: 'prp'
  },
  prpToken: {
    url: '/api/jwt/get'
  },
  reports: {
    template: '/api/unicef/<%=countryId%>/progress-reports/',
    token: 'prp'
  },
  GDDExpectedResultsExport: {
    template: '/api/reports/v3/interventions/results/<%=intervention_id%>/?format=docx_table'
  },
  riskDelete: {
    template: '/api/gdd/gdds/<%=interventionId%>/risks/<%=riskId%>'
  },
  pdAttachments: {
    template: '/api/gdd/gdds/<%=id%>/attachments/'
  },
  interventionReview: {
    template: '/api/gdd/gdds/<%=interventionId%>/reviews/<%=id%>/'
  },
  sendReviewNotification: {
    template: '/api/gdd/gdds/<%=interventionId%>/reviews/<%=id%>/notify/'
  },
  sendAuthorizedOfficerReviewNotification: {
    template: '/api/gdd/gdds/<%=interventionId%>/reviews/<%=id%>/notify-authorized-officer/'
  },
  officersReviews: {
    template: '/api/gdd/gdds/<%=interventionId%>/reviews/<%=id%>/officers-reviews/'
  },
  officerReviewData: {
    template: '/api/gdd/gdds/<%=interventionId%>/reviews/<%=id%>/officers-reviews/<%=userId%>/'
  },
  updatePdAttachment: {
    template: '/api/gdd/gdds/<%=id%>/attachments/<%=attachment_id%>/'
  },
  getPrpClusterIndicators: {
    // by cluster id
    template: '/api/indicator/ca/?clusters=<%=id%>',
    token: 'prp'
  },
  getPrpClusterIndicator: {
    // by id
    template: '/api/indicator/<%=id%>/',
    token: 'prp'
  },
  getResponsePlans: {
    template: '/api/core/workspace/<%=countryId%>/response-plan/',
    token: 'prp'
  },
  hrClusterReportingRequirements: {
    template: '/api/indicator/reporting-frequencies/',
    token: 'prp'
  },
  getPRPCountries: {
    template: '/api/core/workspace/',
    exp: 60 * 60 * 60 * 1000,
    token: 'prp',
    cachingKey: 'prpCountries'
  },
  exportPdf: {
    template: '/api/gdd/gdds/<%=interventionId%>/pdf'
  },
  exportXls: {
    template: '/api/gdd/gdds/<%=interventionId%>/xls'
  },
  interventionPVDelete: {
    template: '/api/v2/interventions/<%=intervention_id%>/planned-visits/<%=id%>/'
  },
  exportReviewPdf: {
    template: '/api/gdd/gdds/<%=interventionId%>/reviews/<%=reviewId%>/pdf'
  }
};
