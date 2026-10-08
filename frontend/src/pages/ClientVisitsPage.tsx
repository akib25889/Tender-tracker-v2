import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Building2,
  MapPin,
  Video,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ExternalLink,
  Edit2,
  Trash2,
  Phone,
  FileText,
  UserCheck,
  ListTodo,
  Briefcase,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ClientVisitModal } from '../components/modals/ClientVisitModal';
import {
  ClientVisit,
  VisitType,
  VisitStatus,
  VisitSentiment,
} from '../types/clientVisit';
import { API_BASE_URL } from '../utils/apiConfig';
import {
  useClientVisitsQuery,
  usePatchClientVisitStatusMutation,
} from '../hooks/useTenderQueries';
import { queryClient, queryKeys } from '../api/queryClient';

const STATUS_CONFIG: Record<
  VisitStatus,
  { label: string; badgeClass: string; borderClass: string; icon: any }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    badgeClass: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]',
    borderClass: 'border-l-blue-500',
    icon: Calendar,
  },
  CHECKED_IN: {
    label: 'Checked-In (Active)',
    badgeClass: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)] animate-pulse',
    borderClass: 'border-l-amber-500',
    icon: UserCheck,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]',
    borderClass: 'border-l-emerald-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-[var(--crit-soft)] text-[var(--crit)] border-[var(--crit-line)]',
    borderClass: 'border-l-rose-500',
    icon: AlertCircle,
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    badgeClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
    borderClass: 'border-l-purple-500',
    icon: Clock3,
  },
  NO_SHOW: {
    label: 'No Show',
    badgeClass: 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-strong)]',
    borderClass: 'border-l-slate-400',
    icon: AlertCircle,
  },
};

const FORMAT_LABELS: Record<VisitType, { label: string; icon: any }> = {
  IN_PERSON_OFFICE: { label: 'In-Person Office', icon: Building2 },
  CLIENT_SITE_VISIT: { label: 'Client Site Visit', icon: MapPin },
  VIRTUAL_CONFERENCE: { label: 'Virtual Conference', icon: Video },
  PRE_BID_MEETING: { label: 'Pre-Bid Meeting', icon: Briefcase },
  COURTESY_CALL: { label: 'Courtesy Call', icon: Users },
  COMMERCIAL_NEGOTIATION: { label: 'Commercial Negotiation', icon: CheckCircle2 },
  OTHER: { label: 'Other', icon: Layers },
};

const SENTIMENT_LABELS: Record<VisitSentiment, { label: string; color: string }> = {
  VERY_POSITIVE: { label: 'Very Positive', color: 'text-[var(--ok)]' },
  POSITIVE: { label: 'Positive', color: 'text-[var(--accent)]' },
  NEUTRAL: { label: 'Neutral', color: 'text-[var(--text-secondary)]' },
  CONCERNED: { label: 'Concerned', color: 'text-[var(--warn)]' },
  CRITICAL: { label: 'Critical Issues', color: 'text-[var(--crit)]' },
};

export const ClientVisitsPage: React.FC = () => {
  const { data: visits = [], isLoading, refetch } = useClientVisitsQuery();
  const patchStatusMutation = usePatchClientVisitStatusMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'TODAY' | 'COMPLETED' | 'PRE_BID' | 'VIRTUAL'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'SCHEDULE' | 'LOG_PAST' | 'EDIT'>('SCHEDULE');
  const [selectedVisit, setSelectedVisit] = useState<ClientVisit | null>(null);

  // Fast Status Patch
  const handlePatchStatus = async (visitId: string, newStatus: VisitStatus) => {
    let actualCheckIn: string | undefined;
    let actualCheckOut: string | undefined;
    if (newStatus === 'CHECKED_IN') {
      actualCheckIn = new Date().toISOString().slice(0, 16);
    } else if (newStatus === 'COMPLETED') {
      actualCheckOut = new Date().toISOString().slice(0, 16);
    }

    try {
      await patchStatusMutation.mutateAsync({
        visitId,
        status: newStatus,
        actualCheckIn,
        actualCheckOut,
      });
    } catch (err) {
      console.error('Failed to patch status:', err);
    }
  };

  // Toggle Action Item Checkbox
  const handleToggleActionItem = async (visit: ClientVisit, itemIndex: number) => {
    if (!visit.action_items) return;
    const updatedItems = [...visit.action_items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      is_done: !updatedItems[itemIndex].is_done,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/client-visits/${visit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visit,
          action_items: updatedItems,
        }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: queryKeys.clientVisits.all });
      }
    } catch (err) {
      console.error('Failed to update action item:', err);
    }
  };

  // Delete Visit
  const handleDeleteVisit = async (visitId: string) => {
    if (!window.confirm('Are you sure you want to delete this visitor / meeting record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/client-visits/${visitId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: queryKeys.clientVisits.all });
      }
    } catch (err) {
      console.error('Failed to delete visit:', err);
    }
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const upcoming = visits.filter(
      (v) => v.status === 'SCHEDULED' || v.status === 'RESCHEDULED'
    ).length;
    const today = visits.filter(
      (v) => v.scheduled_start.startsWith(todayStr) || v.status === 'CHECKED_IN'
    ).length;
    const completed = visits.filter((v) => v.status === 'COMPLETED').length;
    
    let openActions = 0;
    visits.forEach((v) => {
      if (v.action_items) {
        openActions += v.action_items.filter((a) => !a.is_done).length;
      }
    });

    return { upcoming, today, completed, openActions };
  }, [visits]);

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return visits.filter((v) => {
      // Tab filter
      if (activeTab === 'UPCOMING' && v.status !== 'SCHEDULED' && v.status !== 'RESCHEDULED') return false;
      if (activeTab === 'TODAY' && !v.scheduled_start.startsWith(todayStr) && v.status !== 'CHECKED_IN') return false;
      if (activeTab === 'COMPLETED' && v.status !== 'COMPLETED') return false;
      if (activeTab === 'PRE_BID' && v.visit_type !== 'PRE_BID_MEETING') return false;
      if (activeTab === 'VIRTUAL' && v.visit_type !== 'VIRTUAL_CONFERENCE') return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(q);
        const matchesOrg = v.client_organization.toLowerCase().includes(q);
        const matchesVisitor = v.visitor_name.toLowerCase().includes(q);
        const matchesHost = (v.internal_host_name || '').toLowerCase().includes(q);
        const matchesTender = (v.tender_id || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesVisitor && !matchesHost && !matchesTender) {
          return false;
        }
      }

      return true;
    });
  }, [visits, activeTab, searchQuery]);

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Client Visitors &amp; Meeting Hub
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Centralized registry for client stakeholder visits, pre-bid briefing sessions, and strategic meeting minutes
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedVisit(null);
              setModalMode('LOG_PAST');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Log Completed Visit / MoM</span>
          </button>

          <button
            onClick={() => {
              setSelectedVisit(null);
              setModalMode('SCHEDULE');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--accent-on)] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Upcoming Meetings
              </span>
              <div className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                {metrics.upcoming}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--accent)] font-medium">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Scheduled &amp; Confirmed</span>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Today&apos;s Visits &amp; Check-Ins
              </span>
              <div className="font-display text-2xl font-bold text-[var(--warn)] mt-1">
                {metrics.today}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--warn-soft)] text-[var(--warn)] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--warn)] font-medium">
            <span>Live reception check-ins</span>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Completed Engagements
              </span>
              <div className="font-display text-2xl font-bold text-[var(--ok)] mt-1">
                {metrics.completed}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--ok)] font-medium">
            <span>MoM &amp; Notes Logged</span>
          </div>
        </Card>

        <Card className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Pending Action Items
              </span>
              <div className="font-display text-2xl font-bold text-[var(--text-secondary)] mt-1">
                {metrics.openActions}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] flex items-center justify-center">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium">
            <span>Follow-up deliverables</span>
          </div>
        </Card>
      </div>

      {/* Control Bar: Search, Category Filters, & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-default)] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by client, visitor, host, subject, or tender ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'TODAY', label: 'Today / Active' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'PRE_BID', label: 'Pre-Bid Meetings' },
            { id: 'VIRTUAL', label: 'Virtual' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
 activeTab === tab.id
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-default)] self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('CARDS')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
 viewMode === 'CARDS'
 ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Card / Timeline View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
 viewMode === 'TABLE'
 ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Detailed Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-[var(--text-muted)] text-sm animate-pulse">
          Loading client visitor records...
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)]">
          <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="font-bold text-[var(--text-primary)] text-sm">
            No client visits match your criteria
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            Schedule upcoming stakeholder briefings or log walk-in visitor minutes to start building your client engagement timeline.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => {
                setSelectedVisit(null);
                setModalMode('SCHEDULE');
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--accent-on)] rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Schedule First Visit
            </button>
          </div>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Timeline / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisits.map((visit) => {
            const statusInfo = STATUS_CONFIG[visit.status || 'SCHEDULED'];
            const formatInfo = FORMAT_LABELS[visit.visit_type || 'IN_PERSON_OFFICE'];
            const FormatIcon = formatInfo.icon;
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={visit.id}
                className={`p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xs border-l-4 ${statusInfo.borderClass} flex flex-col justify-between hover:shadow-md transition-shadow relative`}
              >
                {/* Card Top: Title & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                          <FormatIcon className="w-3 h-3 text-[var(--text-secondary)]" />
                          <span>{formatInfo.label}</span>
                        </span>
                        {visit.sentiment_outcome && (
                          <span className={`text-[10px] font-semibold ${SENTIMENT_LABELS[visit.sentiment_outcome]?.color}`}>
                            • {SENTIMENT_LABELS[visit.sentiment_outcome]?.label}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-sm text-[var(--text-primary)] leading-snug">
                        {visit.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{visit.client_organization}</span>
                        {visit.tender_id && (
                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            ({visit.tender_id})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Edit / Delete Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedVisit(visit);
                          setModalMode('EDIT');
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--crit)] hover:bg-[var(--crit-soft)] rounded-lg transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Logistics Info */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-default)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="font-mono text-[11px]">
                        {formatDateTime(visit.scheduled_start)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {visit.meeting_link ? (
                        <a
                          href={visit.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[var(--accent)] font-semibold hover:underline truncate"
                        >
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Join Video Conference</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                          <span className="truncate">{visit.location_or_room || 'Main Boardroom'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visitor & Host Profile */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Primary Visitor
                      </span>
                      <div className="font-semibold text-[var(--text-primary)] mt-0.5">
                        {visit.visitor_name}
                      </div>
                      {visit.visitor_designation && (
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {visit.visitor_designation}
                        </div>
                      )}
                      {(visit.visitor_phone || visit.visitor_email) && (
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)]">
                          {visit.visitor_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {visit.visitor_phone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Internal Host
                      </span>
                      <div className="font-semibold text-[var(--text-primary)] mt-0.5">
                        {visit.internal_host_name || 'Assigned Host'}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {visit.internal_host_role || 'Staff'}
                      </div>
                    </div>
                  </div>

                  {/* Accompanying Delegation (if any) */}
                  {visit.accompanying_persons && visit.accompanying_persons.length > 0 && (
                    <div className="mt-2.5 text-[11px] text-[var(--text-secondary)] bg-[var(--bg-subtle)]/70 px-2.5 py-1.5 rounded-lg">
                      <span className="font-semibold text-[var(--text-primary)]">
                        Delegation ({visit.accompanying_persons.length}):{' '}
                      </span>
                      {visit.accompanying_persons.map((p) => p.name).join(', ')}
                    </div>
                  )}

                  {/* Agenda / Discussion Notes */}
                  {visit.agenda && (
                    <div className="mt-2.5 text-xs text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">Agenda: </span>
                      <span className="line-clamp-2">{visit.agenda}</span>
                    </div>
                  )}

                  {visit.discussion_notes && (
                    <div className="mt-2 text-xs bg-[var(--accent-soft)]/50 p-2.5 rounded-xl border border-[var(--accent-line)] text-[var(--text-primary)]">
                      <div className="text-[10px] uppercase font-bold text-[var(--accent)] mb-1">
                        Meeting Minutes / MoM
                      </div>
                      <p className="line-clamp-3 text-xs leading-relaxed">{visit.discussion_notes}</p>
                    </div>
                  )}

                  {/* Action Items List */}
                  {visit.action_items && visit.action_items.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        Action Items ({visit.action_items.filter((a) => a.is_done).length}/{visit.action_items.length})
                      </div>
                      <div className="space-y-1">
                        {visit.action_items.map((item, idx) => (
                          <label
                            key={idx}
                            className="flex items-center gap-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] p-1 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.is_done}
                              onChange={() => handleToggleActionItem(visit, idx)}
                              className="rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
                            />
                            <span className={item.is_done ? 'line-through text-[var(--text-muted)]' : 'font-medium'}>
                              {item.task}
                            </span>
                            {item.deadline && (
                              <span className="ml-auto text-[10px] font-mono text-[var(--text-muted)]">
                                {item.deadline}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Status Transitions & Triggers */}
                <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[var(--text-muted)]">
                    ID: <span className="font-mono">{visit.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {visit.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handlePatchStatus(visit.id, 'CHECKED_IN')}
                        className="flex items-center gap-1 px-3 py-1 bg-[var(--warn)] hover:bg-[var(--warn)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reception Check-In</span>
                      </button>
                    )}

                    {(visit.status === 'SCHEDULED' || visit.status === 'CHECKED_IN') && (
                      <button
                        onClick={() => {
                          setSelectedVisit(visit);
                          setModalMode('LOG_PAST');
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[var(--ok)] hover:bg-[var(--ok)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete &amp; MoM</span>
                      </button>
                    )}

                    {visit.status === 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setSelectedVisit(visit);
                          setModalMode('EDIT');
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Edit Minutes</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border-default)]">
                <tr>
                  <th className="py-3 px-4">Status &amp; Format</th>
                  <th className="py-3 px-4">Meeting Title &amp; Client</th>
                  <th className="py-3 px-4">Visitor Details</th>
                  <th className="py-3 px-4">Internal Host</th>
                  <th className="py-3 px-4">Date &amp; Location</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] text-[var(--text-primary)]">
                {filteredVisits.map((visit) => {
                  const statusInfo = STATUS_CONFIG[visit.status || 'SCHEDULED'];
                  const formatInfo = FORMAT_LABELS[visit.visit_type || 'IN_PERSON_OFFICE'];

                  return (
                    <tr key={visit.id} className="hover:bg-[var(--bg-subtle)]/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {formatInfo.label}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-[var(--text-primary)] leading-tight">
                          {visit.title}
                        </div>
                        <div className="text-[var(--accent)] font-medium text-[11px] mt-0.5">
                          {visit.client_organization}
                        </div>
                        {visit.tender_id && (
                          <div className="text-[10px] font-mono text-[var(--text-muted)]">
                            Tender: {visit.tender_id}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {visit.visitor_name}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {visit.visitor_designation || 'Visitor'}
                        </div>
                        {visit.visitor_email && (
                          <div className="text-[10px] text-[var(--text-muted)]">{visit.visitor_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--text-primary)]">
                          {visit.internal_host_name || 'Assigned Host'}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {visit.internal_host_role || 'Staff'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px]">
                          {formatDateTime(visit.scheduled_start)}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate max-w-[150px]">
                          {visit.meeting_link ? 'Virtual Conference' : visit.location_or_room || 'Main Boardroom'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {visit.sentiment_outcome ? (
                          <span className={`font-semibold text-[11px] ${SENTIMENT_LABELS[visit.sentiment_outcome]?.color}`}>
                            {SENTIMENT_LABELS[visit.sentiment_outcome]?.label}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {visit.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handlePatchStatus(visit.id, 'CHECKED_IN')}
                              className="px-2 py-1 bg-[var(--warn)] hover:bg-[var(--warn)] text-[var(--accent-on)] rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedVisit(visit);
                              setModalMode('EDIT');
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVisit(visit.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--crit)] hover:bg-[var(--crit-soft)] rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client Visit Modal */}
      <ClientVisitModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialVisit={selectedVisit}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.clientVisits.all });
        }}
      />
    </div>
  );
};
