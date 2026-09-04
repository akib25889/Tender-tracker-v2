import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { ChevronRight, ChevronLeft, List, Calendar } from 'lucide-react';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tender } from '../types/tender';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TimelineView({ tenders, formatCurrency }: { tenders: Tender[]; formatCurrency: (v: number) => string }) {
  return (
    <Card title="Chronological Submission Deadlines" subtitle="Ordered by closest submission cutoff">
      <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
        {tenders.length === 0 && (
          <div className="p-8 text-center text-xs text-[#94A3B8]">No deadlines match this filter.</div>
        )}
        {tenders.map((tender) => {
          const dateObj = new Date(tender.submissionDeadline);
          const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
                    <span className="font-mono text-xs font-bold text-[#0F172A]">{tender.id}</span>
                    <StatusBadge stage={tender.stage} />
                    <UrgencyBadge daysRemaining={tender.daysRemaining} hoursRemaining={tender.hoursRemaining} />
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
                    <span className="font-mono font-bold text-[#0F172A]">{formatCurrency(tender.estimatedValue)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[#0F172A] block">{timeStr} GMT</span>
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
  );
}

function CalendarGridView({ tenders }: { tenders: Tender[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Build map: day → tenders due on that day
  const dayMap: Record<number, Tender[]> = {};
  tenders.forEach((t) => {
    const d = new Date(t.submissionDeadline);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(t);
    }
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = today.getDate();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  return (
    <Card title={`${MONTHS[viewMonth]} ${viewYear}`} subtitle="Monthly submission calendar grid">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4 -mt-1">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[#0F172A]">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-[#94A3B8] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-px bg-[#E2E8F0] rounded-lg overflow-hidden border border-[#E2E8F0]">
        {cells.map((day, idx) => {
          const isToday = isCurrentMonth && day === todayDate;
          const eventsToday = day ? (dayMap[day] ?? []) : [];
          return (
            <div
              key={idx}
              className={`min-h-[80px] p-1.5 text-[11px] ${
                day ? 'bg-white' : 'bg-[#F8FAFC]'
              }`}
            >
              {day && (
                <>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold mb-1 ${
                      isToday
                        ? 'bg-[#0F172A] text-white'
                        : 'text-[#475569]'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {eventsToday.slice(0, 3).map((t) => (
                      <Link
                        key={t.id}
                        to={`/tenders/${t.id}`}
                        title={t.title}
                        className={`block truncate rounded px-1 py-0.5 font-mono text-[9px] font-semibold leading-tight ${
                          t.daysRemaining <= 2
                            ? 'bg-[#FEF2F2] text-[#DC2626]'
                            : t.daysRemaining <= 7
                            ? 'bg-[#FFF7ED] text-[#EA580C]'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                        }`}
                      >
                        {t.id}
                      </Link>
                    ))}
                    {eventsToday.length > 3 && (
                      <span className="text-[9px] text-[#94A3B8] pl-1">
                        +{eventsToday.length - 3} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[10px] text-[#64748B]">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FEF2F2] border border-[#FCA5A5]" />≤2 days</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#FFF7ED] border border-[#FCD34D]" />≤7 days</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#EFF6FF] border border-[#BFDBFE]" />&gt;7 days</div>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CalendarPage: React.FC = () => {
  const { tenders, formatCurrency } = useTenders();
  const [filterRange, setFilterRange] = useState<'ALL' | '7_DAYS' | '14_DAYS'>('ALL');
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'GRID'>('TIMELINE');

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

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode('TIMELINE')}
              title="Chronological list"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'TIMELINE' ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              title="Monthly grid"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'GRID' ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* Range filter (only useful in timeline) */}
          {viewMode === 'TIMELINE' && (
            <div className="flex items-center gap-0.5 p-0.5 bg-white border border-[#E2E8F0] rounded-lg text-xs shadow-sm">
              <button
                onClick={() => setFilterRange('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterRange === 'ALL' ? 'bg-[#0F172A] text-white font-semibold' : 'text-[#64748B]'
                }`}
              >
                All ({tenders.length})
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
          )}
        </div>
      </div>

      {viewMode === 'TIMELINE' ? (
        <TimelineView tenders={filteredTenders} formatCurrency={formatCurrency} />
      ) : (
        <CalendarGridView tenders={tenders} />
      )}
    </div>
  );
};
