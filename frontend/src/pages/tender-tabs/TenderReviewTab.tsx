import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { CheckCircle2, ShieldAlert, PenTool, Lock } from 'lucide-react';
import { SignOffModal } from '../../components/modals/SignOffModal';

export const TenderReviewTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [activeSignOff, setActiveSignOff] = useState<{
    tierNumber: number;
    tierName: string;
  } | null>(null);

  if (!tender) return null;

  return (
    <div className="space-y-6">
      <Card
        title="4-Tier Review &amp; Approvals Sign-Off Workflow"
        subtitle="Sequential stage 5 sign-offs enforcing multi-department validation before final submission lock"
      >
        <div className="space-y-4">
          {(tender.reviews || []).map((r) => (
            <div
              key={r.tierNumber}
              className={`p-4 rounded-lg border transition-colors space-y-2 ${
                r.status === 'APPROVED'
                  ? 'bg-[#F0FDF4]/30 border-[#BBF7D0]'
                  : r.status === 'ACTION_REQUIRED'
                  ? 'bg-[#FEF2F2]/40 border-[#FECACA]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      r.status === 'APPROVED'
                        ? 'bg-[#16A34A] text-white'
                        : r.status === 'ACTION_REQUIRED'
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#64748B] text-white'
                    }`}
                  >
                    {r.tierNumber}
                  </span>
                  <span className="font-semibold text-xs text-[#0F172A]">
                    {r.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {r.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      APPROVED
                    </span>
                  ) : r.status === 'ACTION_REQUIRED' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                        <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                        ACTION REQUIRED
                      </span>
                      <button
                        onClick={() =>
                          setActiveSignOff({
                            tierNumber: r.tierNumber,
                            tierName: r.name,
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#16A34A] text-white text-[11px] font-semibold rounded hover:bg-[#15803D] transition-colors shadow-sm"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>Sign Off</span>
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3" />
                      LOCKED (WAITING PRECEDING)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-[#475569] pl-8">
                <p>{r.comments}</p>
                <div className="flex items-center gap-4 text-[11px] text-[#94A3B8] mt-1.5">
                  <span>Signer: {r.reviewer}</span>
                  <span>•</span>
                  <span>Timestamp: {r.date || 'Pending'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {activeSignOff && (
        <SignOffModal
          tenderId={tender.id}
          tierNumber={activeSignOff.tierNumber}
          tierName={activeSignOff.tierName}
          isOpen={true}
          onClose={() => setActiveSignOff(null)}
        />
      )}
    </div>
  );
};
