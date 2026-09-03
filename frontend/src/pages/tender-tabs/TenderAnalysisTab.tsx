import React from 'react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const TenderAnalysisTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Weighted Go/No-Go Decision Matrix */}
      <Card
        title="Weighted Go/No-Go Evaluation Matrix"
        subtitle="Formal stage 3 gatekeeper evaluation scoring strategic alignment, margins, and capability"
        headerAction={<StatusBadge decision="GO" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Technical Feasibility
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl font-bold text-[#16A34A]">9.2 / 10</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Full stack expertise available in-house</p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Financial Margin
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl font-bold text-[#2563EB]">8.5 / 10</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Target 28% gross margin model verified</p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Team Capacity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl font-bold text-[#D97706]">7.8 / 10</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Requires 1 senior DevOps allocation</p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              SLA &amp; Statutory Risk
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl font-bold text-[#16A34A]">9.0 / 10</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Standard liability terms negotiated</p>
          </div>
        </div>
      </Card>

      {/* Clause Extraction & Scope Breakdown */}
      <Card
        title="AI Clause Extraction & Scope Breakdown"
        subtitle="Automated extraction of RFP requirements, deliverables, and penalty clauses"
      >
        <div className="space-y-3">
          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Clause 3.1: High Availability &amp; Multi-Region Failover</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8]">MANDATORY</span>
            </div>
            <p className="text-xs text-[#475569]">
              The solution must support active-passive geographic redundancy with an RTO &lt; 15 minutes and RPO &lt; 1 minute across sovereign donor boundaries.
            </p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#0F172A]">Clause 5.4: Liquidated Damages &amp; Performance Bonds</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#B91C1C]">FINANCIAL RISK</span>
            </div>
            <p className="text-xs text-[#475569]">
              0.5% penalty per calendar day of delay up to a maximum cap of 10% of the total contract value. Unconditional bank guarantee required upon award.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

