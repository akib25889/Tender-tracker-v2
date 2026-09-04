import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useTenders } from '../../context/TenderContext';
import { DecisionStatus } from '../../types/tender';
import { Check, ShieldCheck, PieChart, TrendingUp } from 'lucide-react';

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

  // SVG Radar Polygon Calculations (Center: 100, 100; Radius: 70)
  // Axes: 0: Technical (Top: -90°), 1: Financial (Right: 0°), 2: SLA (Bottom: 90°), 3: Team (Left: 180°)
  const cx = 100;
  const cy = 100;
  const maxR = 70;

  const getCoordinates = (score: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const r = (score / 10) * maxR;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const pTech = getCoordinates(technical, 0);
  const pFin = getCoordinates(financial, 90);
  const pSla = getCoordinates(sla, 180);
  const pTeam = getCoordinates(team, 270);

  const polygonPoints = `${pTech.x},${pTech.y} ${pFin.x},${pFin.y} ${pSla.x},${pSla.y} ${pTeam.x},${pTeam.y}`;

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
            <div className="mb-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <ShieldCheck className="w-4 h-4" />
              <span>Gate 3 Decision successfully recorded and stage updated!</span>
            </div>
          )}

          {/* Top Row: Visual Radar & Score Metrics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            {/* Visual Radar Chart */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] mb-1">
                <PieChart className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Multi-Criteria Radar Dimension</span>
              </div>
              <svg width="200" height="200" className="overflow-visible">
                {/* Background Web Circles */}
                {[0.25, 0.5, 0.75, 1.0].map((level) => (
                  <circle
                    key={level}
                    cx={cx}
                    cy={cy}
                    r={maxR * level}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeDasharray={level === 1.0 ? '' : '2,2'}
                  />
                ))}

                {/* Axes Lines */}
                <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="#CBD5E1" strokeWidth="1" />
                <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="#CBD5E1" strokeWidth="1" />

                {/* Filled Polygon */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(37, 99, 235, 0.2)"
                  stroke="#2563EB"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Dots on Vertices */}
                <circle cx={pTech.x} cy={pTech.y} r="4" fill="#16A34A" />
                <circle cx={pFin.x} cy={pFin.y} r="4" fill="#2563EB" />
                <circle cx={pSla.x} cy={pSla.y} r="4" fill="#16A34A" />
                <circle cx={pTeam.x} cy={pTeam.y} r="4" fill="#D97706" />

                {/* Axis Labels */}
                <text x={cx} y={cy - maxR - 8} textAnchor="middle" className="text-[9px] font-bold fill-[#16A34A]">
                  Tech ({technical})
                </text>
                <text x={cx + maxR + 10} y={cy + 3} textAnchor="start" className="text-[9px] font-bold fill-[#2563EB]">
                  Fin ({financial})
                </text>
                <text x={cx} y={cy + maxR + 14} textAnchor="middle" className="text-[9px] font-bold fill-[#16A34A]">
                  SLA ({sla})
                </text>
                <text x={cx - maxR - 10} y={cy + 3} textAnchor="end" className="text-[9px] font-bold fill-[#D97706]">
                  Team ({team})
                </text>
              </svg>
              <span className="text-[10px] text-[#94A3B8] mt-2">Geometric Balance Factor: {aggregateScore >= 7.0 ? 'Optimal' : 'Imbalanced'}</span>
            </div>

            {/* Composite Score Card & Probability of Win (pWin) */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase block">Composite Score</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-mono text-2xl font-black text-[#2563EB]">{aggregateScore}</span>
                    <span className="text-xs text-[#94A3B8]">/ 10</span>
                  </div>
                  <span className="text-[10px] text-[#16A34A] font-medium mt-0.5 block">Hurdle threshold: 7.0</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase block">Predicted Win Prob. (pWin)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-mono text-2xl font-black text-[#10B981]">
                      {Math.min(94, Math.round(aggregateScore * 10.2))}%
                    </span>
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">Based on historic donor awards</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase block">Bid Margin Target</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-mono text-2xl font-black text-[#0F172A]">
                      {Math.round(20 + financial * 1.2)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">Hurdle rate: 28%</span>
                </div>
              </div>

              {/* Gatekeeper Decision Recommendation */}
              <div className="p-3.5 bg-linear-to-r from-[#EFF6FF] to-[#F0FDF4] rounded-lg border border-[#BFDBFE] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-[#0F172A]">
                    Gatekeeper Decision Recommendation:
                  </span>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    {aggregateScore >= 8.5
                      ? 'UNCONDITIONAL GO: Excellent composite score exceeding all four viability pillars. Recommended to authorize formal technical and financial proposal drafting.'
                      : aggregateScore >= 7.0
                      ? 'CONDITIONAL GO: Viability satisfies minimum 7.0 threshold, but commercial risk or team workload requires mitigation in Section 4.'
                      : 'NO-GO RECOMMENDATION: Composite viability index falls below corporate threshold. High risk of commercial under-recovery or delivery SLA penalties.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Range Sliders */}
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
                className="w-full accent-[#16A34A] cursor-pointer"
              />
              <p className="text-[11px] text-[#64748B]">Scope of Work (SOW) methodology and stack compliance</p>
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
                className="w-full accent-[#2563EB] cursor-pointer"
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
                className="w-full accent-[#D97706] cursor-pointer"
              />
              <p className="text-[11px] text-[#64748B]">Key personnel availability and certifications</p>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  SLA &amp; Compliance (15%)
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
                className="w-full accent-[#16A34A] cursor-pointer"
              />
              <p className="text-[11px] text-[#64748B]">Liquidated damages and SLA covenants</p>
            </div>
          </div>

          {/* Decision Outcome Summary & Rationale Textarea */}
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#64748B]">Aggregate Gate Score:</span>
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
    </div>
  );
};
