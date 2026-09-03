import React from 'react';
import { Card } from '../../components/ui/Card';
import { UploadCloud } from 'lucide-react';

export const TenderSubmissionTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card
        title="Tender Submission &amp; Result Ledger"
        subtitle="Cryptographic proof of upload, e-GP portal receipt capture, and lock timestamping"
      >
        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#0F172A]">
              Submission Portal Endpoint: UNGM / e-Tendering System
            </span>
            <span className="text-[11px] font-mono text-[#D97706] font-bold bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
              READY FOR FINAL SEAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Portal Reference</span>
              <span className="font-mono font-bold text-[#0F172A]">UNGM-SUB-9941</span>
            </div>
            <div className="p-3 bg-white rounded border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Submission Window Lock</span>
              <span className="font-mono font-bold text-[#DC2626]">Sep 06, 14:00 GMT</span>
            </div>
            <div className="p-3 bg-white rounded border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] block">Authorized Operator</span>
              <span className="font-medium text-[#0F172A]">Sarah Jenkins (Director)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] shadow-sm">
              <UploadCloud className="w-4 h-4" />
              <span>Capture &amp; Upload Portal Receipt</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

