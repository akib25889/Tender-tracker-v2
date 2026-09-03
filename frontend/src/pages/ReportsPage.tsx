import React from 'react';
import { Card } from '../components/ui/Card';
import { TrendingUp, Award, DollarSign } from 'lucide-react';
import { MOCK_PIPELINE_SUMMARY } from '../mock/tenders';

export const ReportsPage: React.FC = () => {
  const summary = MOCK_PIPELINE_SUMMARY;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>Intelligence</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">Win/Loss Analytics</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          Reports &amp; Win/Loss Analytics
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Data-driven bidding performance metrics, historical award ratios, and margin distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Win Rate
            </span>
            <Award className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#0F172A]">
              {summary.winRatePercent}%
            </span>
            <span className="text-xs text-[#16A34A] font-semibold">+3.4% YoY</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Based on 68 submitted proposals</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Average Bid Value
            </span>
            <DollarSign className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#0F172A]">
              $2.02M
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Weighted across 24 active bids</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Average Gross Margin
            </span>
            <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#0F172A]">
              27.8%
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Target benchmark is &gt; 25%</p>
        </Card>
      </div>
    </div>
  );
};

