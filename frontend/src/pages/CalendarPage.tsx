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
          badgeClass: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]',
          dotClass: 'bg-[var(--accent)]',
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
          badgeClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
          dotClass: 'bg-[var(--bg-muted)]',
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
          badgeClass: 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]',
          dotClass: 'bg-[var(--ok)]',
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
          badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]',
          dotClass: 'bg-[var(--warn)]',
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
          badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]',
          dotClass: 'bg-[var(--warn)]',
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
      <div className="divide-y divide-[var(--border-subtle)] -mx-5 -my-5">
        {events.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">
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
              className={`p-4 hover:bg-[var(--bg-subtle)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
 isToday ? 'bg-[var(--accent-soft)]/40' : ''
 }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                {/* Calendar Day Box */}
                <div className="w-14 text-center p-2 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] shrink-0">
                  <span className="font-mono text-xs font-bold text-[var(--text-secondary)] block uppercase">
                    {evt.date.toLocaleString('en-GB', { month: 'short' })}
                  </span>
                  <span className="font-mono text-lg font-black text-[var(--text-primary)] block leading-none mt-0.5">
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
                      <span className="px-2 py-0.5 bg-[var(--crit)] text-[var(--accent-on)] text-[10px] font-extrabold rounded-full animate-pulse">
                        HAPPENING TODAY
                      </span>
                    )}
                    {isTomorrow && (
                      <span className="px-2 py-0.5 bg-[var(--warn)] text-[var(--accent-on)] text-[10px] font-bold rounded-full">
                        TOMORROW (T-1)
                      </span>
                    )}
                    {!isToday && !isTomorrow && diffDays > 0 && (
                      <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                        In {diffDays} days
                      </span>
                    )}
                    {diffDays < 0 && (
                      <span className="text-[10px] text-[var(--text-muted)]">Passed</span>
                    )}

                    <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                      {evt.tender.id}
                    </span>
                    <StatusBadge stage={evt.tender.stage} />
                  </div>

                  <Link
                    to={`/tenders/${evt.tender.id}`}
                    className="font-semibold text-xs text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors block"
                  >
                    {evt.tender.title}
                  </Link>

                  <div className="text-[11px] text-[var(--text-secondary)] flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--text-secondary)]">{evt.label}</span>
                    <span>•</span>
                    <span>{evt.tender.organization}</span>
                    <span>•</span>
                    <span>{evt.tender.country}</span>
                    {evt.tender.estimatedValue > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {formatCurrency(evt.tender.estimatedValue)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)] block">
                    {evt.timeStr ? `${evt.timeStr} Portal Time` : evt.dateStr}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {evt.category === 'BID_OPENING'
                      ? 'TEC Unsealing Window'
                      : evt.category === 'SUBMISSION'
                      ? 'Portal Lock Window'
                      : 'Milestone Cutoff'}
                  </span>
                </div>
                <Link
                  to={`/tenders/${evt.tender.id}`}
                  className="p-2 text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-lg border border-[var(--accent-line)] transition-colors"
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
          className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[var(--text-primary)]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-[var(--text-muted)] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-px bg-[var(--bg-muted)] rounded-lg overflow-hidden border border-[var(--border-default)]">
        {cells.map((day, idx) => {
          const isToday = isCurrentMonth && day === todayDate;
          const eventsToday = day ? (dayMap[day] ?? []) : [];
          return (
            <div
              key={idx}
              className={`min-h-[90px] p-1.5 text-[11px] ${
 day ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-subtle)]'
 }`}
            >
              {day && (
                <>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold mb-1 ${
 isToday ? 'bg-[var(--accent)] text-[var(--accent-on)]' : 'text-[var(--text-secondary)]'
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
                      <div className="text-[9px] text-[var(--text-secondary)] font-mono pl-1">
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
      <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          <span>Submission Deadline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--bg-muted)]" />
          <span className="font-bold text-[var(--text-secondary)]">Tender Document / Bid Opening Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)]" />
          <span>Contract Signing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--warn)]" />
          <span>Work Start (W.O.)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--warn)]" />
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
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>Schedule</span>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">
              Tender Opening &amp; Lifecycle Milestones
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Procurement &amp; Milestones Calendar
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Strict statutory submission deadlines, tender document opening sessions, contract signing dates, and product handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode('TIMELINE')}
              title="Chronological timeline list"
              className={`p-1.5 rounded-md transition-colors ${
 viewMode === 'TIMELINE'
 ? 'bg-[var(--accent)] text-[var(--accent-on)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              title="Monthly calendar grid"
              className={`p-1.5 rounded-md transition-colors ${
 viewMode === 'GRID'
 ? 'bg-[var(--accent)] text-[var(--accent-on)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Range filter */}
          {viewMode === 'TIMELINE' && (
            <div className="flex items-center gap-0.5 p-0.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs shadow-sm">
              <button
                onClick={() => setFilterRange('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
 filterRange === 'ALL'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilterRange('7_DAYS')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
 filterRange === '7_DAYS'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                Next 7 Days
              </button>
              <button
                onClick={() => setFilterRange('30_DAYS')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
 filterRange === '30_DAYS'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                Next 30 Days
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] px-2">
          <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Filter Milestones:</span>
        </div>

        {([
          // A milestone type is a category, not a state, so the chip stays
          // neutral and a dot carries the distinction. Work start and handover
          // share a hue but differ by fill, which keeps this to one accent
          // plus two semantic colours instead of five filled pills.
          { id: 'ALL', label: `All milestones (${allMilestones.length})`, dot: null },
          { id: 'BID_OPENING', label: 'Bid opening', dot: 'tt-dot tt-dot-accent tt-dot-ring' },
          { id: 'SUBMISSION', label: 'Submission deadlines', dot: 'tt-dot tt-dot-accent' },
          { id: 'CONTRACT', label: 'Contract signing', dot: 'tt-dot tt-dot-ok' },
          { id: 'WORK_START', label: 'Work start (W.O.)', dot: 'tt-dot tt-dot-warn' },
          { id: 'HANDOVER', label: 'Handover', dot: 'tt-dot tt-dot-ring' },
        ] as const).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedCategory(f.id)}
            aria-pressed={selectedCategory === f.id}
            className="tt-chip tt-focus"
          >
            {f.dot && <i className={f.dot} aria-hidden="true" />}
            <span>{f.label}</span>
          </button>
        ))}
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
