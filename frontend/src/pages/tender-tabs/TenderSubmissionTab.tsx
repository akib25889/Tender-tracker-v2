import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export const TenderSubmissionTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders, submitTenderProof } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [portalRef, setPortalRef] = useState(
    tender?.submissionProof?.portalReference || 'UNGM-SUB-9941'
  );
  const [submitted, setSubmitted] = useState(tender?.stage === 'SUBMITTED');

  if (!tender) return null;

  const handleSealSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    submitTenderProof(tender.id, portalRef);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Tender Submission &amp; Result Ledger"
        subtitle="Cryptographic proof of upload, e-GP portal receipt capture, and lock timestamping"
      >
        <div className="p-5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-xs text-[var(--text-primary)]">
              Official Procurement Portal Endpoint: UNGM / e-Tendering Network
            </span>
            {submitted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[var(--ok)] bg-[var(--ok-soft)] px-2.5 py-1 rounded border border-[var(--ok-line)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SEALED &amp; SUBMITTED
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[var(--warn)] font-bold bg-[var(--warn-soft)] px-2.5 py-1 rounded border border-[var(--warn-line)]">
                SUBMISSION WINDOW OPEN
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[var(--bg-surface)] rounded border border-[var(--border-default)]">
              <span className="text-[11px] text-[var(--text-secondary)] block">Portal Reference ID</span>
              <span className="font-mono font-bold text-[var(--text-primary)] text-sm">
                {portalRef}
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] rounded border border-[var(--border-default)]">
              <span className="text-[11px] text-[var(--text-secondary)] block">Submission Deadline Cutoff</span>
              <span className="font-mono font-bold text-[var(--crit)] text-sm">
                {new Date(tender.submissionDeadline).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="p-3 bg-[var(--bg-surface)] rounded border border-[var(--border-default)]">
              <span className="text-[11px] text-[var(--text-secondary)] block">Authorized Operator</span>
              <span className="font-medium text-[var(--text-primary)] text-sm">
                Sarah Jenkins (Director)
              </span>
            </div>
          </div>

          {/* Past Project Experience Credentials Dossier for Submission */}
          <div className="pt-4 border-t border-[var(--border-default)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                  Project Experience &amp; Performance Credentials (Work Orders &amp; Certificates)
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Statutory past project qualifications required for evaluation and post-qualification audits
                </span>
              </div>
              <a
                href="/documents?tab=credentials"
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Manage Company Master Projects →
              </a>
            </div>

            {/* List attached credential documents */}
            {tender.documents.filter(
              (d) =>
                d.name.toLowerCase().includes('work order') ||
                d.name.toLowerCase().includes('completion certificate') ||
                d.name.toLowerCase().includes('credential dossier') ||
                d.folder.toLowerCase().includes('statutory') ||
                d.folder.toLowerCase().includes('jv')
            ).length === 0 ? (
              <div className="p-3 bg-[var(--bg-surface)] rounded-lg border border-dashed border-[var(--border-strong)] text-center text-xs text-[var(--text-secondary)]">
                No company project credentials or completion certificates attached yet. You can attach past experience proofs from the{' '}
                <a href="/documents?tab=credentials" className="text-[var(--accent)] font-semibold underline">
                  Company Project Credentials Library
                </a>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tender.documents
                  .filter(
                    (d) =>
                      d.name.toLowerCase().includes('work order') ||
                      d.name.toLowerCase().includes('completion certificate') ||
                      d.name.toLowerCase().includes('credential dossier') ||
                      d.folder.toLowerCase().includes('statutory') ||
                      d.folder.toLowerCase().includes('jv')
                  )
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-[var(--text-primary)] block truncate">{doc.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">{doc.companyName || 'PrimeTech Ltd'}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span className="font-mono">{doc.folder}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)] shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Attached
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {!submitted ? (
            <form onSubmit={handleSealSubmission} className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Confirm Portal Electronic Submission Confirmation ID:
                </label>
                <input
                  type="text"
                  required
                  value={portalRef}
                  onChange={(e) => setPortalRef(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs font-mono font-bold text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] text-xs font-semibold rounded-lg hover:bg-[var(--accent-hover)] shadow-sm transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock &amp; Seal Formal Submission</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-[var(--ok-soft)] rounded-lg border border-[var(--ok-line)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--ok)] font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Receipt Cryptographically Sealed</span>
              </div>
              <p className="text-xs text-[var(--ok)]">
                Submission timestamp logged. All workspace documents locked to preserve immutable statutory integrity for the post-bid opening debrief.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
