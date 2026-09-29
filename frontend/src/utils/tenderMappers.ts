import {
  Tender,
  TenderStage,
  DecisionStatus,
  TenderTask,
  TenderRequirement,
  TenderDocument,
  TenderReviewTier,
  TenderDecisionMatrix,
} from '../types/tender';

/**
 * Maps raw backend database tender JSON objects into strongly-typed frontend Tender entities.
 */
export function mapDbTenderToTender(dbt: any, existing?: Tender): Tender {
  const dbTasks: TenderTask[] =
    Array.isArray(dbt.tasks) && dbt.tasks.length > 0
      ? dbt.tasks.map((tk: any) => ({
          id: tk.id,
          title: tk.title,
          assignee: tk.assignee,
          priority: tk.priority || 'MEDIUM',
          deadline: tk.due_date || 'Day 5',
          status: tk.status || 'TODO',
        }))
      : existing
      ? existing.tasks
      : [];

  const dbReqs: TenderRequirement[] =
    Array.isArray(dbt.requirements) && dbt.requirements.length > 0
      ? dbt.requirements.map((rq: any) => ({
          id: rq.id,
          title: rq.title,
          category: rq.category || 'Statutory',
          status: rq.status || 'PENDING',
          evidenceFile: rq.evidence_file || rq.evidenceFile || undefined,
          owner: rq.owner || 'Tariq Al-Mansoor',
        }))
      : existing
      ? existing.requirements
      : [];

  const dbDocs: TenderDocument[] =
    Array.isArray(dbt.documents) && dbt.documents.length > 0
      ? dbt.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          folder: doc.folder,
          companyName: doc.company_name || 'PrimeTech Ltd',
          companyRole: doc.company_role || 'LEAD_BIDDER',
          isJvPartner: Boolean(doc.is_jv_partner),
          size: doc.size,
          revision: doc.revision || 'v1.0',
          sha256: doc.sha256,
          uploadedAt: doc.uploaded_at,
          accessLevel: doc.access_level || 'ALL_TEAM',
          isReusableLink: doc.is_reusable_link,
          reusableSourceId: doc.reusable_source_id,
          status: doc.status || 'CLEARED',
          actionComment: doc.action_comment || undefined,
          requestedBy: doc.requested_by || undefined,
          actionDueDate: doc.action_due_date || undefined,
        }))
      : existing
      ? existing.documents
      : [];

  const dbReviews: TenderReviewTier[] =
    Array.isArray(dbt.reviews) && dbt.reviews.length > 0
      ? dbt.reviews.map((rv: any) => ({
          tierNumber: rv.tier_number,
          name: rv.tier_name,
          reviewer:
            rv.signed_off_by ||
            (rv.role_required === 'EXECUTIVE_MANAGER'
              ? 'Executive Manager'
              : rv.role_required === 'SENIOR_MANAGER'
              ? 'Senior Manager'
              : rv.role_required === 'TENDER_ANALYST'
              ? 'Tender Analyst'
              : 'Reviewer'),
          status: rv.sign_off_status as any,
          date: rv.signed_off_at,
          comments: rv.comments || '',
        }))
      : existing
      ? existing.reviews
      : [];

  const dbMatrix: TenderDecisionMatrix | undefined = dbt.decision_matrix
    ? ({
        technical: dbt.decision_matrix.technical_score,
        financial: dbt.decision_matrix.financial_score,
        team: dbt.decision_matrix.team_score,
        sla: dbt.decision_matrix.sla_score,
        aggregateScore: dbt.decision_matrix.composite_score,
        threshold: dbt.decision_matrix.threshold || 70,
        rationale: dbt.decision_matrix.rationale || '',
      } as any)
    : existing
    ? existing.decisionMatrix
    : undefined;

  let dbSummary = existing ? existing.summary : undefined;
  if (dbt.summary_json) {
    try {
      dbSummary =
        typeof dbt.summary_json === 'string'
          ? JSON.parse(dbt.summary_json)
          : dbt.summary_json;
    } catch {}
  }

  const completedTasks = dbTasks.filter((tk) => tk.status === 'DONE').length;
  const missingDocs = dbReqs.filter((rq) => rq.status !== 'VERIFIED').length;
  const blockers = dbReqs
    .filter((rq) => rq.status === 'BLOCKER')
    .map((rq) => rq.title);

  return {
    id: dbt.id,
    referenceNo: dbt.reference_no || (existing ? existing.referenceNo : ''),
    title: dbt.title || (existing ? existing.title : 'Untitled Opportunity'),
    organization:
      dbt.organization || (existing ? existing.organization : 'Procuring Authority'),
    country: dbt.country || (existing ? existing.country : 'Bangladesh'),
    category: dbt.category || (existing ? existing.category : 'General'),
    estimatedValue:
      dbt.estimated_value !== undefined && dbt.estimated_value !== null
        ? dbt.estimated_value
        : existing
        ? existing.estimatedValue
        : 0,
    currency: dbt.currency || (existing ? existing.currency : 'USD'),
    exchangeRateToBdt:
      dbt.exchange_rate_to_bdt !== undefined && dbt.exchange_rate_to_bdt !== null
        ? dbt.exchange_rate_to_bdt
        : existing
        ? existing.exchangeRateToBdt
        : 122.0,
    exchangeRateDate:
      dbt.exchange_rate_date || (existing ? existing.exchangeRateDate : ''),
    estimatedValueBdt:
      dbt.estimated_value_bdt !== undefined && dbt.estimated_value_bdt !== null
        ? dbt.estimated_value_bdt
        : existing
        ? existing.estimatedValueBdt
        : 0,
    procurementManagerName:
      dbt.procurement_manager_name || (existing ? existing.procurementManagerName : ''),
    procurementManagerDesignation:
      dbt.procurement_manager_designation || (existing ? existing.procurementManagerDesignation : ''),
    procurementManagerEmail:
      dbt.procurement_manager_email || (existing ? existing.procurementManagerEmail : ''),
    procurementManagerPhone:
      dbt.procurement_manager_phone || (existing ? existing.procurementManagerPhone : ''),
    helplinePhone:
      dbt.helpline_phone || (existing ? existing.helplinePhone : ''),
    helplineEmail:
      dbt.helpline_email || (existing ? existing.helplineEmail : ''),
    helplineHours:
      dbt.helpline_hours || (existing ? existing.helplineHours : ''),
    stage: (dbt.stage as TenderStage) || (existing ? existing.stage : 'DISCOVERED'),
    decision:
      (dbt.decision as DecisionStatus) || (existing ? existing.decision : 'PENDING'),
    priority: dbt.priority || (existing ? existing.priority : 'MEDIUM'),
    submissionDeadline:
      dbt.submission_deadline || (existing ? existing.submissionDeadline : ''),
    daysRemaining: (() => {
      if (dbt.submission_deadline) {
        const d = new Date(dbt.submission_deadline);
        if (!isNaN(d.getTime())) {
          const diff = d.getTime() - Date.now();
          return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
        }
      }
      return dbt.days_remaining !== undefined
        ? dbt.days_remaining
        : existing
        ? existing.daysRemaining
        : 0;
    })(),
    hoursRemaining: (() => {
      if (dbt.submission_deadline) {
        const d = new Date(dbt.submission_deadline);
        if (!isNaN(d.getTime())) {
          const diff = d.getTime() - Date.now();
          return diff > 0 ? Math.floor(diff / (1000 * 60 * 60)) : 0;
        }
      }
      return dbt.hours_remaining !== undefined
        ? dbt.hours_remaining
        : existing
        ? existing.hoursRemaining
        : 0;
    })(),
    readinessScore:
      dbt.readiness_score !== undefined
        ? dbt.readiness_score
        : existing
        ? existing.readinessScore
        : 0,
    missingDocumentsCount: missingDocs,
    completedTasksCount: completedTasks,
    totalTasksCount: dbTasks.length,
    leadOwner: {
      name:
        dbt.lead_owner_name ||
        (existing ? existing.leadOwner.name : 'Unassigned'),
      role:
        dbt.lead_owner_role ||
        (existing ? existing.leadOwner.role : 'Lead Officer'),
    },
    blockers,
    tasks: dbTasks,
    requirements: dbReqs,
    documents: dbDocs,
    reviews: dbReviews,
    decisionMatrix: dbMatrix,
    summary: dbSummary
      ? {
          ...dbSummary,
          procurementManager: dbSummary.procurementManager || {
            name: dbt.procurement_manager_name || '',
            designation: dbt.procurement_manager_designation || '',
            email: dbt.procurement_manager_email || '',
            phone: dbt.procurement_manager_phone || '',
          },
          helpline: dbSummary.helpline || {
            phone: dbt.helpline_phone || '',
            email: dbt.helpline_email || '',
            hours: dbt.helpline_hours || '',
          },
        }
      : dbSummary,
    tenderType: dbt.tender_type || existing?.tenderType,
    budgetType: dbt.budget_type || existing?.budgetType,
    sourceOfFund: dbt.source_of_fund || existing?.sourceOfFund,
    procurementMethod: dbt.procurement_method || existing?.procurementMethod,
    evaluationMethod: dbt.evaluationMethod || dbt.evaluation_method || existing?.evaluationMethod,
    parentEoiId: dbt.parent_eoi_id || existing?.parentEoiId,
    spawnedRfpId: dbt.spawned_rfp_id || existing?.spawnedRfpId,
    eoiShortlistStatus: dbt.eoi_shortlist_status || existing?.eoiShortlistStatus,
    importantClauses: Array.isArray(dbt.important_clauses)
      ? dbt.important_clauses
      : existing?.importantClauses || [],
    postAward: dbt.post_award_data || existing?.postAward,
    financialModel: dbt.financial_model || existing?.financialModel,
    aiChatShareLink: dbt.ai_chat_share_link || existing?.aiChatShareLink,
    languages: Array.isArray(dbt.languages)
      ? dbt.languages
      : existing?.languages || [],
    amendments: Array.isArray(dbt.amendments)
      ? dbt.amendments
      : existing?.amendments || [],
  };
}
