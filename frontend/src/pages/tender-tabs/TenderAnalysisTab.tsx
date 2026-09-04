import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useTenders } from '../../context/TenderContext';
import { DecisionStatus } from '../../types/tender';
import { Check, ShieldCheck } from 'lucide-react';

export const TenderAnalysisTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders, setTenderDecision } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [technical, setTechnical] = useState(tender?.decisionMatrix?.technical || 9.2);
  const [financial, setFinancial] = useState(tender?.decisionMatrix?.financial || 8.5);
  const [team, setTeam] = useState(tender?.decisionMatrix?.team || 7.8);
  const [sla, setSla] = useState(tender?.decisionMatrix?.sla || 9.0);
  const [decision, setDecision] = useState<DecisionStatus>(tender?.decision || 'PENDING');
  const [rationale, setRationale] = useState(
    tender?.decisionMatrix?.rationale ||
      'Technical architecture verified. Commercial margin satisfies 28% internal hurdle rate.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!tender) return null;

  // Compute weighted aggregate score (35% tech, 30% fin, 20% team, 15% sla)
  const aggregateScore = Number(
    (technical * 0.35 + financial * 0.3 + team * 0.2 + sla * 0.15).toFixed(1)
  );

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    setTenderDecision(tender.id, decision, {
      technical,
      financial,
      team,
      sla,
      aggregateScore,
      rationale,
      decidedAt: new Date().toISOString().split('T')[0],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Go/No-Go Decision Matrix */}
      <form onSubmit={handleSaveDecision}>
        <Card
          title="Weighted Go/No-Go Evaluation Matrix"
          subtitle="Formal stage 3 gatekeeper evaluation scoring strategic alignment, margins, and capability"
          headerAction={
            <div className="flex items-center gap-2">
              <StatusBadge decision={tender.decision} />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Decision</span>
              </button>
            </div>
          }
        >
          {savedSuccess && (
            <div className="mb-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[#15803D] text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Gate 3 Decision successfully recorded and stage updated!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Technical Fit (35%)
                </span>
                <span className="font-mono text-sm font-bold text-[#16A34A]">
                  {technical} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={technical}
                onChange={(e) => setTechnical(Number(e.target.value))}
                className="w-full accent-[#16A34A]"
              />
              <p className="text-[11px] text-[#64748B]">SOW methodology and stack compliance</p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Financial Margin (30%)
                </span>
                <span className="font-mono text-sm font-bold text-[#2563EB]">
                  {financial} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={financial}
                onChange={(e) => setFinancial(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
              <p className="text-[11px] text-[#64748B]">Target 28% gross margin viability</p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Team Capacity (20%)
                </span>
                <span className="font-mono text-sm font-bold text-[#D97706]">
                  {team} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={team}
                onChange={(e) => setTeam(Number(e.target.value))}
                className="w-full accent-[#D97706]"
              />
              <p className="text-[11px] text-[#64748B]">Resource availability vs deadline</p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  SLA &amp; Risk (15%)
                </span>
                <span className="font-mono text-sm font-bold text-[#16A34A]">
                  {sla} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={sla}
                onChange={(e) => setSla(Number(e.target.value))}
                className="w-full accent-[#16A34A]"
              />
              <p className="text-[11px] text-[#64748B]">Liability cap and penalty terms</p>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#0F172A]">
                  Calculated Overall Viability Index:
                </span>
                <span className="font-mono text-lg font-bold text-[#2563EB]">
                  {aggregateScore} / 10
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0F172A]">Formal Outcome:</span>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as DecisionStatus)}
                  className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A]"
                >
                  <option value="GO">GO (Pass Gate 3)</option>
                  <option value="CONDITIONAL">CONDITIONAL (Revise Scope)</option>
                  <option value="NO_GO">NO-GO (Decline Bid)</option>
                  <option value="PENDING">DECISION PENDING</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Executive Decision Rationale:
              </label>
              <textarea
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </Card>
      </form>

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
