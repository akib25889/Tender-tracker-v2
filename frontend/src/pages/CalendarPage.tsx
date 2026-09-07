import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import {
  ChevronRight,
  ChevronLeft,
  List,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react';
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

function parseSafeDate(dStr?: string): Date | null {
  if (!dStr) return null;
  const clean = dStr.trim();
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;
  const parts = clean.split('T')[0].split('-');
  if (parts.length === 3) {
    const parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export type MilestoneCategory =
  | 'SUBMISSION'
  | 'BID_OPENING'
  | 'CONTRACT'
  | 'WORK_START'
  | 'HANDOVER';

export interface MilestoneEvent {
  id: string;
  tender: Tender;
  category: MilestoneCategory;
  date: Date;
  dateStr: string;
  label: string;
  badgeLabel: string;
  badgeClass: string;
  dotClass: string;
  timeStr?: string;
}

function extractMilestones(tenders: Tender[]): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];

  tenders.forEach((t) => {
    // 1. Submission Deadline
    if (t.submissionDeadline) {
      const d = parseSafeDate(t.submissionDeadline);
      if (d) {
        events.push({
          id: `EVT-SUB-${t.id}`,
          tender: t,
          category: 'SUBMISSION',
          date: d,
          dateStr: t.submissionDeadline.split('T')[0],
          label: 'Bid Submission Cutoff',
          badgeLabel: 'Submission Due',
          badgeClass: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          dotClass: 'bg-[#2563EB]',
          timeStr: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    // 2. Tender Document / Bid Opening Day
    const openStr = t.openingDate || t.summary?.dates?.openingDate;
    if (openStr) {
      const d = parseSafeDate(openStr);
      if (d) {
        events.push({
          id: `EVT-OPN-${t.id}`,
          tender: t,
          category: 'BID_OPENING',
          date: d,
          dateStr: openStr.split('T')[0],
          label: 'Tender Document / Bid Opening Day',
          badgeLabel: 'Bid Opening',
          badgeClass: 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]',
          dotClass: 'bg-[#9333EA]',
        });
      }
    }

    // 3. Contract Signing Day
    const contractStr = t.contractSigningDate || t.summary?.dates?.contractSigningDate;
    if (contractStr) {
      const d = parseSafeDate(contractStr);
      if (d) {
        events.push({
          id: `EVT-CNT-${t.id}`,
          tender: t,
          category: 'CONTRACT',
          date: d,
          dateStr: contractStr.split('T')[0],
          label: 'Official Contract Signing',
          badgeLabel: 'Contract Signing',
          badgeClass: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
          dotClass: 'bg-[#16A34A]',
        });
      }
    }

    // 4. Work Start Day
    const workStr = t.workStartDate || t.summary?.dates?.contractStart;
    if (workStr) {
      const d = parseSafeDate(workStr);
      if (d) {
        events.push({
          id: `EVT-WRK-${t.id}`,
          tender: t,
          category: 'WORK_START',
          date: d,
          dateStr: workStr.split('T')[0],
          label: 'Work Commencement & Kickoff',
          badgeLabel: 'Work Start',
          badgeClass: 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]',
          dotClass: 'bg-[#EAB308]',
        });
      }
    }

    // 5. Product Handover Day
    const handStr = t.productHandoverDate || t.summary?.dates?.productHandoverDate;
    if (handStr) {
      const d = parseSafeDate(handStr);
      if (d) {
        events.push({
          id: `EVT-HND-${t.id}`,
          tender: t,
          category: 'HANDOVER',
          date: d,
          dateStr: handStr.split('T')[0],
          label: 'Final Product / System Handover',
          badgeLabel: 'Product Handover',
          badgeClass: 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]',
          dotClass: 'bg-[#EA580C]',
        });
      }
    }
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TimelineView({
  events,
  formatCurrency,
}: {
  events: MilestoneEvent[];
  formatCurrency: (v: number) => string;
}) {
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  return (
    <Card
      title="Chronological Milestones &amp; Deadlines Timeline"
      subtitle="Comprehensive schedule tracking Submission, Bid Opening, Contract Signing, Work Start, and Handover"
    >
      <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
        {events.length === 0 && (
          <div className="p-8 text-center text-xs text-[#94A3B8]">
            No milestone events match this filter.
          </div>
        )}
        {events.map((evt) => {
          const diffDays = Math.ceil(
            (evt.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          const isToday = evt.dateStr === todayDateStr;
          const isTomorrow = diffDays === 1;

          return (
            <div
              key={evt.id}
              className={`p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isToday ? 'bg-[#EFF6FF]/40' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                {/* Calendar Day Box */}
                <div className="w-14 text-center p-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] shrink-0">
                  <span className="font-mono text-xs font-bold text-[#64748B] block uppercase">
                    {evt.date.toLocaleString('en-GB', { month: 'short' })}
                  </span>
                  <span className="font-mono text-lg font-black text-[#0F172A] block leading-none mt-0.5">
                    {evt.date.getDate()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${evt.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${evt.dotClass}`} />
                      {evt.badgeLabel}
                    </span>

                    {isToday && (
                      <span className="px-2 py-0.5 bg-[#DC2626] text-white text-[10px] font-extrabold rounded-full animate-pulse">
                        HAPPENING TODAY
                      </span>
                    )}
                    {isTomorrow && (
                      <span className="px-2 py-0.5 bg-[#F59E0B] text-white text-[10px] font-bold rounded-full">
                        TOMORROW (T-1)
                      </span>
                    )}
                    {!isToday && !isTomorrow && diffDays > 0 && (
                      <span className="text-[11px] font-mono text-[#64748B]">
                        In {diffDays} days
                      </span>
                    )}
                    {diffDays < 0 && (
                      <span className="text-[10px] text-[#94A3B8]">Passed</span>
                    )}

                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {evt.tender.id}
                    </span>
                    <StatusBadge stage={evt.tender.stage} />
                  </div>

                  <Link
                    to={`/tenders/${evt.tender.id}`}
                    className="font-semibold text-xs text-[#0F172A] hover:text-[#2563EB] transition-colors block"
                  >
                    {evt.tender.title}
                  </Link>

                  <div className="text-[11px] text-[#64748B] flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#334155]">{evt.label}</span>
                    <span>•</span>
                    <span>{evt.tender.organization}</span>
                    <span>•</span>
                    <span>{evt.tender.country}</span>
                    {evt.tender.estimatedValue > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-bold text-[#0F172A]">
                          {formatCurrency(evt.tender.estimatedValue)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[#0F172A] block">
                    {evt.timeStr ? `${evt.timeStr} Portal Time` : evt.dateStr}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    {evt.category === 'BID_OPENING'
                      ? 'TEC Unsealing Window'
                      : evt.category === 'SUBMISSION'
                      ? 'Portal Lock Window'
                      : 'Milestone Cutoff'}
                  </span>
                </div>
                <Link
                  to={`/tenders/${evt.tender.id}`}
                  className="p-2 text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] transition-colors"
                  title="View Proposal Workspace"
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

function CalendarGridView({ events }: { events: MilestoneEvent[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // Build map: day → events occurring on that day
  const dayMap: Record<number, MilestoneEvent[]> = {};
  events.forEach((evt) => {
    if (
      evt.date.getFullYear() === viewYear &&
      evt.date.getMonth() === viewMonth
    ) {
      const day = evt.date.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(evt);
    }
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = today.getDate();
  const isCurrentMonth =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  return (
    <Card
      title={`${MONTHS[viewMonth]} ${viewYear}`}
      subtitle="Monthly procurement milestones schedule grid"
    >
      {/* Nav */}
      <div className="flex items-center justify-between mb-4 -mt-1">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[#0F172A]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-[#94A3B8] py-1"
          >
            {d}
          </div>
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
              className={`min-h-[90px] p-1.5 text-[11px] ${
                day ? 'bg-white' : 'bg-[#F8FAFC]'
              }`}
            >
              {day && (
                <>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold mb-1 ${
                      isToday ? 'bg-[#0F172A] text-white' : 'text-[#475569]'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="space-y-1">
                    {eventsToday.slice(0, 4).map((evt) => (
                      <Link
                        key={evt.id}
                        to={`/tenders/${evt.tender.id}`}
                        title={`${evt.badgeLabel}: ${evt.tender.title}`}
                        className={`block px-1.5 py-0.5 rounded text-[10px] font-bold border truncate transition-opacity hover:opacity-80 ${evt.badgeClass}`}
                      >
                        <span className="truncate">
                          {evt.badgeLabel === 'Bid Opening' ? '🟣 Open: ' : evt.badgeLabel === 'Submission Due' ? '🔵 Due: ' : evt.badgeLabel === 'Contract Signing' ? '🟢 Contract: ' : '🟠 '}
                          {evt.tender.id}
                        </span>
                      </Link>
                    ))}
                    {eventsToday.length > 4 && (
                      <div className="text-[9px] text-[#64748B] font-mono pl-1">
                        +{eventsToday.length - 4} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>Submission Deadline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" />
          <span className="font-bold text-[#7E22CE]">Tender Document / Bid Opening Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          <span>Contract Signing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
          <span>Work Start (W.O.)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
          <span>Product Handover</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CalendarPage: React.FC = () => {
  const { tenders, formatCurrency } = useTenders();
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | MilestoneCategory
  >('ALL');
  const [filterRange, setFilterRange] = useState<'ALL' | '7_DAYS' | '30_DAYS'>(
    'ALL'
  );
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'GRID'>('TIMELINE');

  const allMilestones = useMemo(() => extractMilestones(tenders), [tenders]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return allMilestones.filter((evt) => {
      // Category filter
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }
      // Range filter (only for future/approaching events)
      if (filterRange === '7_DAYS') {
        const diff = (evt.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= -1 && diff <= 7;
      }
      if (filterRange === '30_DAYS') {
        const diff = (evt.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= -1 && diff <= 30;
      }
      return true;
    });
  }, [allMilestones, selectedCategory, filterRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Schedule</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">
              Tender Opening &amp; Lifecycle Milestones
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Procurement &amp; Milestones Calendar
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Strict statutory submission deadlines, tender document opening sessions, contract signing dates, and product handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode('TIMELINE')}
              title="Chronological timeline list"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'TIMELINE'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              title="Monthly calendar grid"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'GRID'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Range filter */}
          {viewMode === 'TIMELINE' && (
            <div className="flex items-center gap-0.5 p-0.5 bg-white border border-[#E2E8F0] rounded-lg text-xs shadow-sm">
              <button
                onClick={() => setFilterRange('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterRange === 'ALL'
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'text-[#64748B]'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilterRange('7_DAYS')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterRange === '7_DAYS'
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'text-[#64748B]'
                }`}
              >
                Next 7 Days
              </button>
              <button
                onClick={() => setFilterRange('30_DAYS')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterRange === '30_DAYS'
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'text-[#64748B]'
                }`}
              >
                Next 30 Days
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#475569] px-2">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Filter Milestones:</span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          All Milestones ({allMilestones.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('BID_OPENING')}
          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
            selectedCategory === 'BID_OPENING'
              ? 'bg-[#9333EA] text-white border-[#9333EA] shadow-xs'
              : 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF] hover:bg-[#F3E8FF]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
          <span>Tender Document Opening Days</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('SUBMISSION')}
          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
            selectedCategory === 'SUBMISSION'
              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
              : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#DBEAFE]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span>Submission Deadlines</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('CONTRACT')}
          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
            selectedCategory === 'CONTRACT'
              ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
              : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span>Contract Signing Days</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('WORK_START')}
          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
            selectedCategory === 'WORK_START'
              ? 'bg-[#CA8A04] text-white border-[#CA8A04] shadow-xs'
              : 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A] hover:bg-[#FEF9C3]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
          <span>Work Start (W.O.)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('HANDOVER')}
          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
            selectedCategory === 'HANDOVER'
              ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
              : 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5] hover:bg-[#FFEDD5]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F97316]" />
          <span>Product Handovers</span>
        </button>
      </div>

      {/* Main View Render */}
      {viewMode === 'TIMELINE' ? (
        <TimelineView
          events={filteredEvents}
          formatCurrency={formatCurrency}
        />
      ) : (
        <CalendarGridView events={filteredEvents} />
      )}
    </div>
  );
};
