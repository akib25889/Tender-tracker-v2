import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

const STATUS_CONFIG: Record<
  VisitStatus,
  { label: string; badgeClass: string; borderClass: string; icon: any }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    borderClass: 'border-l-blue-500',
    icon: Calendar,
  },
  CHECKED_IN: {
    label: 'Checked-In (Active)',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 animate-pulse',
    borderClass: 'border-l-amber-500',
    icon: UserCheck,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    borderClass: 'border-l-emerald-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    borderClass: 'border-l-rose-500',
    icon: AlertCircle,
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800',
    borderClass: 'border-l-purple-500',
    icon: Clock3,
  },
  NO_SHOW: {
    label: 'No Show',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
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
  VERY_POSITIVE: { label: 'Very Positive', color: 'text-emerald-600 dark:text-emerald-400' },
  POSITIVE: { label: 'Positive', color: 'text-blue-600 dark:text-blue-400' },
  NEUTRAL: { label: 'Neutral', color: 'text-slate-600 dark:text-slate-400' },
  CONCERNED: { label: 'Concerned', color: 'text-amber-600 dark:text-amber-400' },
  CRITICAL: { label: 'Critical Issues', color: 'text-rose-600 dark:text-rose-400' },
};

export const ClientVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'TODAY' | 'COMPLETED' | 'PRE_BID' | 'VIRTUAL'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'SCHEDULE' | 'LOG_PAST' | 'EDIT'>('SCHEDULE');
  const [selectedVisit, setSelectedVisit] = useState<ClientVisit | null>(null);

  // Load visits from API
  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/client-visits');
      if (res.ok) {
        const data = await res.json();
        setVisits(data);
      }
    } catch (err) {
      console.error('Failed to load client visits:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Fast Status Patch
  const handlePatchStatus = async (visitId: string, newStatus: VisitStatus) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'CHECKED_IN') {
        payload.actual_check_in = new Date().toISOString().slice(0, 16);
      } else if (newStatus === 'COMPLETED') {
        payload.actual_check_out = new Date().toISOString().slice(0, 16);
      }

      const res = await fetch(`/api/v1/client-visits/${visitId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchVisits();
      }
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
      const res = await fetch(`/api/v1/client-visits/${visit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visit,
          action_items: updatedItems,
        }),
      });

      if (res.ok) {
        setVisits((prev) =>
          prev.map((v) => (v.id === visit.id ? { ...v, action_items: updatedItems } : v))
        );
      }
    } catch (err) {
      console.error('Failed to update action item:', err);
    }
  };

  // Delete Visit
  const handleDeleteVisit = async (visitId: string) => {
    if (!window.confirm('Are you sure you want to delete this visitor / meeting record?')) return;
    try {
      const res = await fetch(`/api/v1/client-visits/${visitId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setVisits((prev) => prev.filter((v) => v.id !== visitId));
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
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Client Visitors &amp; Meeting Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Log Completed Visit / MoM</span>
          </button>

          <button
            onClick={() => {
              setSelectedVisit(null);
              setModalMode('SCHEDULE');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Upcoming Meetings
              </span>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics.upcoming}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Scheduled &amp; Confirmed</span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Today&apos;s Visits &amp; Check-Ins
              </span>
              <div className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {metrics.today}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <span>Live reception check-ins</span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Completed Engagements
              </span>
              <div className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.completed}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>MoM &amp; Notes Logged</span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pending Action Items
              </span>
              <div className="font-display text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {metrics.openActions}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            <span>Follow-up deliverables</span>
          </div>
        </Card>
      </div>

      {/* Control Bar: Search, Category Filters, & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by client, visitor, host, subject, or tender ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('CARDS')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === 'CARDS'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Card / Timeline View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === 'TABLE'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Detailed Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={fetchVisits}
            className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse">
          Loading client visitor records...
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            No client visits match your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Schedule upcoming stakeholder briefings or log walk-in visitor minutes to start building your client engagement timeline.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => {
                setSelectedVisit(null);
                setModalMode('SCHEDULE');
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
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
                className={`p-5 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 ${statusInfo.borderClass} flex flex-col justify-between hover:shadow-md transition-shadow relative`}
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <FormatIcon className="w-3 h-3 text-slate-500" />
                          <span>{formatInfo.label}</span>
                        </span>
                        {visit.sentiment_outcome && (
                          <span className={`text-[10px] font-semibold ${SENTIMENT_LABELS[visit.sentiment_outcome]?.color}`}>
                            • {SENTIMENT_LABELS[visit.sentiment_outcome]?.label}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {visit.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{visit.client_organization}</span>
                        {visit.tender_id && (
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
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
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Logistics Info */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                          className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline truncate"
                        >
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Join Video Conference</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{visit.location_or_room || 'Main Boardroom'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visitor & Host Profile */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Primary Visitor
                      </span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {visit.visitor_name}
                      </div>
                      {visit.visitor_designation && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {visit.visitor_designation}
                        </div>
                      )}
                      {(visit.visitor_phone || visit.visitor_email) && (
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {visit.visitor_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {visit.visitor_phone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Internal Host
                      </span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {visit.internal_host_name || 'Sarah Jenkins'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {visit.internal_host_role || 'Business Head'}
                      </div>
                    </div>
                  </div>

                  {/* Accompanying Delegation (if any) */}
                  {visit.accompanying_persons && visit.accompanying_persons.length > 0 && (
                    <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Delegation ({visit.accompanying_persons.length}):{' '}
                      </span>
                      {visit.accompanying_persons.map((p) => p.name).join(', ')}
                    </div>
                  )}

                  {/* Agenda / Discussion Notes */}
                  {visit.agenda && (
                    <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Agenda: </span>
                      <span className="line-clamp-2">{visit.agenda}</span>
                    </div>
                  )}

                  {visit.discussion_notes && (
                    <div className="mt-2 text-xs bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 text-slate-700 dark:text-slate-300">
                      <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 mb-1">
                        Meeting Minutes / MoM
                      </div>
                      <p className="line-clamp-3 text-xs leading-relaxed">{visit.discussion_notes}</p>
                    </div>
                  )}

                  {/* Action Items List */}
                  {visit.action_items && visit.action_items.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Action Items ({visit.action_items.filter((a) => a.is_done).length}/{visit.action_items.length})
                      </div>
                      <div className="space-y-1">
                        {visit.action_items.map((item, idx) => (
                          <label
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/80 p-1 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.is_done}
                              onChange={() => handleToggleActionItem(visit, idx)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={item.is_done ? 'line-through text-slate-400' : 'font-medium'}>
                              {item.task}
                            </span>
                            {item.deadline && (
                              <span className="ml-auto text-[10px] font-mono text-slate-400">
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
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    ID: <span className="font-mono">{visit.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {visit.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handlePatchStatus(visit.id, 'CHECKED_IN')}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredVisits.map((visit) => {
                  const statusInfo = STATUS_CONFIG[visit.status || 'SCHEDULED'];
                  const formatInfo = FORMAT_LABELS[visit.visit_type || 'IN_PERSON_OFFICE'];

                  return (
                    <tr key={visit.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatInfo.label}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {visit.title}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium text-[11px] mt-0.5">
                          {visit.client_organization}
                        </div>
                        {visit.tender_id && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Tender: {visit.tender_id}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {visit.visitor_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {visit.visitor_designation || 'Visitor'}
                        </div>
                        {visit.visitor_email && (
                          <div className="text-[10px] text-slate-400">{visit.visitor_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {visit.internal_host_name || 'Sarah Jenkins'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {visit.internal_host_role || 'Business Head'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px]">
                          {formatDateTime(visit.scheduled_start)}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {visit.meeting_link ? 'Virtual Conference' : visit.location_or_room || 'Main Boardroom'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {visit.sentiment_outcome ? (
                          <span className={`font-semibold text-[11px] ${SENTIMENT_LABELS[visit.sentiment_outcome]?.color}`}>
                            {SENTIMENT_LABELS[visit.sentiment_outcome]?.label}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {visit.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handlePatchStatus(visit.id, 'CHECKED_IN')}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
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
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVisit(visit.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
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
          fetchVisits();
        }}
      />
    </div>
  );
};
