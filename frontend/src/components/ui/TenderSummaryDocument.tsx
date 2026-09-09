import React from 'react';
import { Tender } from '../../types/tender';

interface TenderSummaryDocumentProps {
  tender: Tender;
}

export const TenderSummaryDocument: React.FC<TenderSummaryDocumentProps> = ({ tender }) => {
  const s = tender.summary;
  const fm = tender.financialModel || s?.financialModel;
  const fmt = (date: string | undefined) =>
    date && !isNaN(Date.parse(date))
      ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      : date || '';

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <tr className="border-b border-[#E8EDF2] last:border-0">
      <td
        className="py-2.5 px-4 font-semibold text-[#1A2B4A] bg-[#F0F4F8] w-56 text-sm align-top border-r border-[#E8EDF2]"
      >
        {label}
      </td>
      <td className="py-2.5 px-4 text-[#2D3A4A] text-sm">
        {value || <span className="text-[#9CA3AF] italic">Not specified in the available documents</span>}
      </td>
    </tr>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-6">
      <h2
        className="text-base font-bold mb-3"
        style={{ color: '#1B4F9B', fontFamily: 'Georgia, serif' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );

  const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <h3 className="text-sm font-bold mb-2" style={{ color: '#2563EB' }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const BulletList = ({ items }: { items?: (string | null)[] }) => {
    const filtered = (items ?? []).filter(Boolean) as string[];
    if (!filtered.length) return null;
    return (
      <ul className="list-none space-y-1.5 pl-1">
        {filtered.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#2D3A4A]">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4B5563] shrink-0" />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  const displayId = s?.tenderIdDisplay || tender.id;
  const displayTitle = s?.shortTitle || s?.projectName || tender.title;

  return (
    <div
      className="max-w-4xl mx-auto py-10 px-8 sm:px-12 bg-white my-2 shadow-sm border border-[#E2E8F0] rounded-lg print:border-none print:shadow-none print:my-0 print:py-4 print:px-6"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      {/* Document Title Header */}
      <div className="text-center mb-8 pb-4 border-b border-[#F1F5F9]">
        <h1
          className="text-2xl font-bold tracking-widest uppercase mb-2"
          style={{ color: '#1A2B4A', letterSpacing: '0.12em' }}
        >
          Tender Summary
        </h1>
        <p className="text-sm font-semibold" style={{ color: '#2D3A4A' }}>
          {displayId} | {displayTitle}
        </p>
      </div>

      {/* BASIC INFORMATION */}
      <Section title="Basic Information">
        <table className="w-full border-collapse border border-[#C8D5E2]">
          <tbody>
            <Row label="Country" value={tender.country} />
            <Row label="Project Name" value={s?.projectName} />
            <Row label="Tender Title" value={tender.title} />
            <Row label="Reference No." value={tender.referenceNo} />
            <Row label="Tender ID" value={s?.tenderIdDisplay || tender.id} />
            <Row label="Client / Organization" value={tender.organization} />
            <Row label="Portal" value={s?.portal} />
            <Row label="Tender Type / Classification" value={tender.tenderType || s?.tenderType} />
            <Row
              label="Procurement Modality & Stage"
              value={
                tender.parentEoiId
                  ? `2-Stage Procurement (Spawned from Originating EOI #${tender.parentEoiId})`
                  : tender.spawnedRfpId
                  ? `2-Stage Procurement (Parent EOI with Linked RFP #${tender.spawnedRfpId})`
                  : tender.tenderType === 'Request for Proposals (RFP)'
                  ? 'Direct RFP Modality (Single-Stage Open Procurement)'
                  : tender.tenderType === 'Expression of Interest (EOI)'
                  ? 'EOI Qualification Stage (Prequalification for upcoming RFP)'
                  : 'Standard Single-Stage Procurement'
              }
            />
            <Row label="Budget Type" value={tender.budgetType || s?.budgetType} />
            <Row label="Source of Fund (Financier)" value={tender.sourceOfFund || s?.sourceOfFund} />
            <Row label="Procurement Method" value={tender.procurementMethod || s?.procurementMethod} />
            <Row label="Published Date" value={s?.publishedDate || null} />
            <Row
              label="Last Date (Submission Deadline)"
              value={tender.submissionDeadline ? fmt(tender.submissionDeadline) : null}
            />
            <Row label="Submission Time" value={s?.submissionTime || null} />
            {(tender.procurementManagerName || s?.procurementManager?.name) && (
              <Row
                label="Procurement Officer / Contact"
                value={[
                  tender.procurementManagerName || s?.procurementManager?.name,
                  tender.procurementManagerDesignation || s?.procurementManager?.designation,
                  (tender.procurementManagerPhone || s?.procurementManager?.phone)
                    ? `Tel: ${tender.procurementManagerPhone || s?.procurementManager?.phone}`
                    : null,
                  (tender.procurementManagerEmail || s?.procurementManager?.email)
                    ? `Email: ${tender.procurementManagerEmail || s?.procurementManager?.email}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              />
            )}
            {(tender.helplinePhone || s?.helpline?.phone || tender.helplineEmail || s?.helpline?.email) && (
              <Row
                label="Helpline & Support Desk"
                value={[
                  (tender.helplinePhone || s?.helpline?.phone)
                    ? `Hotline: ${tender.helplinePhone || s?.helpline?.phone}`
                    : null,
                  (tender.helplineEmail || s?.helpline?.email)
                    ? `Email: ${tender.helplineEmail || s?.helpline?.email}`
                    : null,
                  (tender.helplineHours || s?.helpline?.hours)
                    ? `Hours: ${tender.helplineHours || s?.helpline?.hours}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              />
            )}
            {Boolean(tender.estimatedValue && tender.estimatedValue > 0) && (
              <Row
                label="Estimated Net Value"
                value={`${tender.currency || 'USD'} ${tender.estimatedValue.toLocaleString()}${
                  tender.estimatedValueBdt && tender.currency !== 'BDT'
                    ? ` (≈ ৳${Math.round(tender.estimatedValueBdt).toLocaleString()} BDT)`
                    : ''
                }`}
              />
            )}
          </tbody>
        </table>
      </Section>

      {/* REQUIREMENTS */}
      {(s?.mainIdea || s?.commercial || (s?.technicalReqs?.length ?? 0) > 0 || (s?.technologyMentioned?.length ?? 0) > 0 || (s?.operationalReqs?.length ?? 0) > 0) && (
        <Section title="Requirements">
          {s?.mainIdea && (
            <SubSection title="Main Idea">
              <p className="text-sm text-[#2D3A4A] leading-relaxed mb-3">{s.mainIdea}</p>
            </SubSection>
          )}

          {s?.commercial && (
            <SubSection title="Commercial &amp; Financial Terms">
              <BulletList
                items={[
                  tender.tenderSecurityAmount || s.commercial.tenderSecurityAmount
                    ? `Tender Security / EMD: ${tender.currency === 'BDT' ? '৳' : '$'}${(tender.tenderSecurityAmount || s.commercial.tenderSecurityAmount || 0).toLocaleString()} via ${tender.tenderSecurityMethod || s.commercial.tenderSecurityMethod || 'Bank Guarantee'}. ${s.commercial.tenderSecurity ? `(${s.commercial.tenderSecurity})` : ''}`
                    : s.commercial.tenderSecurity ? `Tender security: ${s.commercial.tenderSecurity}` : null,
                  tender.schedulePurchaseDeadline || s.commercial.schedulePurchaseDeadline
                    ? `Schedule / Form Purchase: Closes ${tender.schedulePurchaseDeadline || s.commercial.schedulePurchaseDeadline} via ${tender.schedulePurchaseMethod || s.commercial.schedulePurchaseMethod || 'Online e-GP'}. Price: ${s.commercial.tenderDocPrice || 'Free on Portal'}.`
                    : s.commercial.tenderDocPrice ? `Tender document price: ${s.commercial.tenderDocPrice}` : null,
                  s.commercial.contractPeriod || tender.possiblePeriod ? `Execution / Contract period: ${s.commercial.contractPeriod || tender.possiblePeriod}` : null,
                  tender.maintenancePeriod || s.commercial.maintenancePeriod ? `Support & Maintenance / Warranty: ${tender.maintenancePeriod || s.commercial.maintenancePeriod}` : null,
                  s.dates?.contractStart || tender.workStartDate ? `Expected start date: ${s.dates?.contractStart || tender.workStartDate}.` : null,
                  s.commercial.performanceSecurity ? `Performance security: ${s.commercial.performanceSecurity}` : null,
                  tender.submissionDeadline
                    ? `Submission deadline: ${fmt(tender.submissionDeadline)}${s?.submissionTime ? `, ${s.submissionTime}` : ''}.`
                    : null,
                ]}
              />
            </SubSection>
          )}

          {(s?.technicalReqs?.length ?? 0) > 0 && (
            <SubSection title="Technical Requirements">
              <BulletList items={s!.technicalReqs} />
            </SubSection>
          )}

          {(s?.technologyMentioned?.length ?? 0) > 0 && (
            <SubSection title="Software / Technology Mentioned">
              <BulletList items={s!.technologyMentioned} />
            </SubSection>
          )}

          {(s?.operationalReqs?.length ?? 0) > 0 && (
            <SubSection title="Operational / Service Requirements">
              <BulletList items={s!.operationalReqs} />
            </SubSection>
          )}
        </Section>
      )}

      {/* FINANCIAL SCENARIOS, PAYMENT SCHEDULE & CONTRACT RULES */}
      {fm && (
        <Section title="Financial Scenarios, Payment Schedule & Contract Rules">
          {/* Overview Grid */}
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Disbursement Model</span>
              <span className="text-xs font-bold text-[#1E293B]">
                {fm.paymentScenario === 'MILESTONE_BASED'
                  ? 'Milestone-Based'
                  : fm.paymentScenario === 'ADVANCE_AND_MILESTONES'
                  ? 'Advance + Milestones'
                  : fm.paymentScenario === 'ACCEPTANCE_BASED'
                  ? 'Acceptance-Based'
                  : fm.paymentScenario === 'LUMP_SUM_FINAL'
                  ? 'Final Lump-Sum'
                  : 'Standard Delivery'}
              </span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Working Capital Risk</span>
              <span
                className={`text-xs font-bold ${
                  fm.workingCapitalRisk === 'LOW'
                    ? 'text-emerald-700'
                    : fm.workingCapitalRisk === 'HIGH'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}
              >
                {fm.workingCapitalRisk || 'MEDIUM'} Risk
              </span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Advance Mobilization</span>
              <span className="text-xs font-semibold text-[#1E293B]">
                {fm.advancePayment?.enabled ? `${fm.advancePayment.percentage}% Advance` : 'None (0%)'}
              </span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Retention Deduction</span>
              <span className="text-xs font-semibold text-[#1E293B]">
                {fm.penaltiesAndDeductions?.retentionMoney?.enabled
                  ? `${fm.penaltiesAndDeductions.retentionMoney.percentage}% Retention`
                  : 'None'}
              </span>
            </div>
          </div>

          {/* Advance Payment SubSection */}
          {fm.advancePayment?.enabled && (
            <div className="mb-4 bg-blue-50/50 border border-blue-200 rounded p-3 text-xs text-[#1E293B]">
              <div className="font-bold text-[#1E40AF] mb-1">Advance Payment & Mobilization Terms</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  Advance Ratio:{' '}
                  <span className="font-semibold">
                    {fm.advancePayment.percentage}%{' '}
                    {fm.advancePayment.amount
                      ? `(${tender.currency || 'USD'} ${fm.advancePayment.amount.toLocaleString()})`
                      : ''}
                  </span>
                </div>
                <div>
                  Bank Guarantee (APG):{' '}
                  <span className="font-semibold">
                    {fm.advancePayment.bankGuaranteeRequired
                      ? `Required (${fm.advancePayment.bankGuaranteeType || '100% Unconditional APG'})`
                      : 'Not required'}
                  </span>
                </div>
                <div>
                  Recovery Mechanism:{' '}
                  <span className="font-semibold">
                    {fm.advancePayment.recoveryType === 'PRO_RATA_INVOICE'
                      ? `Pro-rata (${fm.advancePayment.recoveryPercentagePerInvoice || 0}% per invoice)`
                      : fm.advancePayment.recoveryType === 'BALLOON_RECOVERY'
                      ? 'Balloon recovery at completion'
                      : 'Interim payment certificates'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Schedule Table */}
          {fm.milestones && fm.milestones.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <div className="text-xs font-bold text-[#1A2B4A] mb-1.5">Milestone Payment Disbursement Schedule</div>
              <table className="w-full border-collapse text-xs border border-[#C8D5E2]">
                <thead>
                  <tr style={{ backgroundColor: '#E8F0FB', color: '#1A2B4A' }}>
                    <th className="py-2 px-2.5 text-left font-semibold border-b border-r border-[#C8D5E2] w-10">#</th>
                    <th className="py-2 px-2.5 text-left font-semibold border-b border-r border-[#C8D5E2]">
                      Milestone / Deliverable
                    </th>
                    <th className="py-2 px-2.5 text-left font-semibold border-b border-r border-[#C8D5E2]">
                      Approval / Trigger Criteria
                    </th>
                    <th className="py-2 px-2.5 text-right font-semibold border-b border-r border-[#C8D5E2] w-20">
                      Share %
                    </th>
                    <th className="py-2 px-2.5 text-right font-semibold border-b border-r border-[#C8D5E2] w-28">
                      Net Amount
                    </th>
                    <th className="py-2 px-2.5 text-center font-semibold border-b border-[#C8D5E2] w-28">
                      Review / Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fm.milestones.map((m, idx) => (
                    <tr key={m.id || idx} className="border-b border-[#E8EDF2] last:border-0 hover:bg-slate-50/50">
                      <td className="py-2 px-2.5 text-[#64748B] border-r border-[#E8EDF2] font-mono text-center">
                        {m.milestoneNumber || idx + 1}
                      </td>
                      <td className="py-2 px-2.5 text-[#1A2B4A] border-r border-[#E8EDF2] font-medium">
                        <div>{m.name}</div>
                        {m.deliverable && (
                          <div className="text-[11px] text-[#64748B] font-normal">{m.deliverable}</div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-[#475569] border-r border-[#E8EDF2]">
                        {m.paymentTrigger ||
                          (m.approvalRequired
                            ? 'Client formal acceptance certificate'
                            : 'Standard completion')}
                      </td>
                      <td className="py-2 px-2.5 text-right text-[#1A2B4A] border-r border-[#E8EDF2] font-semibold">
                        {m.percentage}%
                      </td>
                      <td className="py-2 px-2.5 text-right text-[#1A2B4A] border-r border-[#E8EDF2]">
                        {m.amount != null ? `${tender.currency || 'USD'} ${m.amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-2.5 text-center text-[#64748B]">
                        {m.clientReviewDays || 14}d rev / {m.paymentProcessingDays || 30}d pay
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F1F5F9] font-semibold text-[#1A2B4A] border-t border-[#C8D5E2]">
                    <td colSpan={3} className="py-2 px-2.5 text-right border-r border-[#C8D5E2]">
                      Total Milestone Commitment:
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-[#C8D5E2] text-blue-700 font-bold">
                      {fm.milestones.reduce((acc, cur) => acc + (cur.percentage || 0), 0)}%
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-[#C8D5E2] text-blue-700 font-bold">
                      {tender.currency || 'USD'}{' '}
                      {fm.milestones.reduce((acc, cur) => acc + (cur.amount || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-2.5 text-center text-[#64748B]">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* SaaS & Recurring Revenue Section */}
          {fm.subscriptionModel &&
            (fm.subscriptionModel.calculatedTcv > 0 || fm.subscriptionModel.annualBaseFee > 0) && (
              <div className="mb-4 bg-emerald-50/50 border border-emerald-200 rounded p-3 text-xs text-[#1E293B]">
                <div className="font-bold text-emerald-800 mb-1.5 flex items-center justify-between">
                  <span>SaaS & Recurring Revenue Model</span>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    TCV: {tender.currency || 'USD'}{' '}
                    {(fm.subscriptionModel.calculatedTcv || 0).toLocaleString()} | ACV:{' '}
                    {tender.currency || 'USD'}{' '}
                    {(fm.subscriptionModel.calculatedAcv || 0).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    Billing Frequency:{' '}
                    <span className="font-semibold capitalize">
                      {fm.subscriptionModel.billingFrequency?.toLowerCase() || 'Annual'}
                    </span>
                  </div>
                  <div>
                    Contract Duration:{' '}
                    <span className="font-semibold">{fm.subscriptionModel.durationYears || 1} Years</span>
                  </div>
                  <div>
                    Base Annual Fee:{' '}
                    <span className="font-semibold">
                      {tender.currency || 'USD'}{' '}
                      {(fm.subscriptionModel.annualBaseFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    Annual Escalation:{' '}
                    <span className="font-semibold">
                      {fm.subscriptionModel.annualEscalationRate || 0}% per annum
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Deductions, Retentions & Penalties */}
          {fm.penaltiesAndDeductions && (
            <div className="bg-[#F8FAFC] border border-[#C8D5E2] rounded p-3 text-xs">
              <div className="font-bold text-[#1A2B4A] mb-2">
                Penalties, Liquidated Damages & Statutory Deductions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border-r border-[#E2E8F0] pr-2 last:border-0">
                  <span className="font-semibold text-rose-700 block mb-0.5">Liquidated Damages (Delay)</span>
                  <p className="text-[#475569] leading-tight">
                    {fm.penaltiesAndDeductions.liquidatedDamages?.rate || 0.5}%{' '}
                    {fm.penaltiesAndDeductions.liquidatedDamages?.frequency === 'PER_DAY'
                      ? 'per day'
                      : 'per week'}{' '}
                    of delay. Max cap:{' '}
                    {fm.penaltiesAndDeductions.liquidatedDamages?.maxCapPercentage || 10}% of contract value.
                  </p>
                </div>
                <div className="border-r border-[#E2E8F0] pr-2 last:border-0">
                  <span className="font-semibold text-amber-700 block mb-0.5">Retention Money</span>
                  <p className="text-[#475569] leading-tight">
                    {fm.penaltiesAndDeductions.retentionMoney?.percentage || 5}% deducted from gross invoices.
                    Release:{' '}
                    {fm.penaltiesAndDeductions.retentionMoney?.releaseCondition ===
                    'FINAL_ACCEPTANCE_50_DLP_50'
                      ? '50% upon PAC, 50% upon FAC / DLP'
                      : fm.penaltiesAndDeductions.retentionMoney?.releaseCondition === 'BG_SUBSTITUTION'
                      ? 'Bank Guarantee Substitution'
                      : 'Upon DLP Expiry'}{' '}
                    ({fm.penaltiesAndDeductions.retentionMoney?.dlpMonths || 12}m DLP).
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Statutory Withholding</span>
                  <p className="text-[#475569] leading-tight">
                    TDS (Tax): {fm.penaltiesAndDeductions.taxDeductionAtSourcePercent || 0}%, VDS (VAT):{' '}
                    {fm.penaltiesAndDeductions.vatDeductionAtSourcePercent || 0}%. Deducted directly by client
                    finance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* KEY ELIGIBILITY / QUALIFICATION */}
      {s?.eligibility && Object.values(s.eligibility).some(Boolean) && (
        <Section title="Key Eligibility / Qualification">
          <BulletList items={Object.values(s.eligibility) as string[]} />
        </Section>
      )}

      {/* JV / CONSORTIUM */}
      {s?.jv && (
        <Section title="JV / Consortium">
          <BulletList
            items={[
              s.jv.participation ? `JV participation: ${s.jv.participation}` : null,
              s.jv.jvAgreement ? `JV agreement requirement: ${s.jv.jvAgreement}` : null,
              s.jv.memberRules ? `Liability: ${s.jv.memberRules}` : null,
              s.jv.leadMember ? `Lead partner: ${s.jv.leadMember}` : null,
              s.jv.localPartner ? `Local partner requirement: ${s.jv.localPartner}` : null,
            ]}
          />
        </Section>
      )}

      {/* DOCUMENTS REQUIRED IN SUBMISSION */}
      {(s?.submissionDocuments?.length ?? 0) > 0 && (
        <Section title="Documents Required in Submission">
          <BulletList items={s!.submissionDocuments} />
          <p className="mt-3 text-xs italic text-[#475569]">
            Financial Proposal Submission Rule: The Financial Proposal must be submitted separately through the Commercial Section of the UNDP Quantum system.
          </p>
        </Section>
      )}

      {/* CV / PERSONNEL REQUIREMENTS */}
      {(s?.personnel?.length ?? 0) > 0 && (
        <Section title="CV / Personnel Requirements">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm mt-2 border border-[#C8D5E2]">
              <thead>
                <tr style={{ backgroundColor: '#E8F0FB', color: '#1A2B4A' }}>
                  {['No.', 'Position', 'Minimum Qualification', 'Required Experience', 'Qty.'].map((h) => (
                    <th
                      key={h}
                      className="py-2.5 px-3 text-left font-semibold border-b border-r border-[#C8D5E2] text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s!.personnel!.map((p, i) => (
                  <tr key={i} className="border-b border-[#E8EDF2] last:border-0">
                    <td className="py-2.5 px-3 text-[#4B5563] border-r border-[#E8EDF2] text-xs">{i + 1}</td>
                    <td className="py-2.5 px-3 text-[#1A2B4A] border-r border-[#E8EDF2] text-xs font-medium">{p.position}</td>
                    <td className="py-2.5 px-3 text-[#4B5563] border-r border-[#E8EDF2] text-xs">{p.qualification || 'Not specifically stated'}</td>
                    <td className="py-2.5 px-3 text-[#4B5563] border-r border-[#E8EDF2] text-xs">{p.experience || 'Not specified'}</td>
                    <td className="py-2.5 px-3 text-[#4B5563] text-xs">{p.qty || 'Not specified'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* KEY PROCUREMENT & PROJECT MILESTONES SCHEDULE */}
      {(s?.dates || tender.submissionDeadline || tender.openingDate || tender.workStartDate || tender.productHandoverDate) && (
        <Section title="Key Procurement &amp; Project Milestones Schedule">
          <BulletList
            items={[
              s?.dates?.clarificationDeadline ? `Clarification deadline: ${s.dates.clarificationDeadline}` : null,
              tender.schedulePurchaseDeadline || s?.dates?.schedulePurchaseDeadline ? `Schedule / Form purchase deadline: ${tender.schedulePurchaseDeadline || s?.dates?.schedulePurchaseDeadline}` : null,
              tender.submissionDeadline
                ? `Submission cutoff deadline: ${fmt(tender.submissionDeadline)}${s?.submissionTime ? `, ${s.submissionTime}` : ''}`
                : null,
              tender.openingDate || s?.dates?.openingDate ? `Tender document / bid opening date: ${tender.openingDate || s?.dates?.openingDate}` : null,
              tender.contractSigningDate || s?.dates?.contractSigningDate ? `Contract signing date: ${tender.contractSigningDate || s?.dates?.contractSigningDate}` : null,
              tender.workStartDate || s?.dates?.contractStart ? `Work / project commencement date: ${tender.workStartDate || s?.dates?.contractStart}` : null,
              tender.possiblePeriod || s?.commercial?.contractPeriod ? `Execution duration / possible period: ${tender.possiblePeriod || s?.commercial?.contractPeriod}` : null,
              tender.productHandoverDate || s?.dates?.productHandoverDate ? `Product / system handover date: ${tender.productHandoverDate || s?.dates?.productHandoverDate}` : null,
              tender.maintenancePeriod || s?.commercial?.maintenancePeriod ? `Support & maintenance / warranty period: ${tender.maintenancePeriod || s?.commercial?.maintenancePeriod}` : null,
            ]}
          />
        </Section>
      )}

      {/* KEY RISKS / IMPORTANT POINTS */}
      {(s?.risks?.length ?? 0) > 0 && (
        <Section title="Key Risks / Important Points">
          <BulletList
            items={s!.risks!.map((r) => `[${r.type}] ${r.text}`)}
          />
        </Section>
      )}

      {/* IMPORTANT CLAUSES & DOCUMENT REFERENCES */}
      {(tender.importantClauses?.length ?? 0) > 0 && (
        <Section title="Important Clauses &amp; Document References">
          <div className="space-y-3">
            {tender.importantClauses!.map((clause, idx) => (
              <div
                key={clause.id || idx}
                className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#0F172A] text-sm">
                    {clause.clause_title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      clause.criticality === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : clause.criticality === 'HIGH'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {clause.criticality}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-mono">
                  <span>📄 {clause.doc_file_name || 'Tender Dossier'}</span>
                  <span>•</span>
                  <span>Ref: {clause.doc_reference}</span>
                  {clause.page_number && (
                    <>
                      <span>•</span>
                      <span>{clause.page_number}</span>
                    </>
                  )}
                </div>

                {clause.clause_text && (
                  <p className="text-[#334155] italic border-l-2 border-[#94A3B8] pl-2.5 py-0.5">
                    “{clause.clause_text}”
                  </p>
                )}

                {clause.implication && (
                  <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-900 rounded p-1.5">
                    <span className="font-bold">Strategic Compliance Action: </span>
                    <span>{clause.implication}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* IMPORTANT FOR MANAGEMENT */}
      {(s?.managementHighlights?.length ?? 0) > 0 && (
        <Section title="Important for Management">
          <BulletList items={s!.managementHighlights} />
        </Section>
      )}

      {/* NOTES */}
      {s?.notes && (
        <Section title="Notes">
          <p className="text-sm text-[#2D3A4A] leading-relaxed">{s.notes}</p>
        </Section>
      )}

      {/* Document Footer */}
      <div
        className="mt-10 pt-4 flex items-center justify-between text-[11px] border-t border-[#C8D5E2] text-[#9CA3AF]"
      >
        <span>Tender Summary | {displayId}</span>
        <span>{displayTitle}</span>
      </div>
    </div>
  );
};
