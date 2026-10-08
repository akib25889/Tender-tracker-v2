import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileSignature,
  PlayCircle,
  PackageCheck,
  Clock,
  Wrench,
  Save,
  FileText,
  Sparkles,
  ArrowRight,
  Plus,
  Layers,
} from 'lucide-react';
import { PostAwardData, Tender } from '../../types/tender';

export const TenderResultTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenders, updateTender, updateTenderStage, addTender } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const isEoi =
    tender?.tenderType === 'Expression of Interest (EOI)' ||
    tender?.tenderType?.toLowerCase().includes('expression of interest');

  const [outcome, setOutcome] = useState<'AWARDED' | 'LOST'>(
    tender?.stage === 'AWARDED' ? 'AWARDED' : 'LOST'
  );
  const [eoiOutcome, setEoiOutcome] = useState<'SHORTLISTED' | 'NOT_SHORTLISTED'>(
    tender?.eoiShortlistStatus === 'SHORTLISTED' || tender?.stage === 'AWARDED'
      ? 'SHORTLISTED'
      : 'SHORTLISTED'
  );

  const [awardedAmount, setAwardedAmount] = useState(
    (tender?.estimatedValue || 0).toString()
  );
  const [lossReason, setLossReason] = useState('Price Competitiveness');
  const defaultNotes = isEoi
    ? 'Technical qualification and consortium statutory credentials verified. Shortlisted among top bidders for RFP stage.'
    : 'Evaluated high technical score (92/100). Competitor discount was 4.2% below margin limit.';
  const [notes, setNotes] = useState(defaultNotes);
  const [saved, setSaved] = useState(false);
  const [roadmapSaved, setRoadmapSaved] = useState(false);

  // Quick RFP Spawn Modal/Form state
  const [isSpawningRfp, setIsSpawningRfp] = useState(false);
  const [rfpTitle, setRfpTitle] = useState(
    tender?.title
      ? `Request for Proposals (RFP) for ${tender.title.replace(/^EOI\s*[-–:]\s*/i, '')}`
      : 'Request for Proposals (RFP)'
  );
  const [rfpDeadline, setRfpDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [rfpValue, setRfpValue] = useState((tender?.estimatedValue || 2500000).toString());

  // Post-Award Execution State
  const initialPostAward: PostAwardData = tender?.postAward || {
    noaDate: tender?.contractSigningDate ? new Date(Date.parse(tender.contractSigningDate) - 14 * 86400000).toISOString().split('T')[0] : '',
    noaReference: tender?.referenceNo ? `NOA-${tender.referenceNo}` : 'NOA/2026/049',
    performanceSecurityAmount: Math.round((tender?.estimatedValue || 0) * 0.1),
    performanceSecurityDueDate: '',
    performanceSecurityStatus: 'PENDING',
    contractSigningStatus: 'SCHEDULED',
    contractSigningDate: tender?.contractSigningDate || '',
    workOrderReference: tender?.referenceNo ? `WO-${tender.referenceNo}` : '',
    workStartDate: tender?.workStartDate || '',
    handoverStatus: 'PENDING',
    productHandoverDate: tender?.productHandoverDate || '',
    warrantyEndDate: '',
    maintenancePeriod: tender?.maintenancePeriod || '24 Months Post-Handover SLA',
  };

  const [postAward, setPostAward] = useState<PostAwardData>(initialPostAward);
  const [possiblePeriod, setPossiblePeriod] = useState(tender?.possiblePeriod || '12 Months Execution');

  if (!tender) return null;

  const spawnedRfpTender = tender.spawnedRfpId
    ? tenders.find((t) => t.id === tender.spawnedRfpId)
    : null;

  const handleRecordResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEoi) {
      const newStage = eoiOutcome === 'SHORTLISTED' ? 'AWARDED' : 'LOST';
      updateTenderStage(tender.id, newStage);
      updateTender(tender.id, {
        eoiShortlistStatus: eoiOutcome,
        decision: eoiOutcome === 'SHORTLISTED' ? 'GO' : 'NO_GO',
      });
    } else {
      updateTenderStage(tender.id, outcome);
      if (outcome === 'AWARDED') {
        updateTender(tender.id, {
          estimatedValue: Number(awardedAmount) || tender.estimatedValue,
          postAward,
        });
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleSpawnLinkedRfp = (e: React.FormEvent) => {
    e.preventDefault();
    const newRfpId = `TDR-2026-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const parsedVal = Number(rfpValue) || tender.estimatedValue || 2500000;

    const newRfp: Partial<Tender> = {
      id: newRfpId,
      referenceNo: tender.referenceNo ? `RFP-${tender.referenceNo}` : '',
      title: rfpTitle,
      organization: tender.organization,
      country: tender.country,
      category: tender.category,
      tenderType: 'Request for Proposals (RFP)',
      budgetType: tender.budgetType,
      sourceOfFund: tender.sourceOfFund,
      procurementMethod: tender.procurementMethod || 'Quality & Cost Based Selection (QCBS)',
      parentEoiId: tender.id,
      estimatedValue: parsedVal,
      currency: tender.currency || 'USD',
      exchangeRateToBdt: tender.exchangeRateToBdt || 122.0,
      exchangeRateDate: tender.exchangeRateDate,
      estimatedValueBdt: tender.currency === 'BDT' ? parsedVal : Math.round(parsedVal * (tender.exchangeRateToBdt || 122.0)),
      procurementManagerName: tender.procurementManagerName,
      procurementManagerDesignation: tender.procurementManagerDesignation,
      procurementManagerEmail: tender.procurementManagerEmail,
      procurementManagerPhone: tender.procurementManagerPhone,
      helplinePhone: tender.helplinePhone,
      helplineEmail: tender.helplineEmail,
      helplineHours: tender.helplineHours,
      priority: 'HIGH',
      stage: 'DISCOVERED',
      decision: 'GO',
      submissionDeadline: new Date(rfpDeadline).toISOString(),
      summary: tender.summary
        ? {
            ...tender.summary,
            tenderType: 'Request for Proposals (RFP)',
            projectName: rfpTitle,
          }
        : undefined,
      importantClauses: tender.importantClauses || [],
      financialModel: tender.financialModel,
    };

    addTender(newRfp);
    updateTender(tender.id, {
      spawnedRfpId: newRfpId,
      eoiShortlistStatus: 'SHORTLISTED',
      stage: 'AWARDED',
    });
    setIsSpawningRfp(false);
    navigate(`/tenders/${newRfpId}`);
  };

  const handleSaveRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    updateTender(tender.id, {
      postAward,
      contractSigningDate: postAward.contractSigningDate || tender.contractSigningDate,
      workStartDate: postAward.workStartDate || tender.workStartDate,
      productHandoverDate: postAward.productHandoverDate || tender.productHandoverDate,
      maintenancePeriod: postAward.maintenancePeriod || tender.maintenancePeriod,
      possiblePeriod,
    });
    setRoadmapSaved(true);
    setTimeout(() => setRoadmapSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      <Card
        title={isEoi ? 'EOI Shortlisting & Qualification Ledger' : 'Tender Outcome & Debrief Ledger'}
        subtitle={
          isEoi
            ? 'Record official qualification results for Expression of Interest (EOI) and transition to next-stage RFP'
            : 'Formal contract confirmation or structured loss root-cause debrief tracking'
        }
      >
        {saved && (
          <div className="mb-4 p-3 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-lg text-[var(--ok)] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isEoi
                ? 'EOI qualification outcome recorded successfully!'
                : 'Tender outcome recorded and fed to Win/Loss Analytics Suite!'}
            </span>
          </div>
        )}

        <form onSubmit={handleRecordResult} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                {isEoi ? 'EOI Evaluation Outcome *' : 'Final Evaluation Outcome *'}
              </label>
              {isEoi ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEoiOutcome('SHORTLISTED')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors border ${
 eoiOutcome === 'SHORTLISTED'
                        ? 'bg-[var(--ok)] text-[var(--accent-on)] border-[var(--ok)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Shortlisted / Qualified for RFP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEoiOutcome('NOT_SHORTLISTED')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors border ${
 eoiOutcome === 'NOT_SHORTLISTED'
                        ? 'bg-[var(--crit)] text-[var(--accent-on)] border-[var(--crit)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Not Shortlisted / Disqualified</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome('AWARDED')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors border ${
 outcome === 'AWARDED'
                        ? 'bg-[var(--ok)] text-[var(--accent-on)] border-[var(--ok)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Contract Won / Awarded</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('LOST')}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors border ${
 outcome === 'LOST'
                        ? 'bg-[var(--crit)] text-[var(--accent-on)] border-[var(--crit)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Bid Lost / Non-Award</span>
                  </button>
                </div>
              )}
            </div>

            {isEoi ? (
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Procurement Modality
                </label>
                <div className="px-3 py-2 bg-[var(--accent-soft)] border border-[var(--accent-line)] rounded-lg text-[var(--accent)] font-semibold flex items-center justify-between">
                  <span>2-Stage Procurement (EOI → RFP)</span>
                  <span className="text-[10px] font-mono uppercase bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded font-bold">
                    Gate Stage 1
                  </span>
                </div>
              </div>
            ) : outcome === 'AWARDED' ? (
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Final Awarded Contract Value ($ USD) *
                </label>
                <input
                  type="number"
                  value={awardedAmount}
                  onChange={(e) => setAwardedAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono font-bold text-[var(--text-primary)]"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Primary Root-Cause Loss Reason *
                </label>
                <select
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="Price Competitiveness">Price Competitiveness (Commercial Margin)</option>
                  <option value="Technical Specification Gap">Technical Specification Gap</option>
                  <option value="Past Reference Weighting">Past Reference / Turnover Weighting</option>
                  <option value="Compliance Disqualification">Compliance Disqualification</option>
                  <option value="Late Submission / Portal Glitch">Late Submission / Portal Glitch</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Debrief Notes &amp; {isEoi ? 'Qualification Evaluation *' : 'Competitive Analysis *'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg font-semibold hover:bg-[var(--accent-hover)] shadow-sm transition-colors"
            >
              {isEoi ? 'Save EOI Qualification Status' : 'Record Outcome Evaluation'}
            </button>
          </div>
        </form>
      </Card>

      {/* 2-STAGE PROCUREMENT: EOI -> RFP NEXT STAGE WORKSPACE */}
      {isEoi && (eoiOutcome === 'SHORTLISTED' || tender.eoiShortlistStatus === 'SHORTLISTED') && (
        <Card
          title="2-Stage Procurement Flow: Next Stage RFP Participation"
          subtitle="Having won/qualified in the Expression of Interest (EOI), initiate and participate in the linked Request for Proposals (RFP) stage"
        >
          {tender.spawnedRfpId ? (
            <div className="p-4 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
                    <span className="text-sm font-bold text-[var(--ok)]">
                      Linked RFP Stage Active: {tender.spawnedRfpId}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ok)]">
                    {spawnedRfpTender?.title || 'Request for Proposals Opportunity'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[var(--ok)]">
                    <span className="font-semibold">Stage: {spawnedRfpTender?.stage || 'DISCOVERED'}</span>
                    <span>•</span>
                    <span>Deadline: {spawnedRfpTender?.submissionDeadline ? new Date(spawnedRfpTender.submissionDeadline).toLocaleDateString('en-GB') : 'Upcoming'}</span>
                    <span>•</span>
                    <span>Category: {spawnedRfpTender?.category || tender.category}</span>
                  </div>
                </div>

                <Link
                  to={`/tenders/${tender.spawnedRfpId}`}
                  className="px-4 py-2 bg-[var(--ok)] text-[var(--accent-on)] text-xs font-bold rounded-lg hover:bg-[var(--ok)] transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <span>Go to Linked RFP Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-[var(--accent-soft)] border border-[var(--accent-line)] rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--accent)]">
                    EOI Shortlisted! Ready to Participate in Request for Proposals (RFP)
                  </h4>
                  <p className="text-xs text-[var(--accent)]">
                    Our company has cleared the preliminary qualification stage. You can now spawn and participate in the linked RFP tender workspace with full context inheritance (Organization, Country, Category, and Statutory Documents).
                  </p>
                </div>
              </div>

              {!isSpawningRfp ? (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSpawningRfp(true)}
                    className="px-4 py-2.5 bg-[var(--accent)] text-[var(--accent-on)] text-xs font-bold rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Initiate Linked RFP Stage</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSpawnLinkedRfp} className="p-4 bg-[var(--bg-surface)] border border-[var(--accent-line)] rounded-xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[var(--accent)]" />
                      Launch Linked RFP Opportunity from Parent EOI #{tender.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSpawningRfp(false)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        RFP Tender Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={rfpTitle}
                        onChange={(e) => setRfpTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        RFP Submission Deadline *
                      </label>
                      <input
                        type="date"
                        required
                        value={rfpDeadline}
                        onChange={(e) => setRfpDeadline(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        Estimated Value ({tender.currency || 'USD'})
                      </label>
                      <input
                        type="number"
                        value={rfpValue}
                        onChange={(e) => setRfpValue(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] space-y-1">
                    <p className="font-semibold text-[var(--text-primary)]">Inherited Context from Parent EOI:</p>
                    <p>• Client Authority: <span className="font-medium text-[var(--text-primary)]">{tender.organization}</span> ({tender.country})</p>
                    <p>• SOW Category: <span className="font-medium text-[var(--text-primary)]">{tender.category}</span></p>
                    <p>• Procurement Modality: <span className="font-medium text-[var(--text-primary)]">2-Stage Procurement (Linked to EOI #{tender.id})</span></p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSpawningRfp(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] text-xs font-bold rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <span>Create &amp; Open Linked RFP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Card>
      )}

      {/* POST-AWARD EXECUTION & CONTRACT DELIVERY ROADMAP (For non-EOI contracts) */}
      {!isEoi && outcome === 'AWARDED' && (
        <Card
          title="Post-Award Execution & Contract Delivery Roadmap"
          subtitle="Lifecycle progression after contract award: NOA acceptance, performance security, contract signing, mobilization, execution, and handover"
        >
          {roadmapSaved && (
            <div className="mb-4 p-3 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-lg text-[var(--ok)] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Post-award roadmap saved! Calendar milestones and project schedules updated.</span>
            </div>
          )}

          <div className="mb-5 p-3.5 bg-[var(--accent-soft)] border border-[var(--accent-line)] rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--accent)] space-y-1">
              <p className="font-bold">After We Won the Tender — What's Next?</p>
              <p className="text-[var(--accent)]">
                Winning the tender initiates statutory legal commitments. Follow the 7-phase operational roadmap below to secure the contract, deposit the performance guarantee, mobilize resources, and execute project deliverables smoothly.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveRoadmap} className="space-y-6 text-xs">
            {/* Step 1: Notification of Award (NOA) */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[var(--accent)]" />
                    Notification of Award (NOA) Acceptance
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)]">
                  Step 1 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Issuance of the formal Letter of Acceptance by the procuring authority. The contractor must formally acknowledge and accept within statutory days.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">NOA Reference Memo No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Memo No. 44.02.0000.012.26"
                    value={postAward.noaReference || ''}
                    onChange={(e) => setPostAward({ ...postAward, noaReference: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">NOA Issuance Date</label>
                  <input
                    type="date"
                    value={postAward.noaDate || ''}
                    onChange={(e) => setPostAward({ ...postAward, noaDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Performance Security (PG) Deposit */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--ok)]" />
                    Performance Security Guarantee (PG)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                  Step 2 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Typically 5% to 10% of total awarded contract value, submitted via irrevocable Bank Guarantee or Pay Order within 14-28 days of NOA.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[var(--text-primary)]">PG Amount ($ / ৳)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const amt = Math.round((tender.estimatedValue || 0) * 0.1);
                        setPostAward({ ...postAward, performanceSecurityAmount: amt });
                      }}
                      className="text-[10px] text-[var(--accent)] font-bold hover:underline"
                    >
                      Calc 10%
                    </button>
                  </div>
                  <input
                    type="number"
                    value={postAward.performanceSecurityAmount || ''}
                    onChange={(e) =>
                      setPostAward({
                        ...postAward,
                        performanceSecurityAmount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono font-bold text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    value={postAward.performanceSecurityDueDate || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, performanceSecurityDueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Deposit Status</label>
                  <select
                    value={postAward.performanceSecurityStatus || 'PENDING'}
                    onChange={(e) =>
                      setPostAward({
                        ...postAward,
                        performanceSecurityStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-semibold"
                  >
                    <option value="PENDING">PENDING DEPOSIT</option>
                    <option value="DEPOSITED">DEPOSITED &amp; ACKNOWLEDGED</option>
                    <option value="RELEASED">RELEASED (POST-CONTRACT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Official Contract Signing */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <FileSignature className="w-4 h-4 text-[var(--text-secondary)]" />
                    Official Contract Signing (Contract Day)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                  Step 3 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Bilateral execution of legal contract deed on non-judicial stamp paper with the procuring entity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Contract Signing Date</label>
                  <input
                    type="date"
                    value={postAward.contractSigningDate || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, contractSigningDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Signing Status</label>
                  <select
                    value={postAward.contractSigningStatus || 'SCHEDULED'}
                    onChange={(e) =>
                      setPostAward({
                        ...postAward,
                        contractSigningStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-semibold"
                  >
                    <option value="SCHEDULED">SCHEDULED / PENDING DATE</option>
                    <option value="SIGNED">EXECUTED &amp; SIGNED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Work Commencement / Mobilization */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    4
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-[var(--warn)]" />
                    Work Start Day &amp; Mobilization
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn-line)]">
                  Step 4 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Receipt of Work Order / Notice to Proceed (NTP), kickoff meeting, and deployment of engineering teams and hardware infrastructure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Work Order / NTP Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. WO-2026-ICT-008"
                    value={postAward.workOrderReference || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, workOrderReference: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Work Start Day (Kickoff)</label>
                  <input
                    type="date"
                    value={postAward.workStartDate || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, workStartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Execution & Deliverables Tracking */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    5
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--accent)]" />
                    Execution &amp; Possible Period
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                  Step 5 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Active project rollout duration, sprints, sprint demos, and milestone deliverables delivery timeline.
              </p>
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Possible / Execution Period Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 Months from Work Order / 180 Calendar Days"
                  value={possiblePeriod}
                  onChange={(e) => setPossiblePeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-semibold"
                />
              </div>
            </div>

            {/* Step 6: Product Hand Over Day & UAT Acceptance */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    6
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-[var(--ok)]" />
                    Product Hand Over Day &amp; UAT
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)]">
                  Step 6 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                User Acceptance Testing (UAT), training sign-off, and formal issuance of Provisional / Final Acceptance Certificate (PAC/FAC).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Product Hand Over Day</label>
                  <input
                    type="date"
                    value={postAward.productHandoverDate || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, productHandoverDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Handover / UAT Status</label>
                  <select
                    value={postAward.handoverStatus || 'PENDING'}
                    onChange={(e) =>
                      setPostAward({
                        ...postAward,
                        handoverStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-semibold"
                  >
                    <option value="PENDING">PENDING DEVELOPMENT</option>
                    <option value="UAT_IN_PROGRESS">UAT IN PROGRESS</option>
                    <option value="HANDED_OVER">HANDED OVER (PAC SIGNED)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 7: Support & Maintenance Period (SLA) */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl space-y-3 relative hover:border-[var(--border-strong)] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-on)] font-bold flex items-center justify-center text-xs">
                    7
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[var(--text-secondary)]" />
                    Support &amp; Maintenance Period (O&amp;M)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                  Step 7 of 7
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Post-delivery warranty, tier-3/4 technical support, system patching, and SLA performance management.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Maintenance Period Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 Months Comprehensive O&M + 24/7 Helpline"
                    value={postAward.maintenancePeriod || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, maintenancePeriod: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Warranty End Date</label>
                  <input
                    type="date"
                    value={postAward.warrantyEndDate || ''}
                    onChange={(e) =>
                      setPostAward({ ...postAward, warrantyEndDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg font-bold hover:bg-[var(--accent-hover)] shadow-sm transition-colors flex items-center gap-2 text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Post-Award Roadmap &amp; Update Milestones</span>
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
