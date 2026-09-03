import React from 'react';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const TenderReviewTab: React.FC = () => {
  const reviews = [
    {
      tier: 'Tier 1: Technical & Scope Architecture Sign-Off',
      reviewer: 'Dr. Marcus Vance (Solutions Lead)',
      status: 'APPROVED',
      date: 'Sep 02, 2026',
      comments: 'All 14 technical clauses compliant. High-availability architecture validated against Tier-4 specifications.',
    },
    {
      tier: 'Tier 2: Financial Margin & Pricing Sign-Off',
      reviewer: 'Tariq Al-Mansoor (Finance Lead)',
      status: 'APPROVED',
      date: 'Sep 03, 2026',
      comments: 'Commercial BOQ verified. Model meets 28% gross target margin with inflation variance buffers.',
    },
    {
      tier: 'Tier 3: Legal & Regulatory Solvency Sign-Off',
      reviewer: 'Elena Rostova (Compliance Officer)',
      status: 'ACTION_REQUIRED',
      date: 'Pending',
      comments: 'Bank Guarantee original seal must be uploaded before executive sign-off can be granted.',
    },
    {
      tier: 'Tier 4: Executive Board Gatekeeper Sign-Off',
      reviewer: 'Sarah Jenkins (Bid Operations Director)',
      status: 'WAITING_PRECEDING',
      date: 'Pending',
      comments: 'Awaiting Tier 3 clearance before final portal authorization.',
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="4-Tier Review &amp; Approvals Sign-Off Workflow"
        subtitle="Sequential stage 5 sign-offs enforcing multi-department validation before final submission lock"
      >
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div
              key={r.tier}
              className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-xs text-[#0F172A]">
                    {r.tier}
                  </span>
                </div>
                <div>
                  {r.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      APPROVED
                    </span>
                  ) : r.status === 'ACTION_REQUIRED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                      <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                      BLOCKER: SEAL REQUIRED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      WAITING PRECEDING GATE
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-[#475569] pl-8">
                <p>{r.comments}</p>
                <div className="flex items-center gap-4 text-[11px] text-[#94A3B8] mt-1.5">
                  <span>Signer: {r.reviewer}</span>
                  <span>•</span>
                  <span>Timestamp: {r.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

