import React from 'react';
import { Card } from '../../components/ui/Card';

export const TenderResultTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card
        title="Tender Award &amp; Post-Mortem Ledger"
        subtitle="Formal contract confirmation or structured loss taxonomy tracking"
      >
        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#0F172A]">
              Current Evaluation Status: Submission Pending
            </span>
            <span className="text-[11px] font-mono text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
              STAGE 6 AWAITING
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Once submitted, post-bid evaluation results (awarded amount, technical score, ranking, or competitor margin debrief) are recorded here to feed into the Win/Loss Analytics Suite.
          </p>
        </div>
      </Card>
    </div>
  );
};

