import React from 'react';
import { Tender } from '../../types/tender';

interface TenderSummaryDocumentProps {
  tender: Tender;
}

export const TenderSummaryDocument: React.FC<TenderSummaryDocumentProps> = ({ tender }) => {
  const s = tender.summary;
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
            <Row label="Published Date" value={s?.publishedDate || null} />
            <Row
              label="Last Date (Submission Deadline)"
              value={tender.submissionDeadline ? fmt(tender.submissionDeadline) : null}
            />
            <Row label="Submission Time" value={s?.submissionTime || null} />
            {tender.estimatedValue && tender.estimatedValue > 0 && (
              <Row label="Estimated Net Value" value={`$${tender.estimatedValue.toLocaleString()} USD`} />
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
            <SubSection title="Commercial Requirements">
              <BulletList
                items={[
                  s.commercial.tenderSecurity ? `Tender security: ${s.commercial.tenderSecurity}` : null,
                  s.commercial.tenderDocPrice ? `Tender document price: ${s.commercial.tenderDocPrice}` : null,
                  s.commercial.contractPeriod ? `Contract/service period: ${s.commercial.contractPeriod}` : null,
                  s.dates?.contractStart ? `Expected start date: ${s.dates.contractStart}.` : null,
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

      {/* IMPORTANT DATES */}
      {(s?.dates || tender.submissionDeadline) && (
        <Section title="Important Dates">
          <BulletList
            items={[
              s?.dates?.contractStart ? `Expected contract start date: ${s.dates.contractStart}` : null,
              s?.commercial?.contractPeriod ? `Contract duration: ${s.commercial.contractPeriod}` : null,
              tender.submissionDeadline
                ? `Submission deadline: ${fmt(tender.submissionDeadline)}${s?.submissionTime ? `, ${s.submissionTime}` : ''}`
                : null,
              s?.dates?.clarificationDeadline ? `Clarification deadline: ${s.dates.clarificationDeadline}` : null,
              s?.dates?.openingDate ? `Bid opening date: ${s.dates.openingDate}` : null,
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
