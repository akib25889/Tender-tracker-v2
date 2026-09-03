import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { ChevronRight } from 'lucide-react';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

export const CalendarPage: React.FC = () => {
  const { tenders, formatCurrency } = useTenders();
  const [filterRange, setFilterRange] = useState<'ALL' | '7_DAYS' | '14_DAYS'>('ALL');

  const filteredTenders = tenders
    .filter((t) => {
      if (filterRange === '7_DAYS') return t.daysRemaining <= 7;
      if (filterRange === '14_DAYS') return t.daysRemaining <= 14;
      return true;
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Schedule</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Deadlines &amp; Pre-Bid Cutoffs</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Procurement Submission Calendar
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Strict statutory cutoff dates, clarification windows, and final portal lock timestamps.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-white border border-[#E2E8F0] rounded-lg text-xs shadow-sm">
          <button
            onClick={() => setFilterRange('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterRange === 'ALL' ? 'bg-[#0F172A] text-white font-semibold' : 'text-[#64748B]'
            }`}
          >
            All Deadlines ({tenders.length})
          </button>
          <button
            onClick={() => setFilterRange('7_DAYS')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterRange === '7_DAYS' ? 'bg-[#0F172A] text-white font-semibold' : 'text-[#64748B]'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setFilterRange('14_DAYS')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterRange === '14_DAYS' ? 'bg-[#0F172A] text-white font-semibold' : 'text-[#64748B]'
            }`}
          >
            Next 14 Days
          </button>
        </div>
      </div>

      {/* Deadlines Timeline Table */}
      <Card
        title="Chronological Submission Deadlines"
        subtitle="Ordered by closest submission cutoff"
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {filteredTenders.map((tender) => {
            const dateObj = new Date(tender.submissionDeadline);
            const timeStr = dateObj.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={tender.id}
                className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 text-center p-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] shrink-0">
                    <span className="font-mono text-xs font-bold text-[#DC2626] block uppercase">
                      {dateObj.toLocaleString('en-GB', { month: 'short' })}
                    </span>
                    <span className="font-mono text-lg font-black text-[#0F172A] block leading-none mt-0.5">
                      {dateObj.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F172A]">
                        {tender.id}
                      </span>
                      <StatusBadge stage={tender.stage} />
                      <UrgencyBadge
                        daysRemaining={tender.daysRemaining}
                        hoursRemaining={tender.hoursRemaining}
                      />
                    </div>
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="font-semibold text-xs text-[#0F172A] hover:text-[#2563EB] transition-colors block"
                    >
                      {tender.title}
                    </Link>
                    <div className="text-[11px] text-[#64748B] flex items-center gap-2">
                      <span>{tender.organization}</span>
                      <span>•</span>
                      <span>{tender.country}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {formatCurrency(tender.estimatedValue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#0F172A] block">
                      {timeStr} GMT
                    </span>
                    <span className="text-[10px] text-[#64748B]">Portal Lock Window</span>
                  </div>

                  <Link
                    to={`/tenders/${tender.id}`}
                    className="p-2 text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
