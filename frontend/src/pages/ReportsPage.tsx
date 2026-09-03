import React from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { TrendingUp, Award, DollarSign } from 'lucide-react';
import { ExportDropdown } from '../components/ui/ExportDropdown';

export const ReportsPage: React.FC = () => {
  const { tenders, formatCurrency } = useTenders();

  const totalValue = tenders.reduce((acc, t) => acc + t.estimatedValue, 0);
  const awardedBids = tenders.filter((t) => t.stage === 'AWARDED');
  const lostBids = tenders.filter((t) => t.stage === 'LOST');
  const evaluatedBids = awardedBids.length + lostBids.length;

  const winRate = evaluatedBids > 0 ? Math.round((awardedBids.length / evaluatedBids) * 100) : 24;

  // Breakdown by category
  const categories = Array.from(new Set(tenders.map((t) => t.category)));
  const categoryStats = categories.map((cat) => {
    const catTenders = tenders.filter((t) => t.category === cat);
    const catVal = catTenders.reduce((acc, t) => acc + t.estimatedValue, 0);
    const share = Math.round((catVal / totalValue) * 100) || 0;
    return { name: cat, count: catTenders.length, value: catVal, share };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Analytics</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Win/Loss Intelligence</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Procurement Reports &amp; Post-Mortem Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Quarterly conversion metrics, donor win rates, and structured loss root-cause telemetry.
          </p>
        </div>

        <ExportDropdown tenders={tenders} label="Export Executive Report" />
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Cumulative Win Rate
            </span>
            <span className="font-display text-2xl font-bold text-[#16A34A] mt-1 block">
              {winRate}%
            </span>
            <span className="text-[11px] text-[#64748B]">Benchmark target: 20%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Tracked Pipeline Total
            </span>
            <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
              {formatCurrency(totalValue)}
            </span>
            <span className="text-[11px] text-[#2563EB]">{tenders.length} active opportunities</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Avg Gross Target Margin
            </span>
            <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
              28.4%
            </span>
            <span className="text-[11px] text-[#16A34A]">Above 25% hurdle rate</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown by SOW Domain */}
      <Card
        title="Pipeline Distribution by Domain &amp; SOW Category"
        subtitle="Valuation and volume distribution across multilateral technical sectors"
      >
        <div className="space-y-4">
          {categoryStats.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0F172A]">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#64748B]">{cat.count} bids</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {formatCurrency(cat.value)} ({cat.share}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all"
                  style={{ width: `${cat.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
