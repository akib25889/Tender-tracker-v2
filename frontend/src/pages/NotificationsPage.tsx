import { API_BASE_URL } from '../utils/apiConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Check,
  RefreshCw,
  Eye,
  CalendarCheck,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';

interface Alert {
  id: string;
  category:
    | 'DEADLINE'
    | 'BLOCKER'
    | 'APPROVAL'
    | 'VAULT'
    | 'OPENING_REMINDER'
    | 'MILESTONE_REMINDER';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  tender_id: string;
  hours_remaining: number | null;
  read: boolean;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  DEADLINE: <Clock className="w-4 h-4" />,
  BLOCKER: <AlertTriangle className="w-4 h-4" />,
  APPROVAL: <CheckCircle2 className="w-4 h-4" />,
  VAULT: <ShieldCheck className="w-4 h-4" />,
  OPENING_REMINDER: <Eye className="w-4 h-4" />,
  MILESTONE_REMINDER: <CalendarCheck className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  DEADLINE: 'bg-[#FEF2F2] text-[#DC2626]',
  BLOCKER: 'bg-[#FFF7ED] text-[#EA580C]',
  APPROVAL: 'bg-[#F0FDF4] text-[#16A34A]',
  VAULT: 'bg-[#EFF6FF] text-[#2563EB]',
  OPENING_REMINDER: 'bg-[#FAF5FF] text-[#7E22CE]',
  MILESTONE_REMINDER: 'bg-[#FEFCE8] text-[#A16207]',
};

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-[#DC2626]',
  WARNING: 'bg-[#F59E0B]',
  INFO: 'bg-[#2563EB]',
};

export const NotificationsPage: React.FC = () => {
  const { tenders } = useTenders();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchAlerts = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/alerts`)
      .then((r) => r.json())
      .then((data) => {
        const fetched = data.alerts ?? [];
        setAlerts(fetched);
        setLoading(false);
      })
      .catch(() => {
        // Synthesize fallback alerts from local tenders if backend is offline
        const localAlerts: Alert[] = [];
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        tenders.forEach((t) => {
          if (t.stage === 'ARCHIVED' || t.stage === 'LOST') return;

          // Opening date reminders
          const opStr = t.openingDate || t.summary?.dates?.openingDate;
          if (opStr) {
            const cleanOp = opStr.split('T')[0];
            const d = new Date(cleanOp);
            const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (cleanOp === todayStr || diffDays === 0) {
              localAlerts.push({
                id: `ALERT-LOCAL-OPN-TODAY-${t.id}`,
                category: 'OPENING_REMINDER',
                severity: 'CRITICAL',
                title: `Tender Document Opening TODAY — ${t.id}`,
                description: `Official tender opening session for '${t.title}' is scheduled TODAY (${cleanOp}). Authority: ${t.organization}.`,
                tender_id: t.id,
                hours_remaining: 0,
                read: false,
              });
            } else if (diffDays === 1) {
              localAlerts.push({
                id: `ALERT-LOCAL-OPN-TOMORROW-${t.id}`,
                category: 'OPENING_REMINDER',
                severity: 'WARNING',
                title: `Tender Opening Tomorrow (T-1) — ${t.id}`,
                description: `Official tender document opening for '${t.title}' is scheduled for tomorrow (${cleanOp}). Verify sealed envelope submission.`,
                tender_id: t.id,
                hours_remaining: 24,
                read: false,
              });
            }
          }

          // Submission deadline reminders
          if (t.daysRemaining === 0) {
            localAlerts.push({
              id: `ALERT-LOCAL-DL-TODAY-${t.id}`,
              category: 'DEADLINE',
              severity: 'CRITICAL',
              title: `Submission Window Closing TODAY — ${t.id}`,
              description: `Submission window for '${t.title}' locks today! Immediate executive upload required.`,
              tender_id: t.id,
              hours_remaining: t.hoursRemaining || 4,
              read: false,
            });
          } else if (t.daysRemaining === 1) {
            localAlerts.push({
              id: `ALERT-LOCAL-DL-TOMORROW-${t.id}`,
              category: 'DEADLINE',
              severity: 'WARNING',
              title: `Submission Deadline Tomorrow (T-1) — ${t.id}`,
              description: `Submission deadline for '${t.title}' closes in 24 hours.`,
              tender_id: t.id,
              hours_remaining: t.hoursRemaining || 24,
              read: false,
            });
          }
        });

        setAlerts(localAlerts);
        setLoading(false);
      });
  }, [tenders]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markAllRead = () =>
    setReadIds(new Set(alerts.map((a) => a.id)));

  const markRead = (id: string) =>
    setReadIds((prev) => new Set([...prev, id]));

  const isRead = (a: Alert) => readIds.has(a.id);

  const filtered =
    activeFilter === 'ALL'
      ? alerts
      : alerts.filter((a) => a.category === activeFilter);

  const unreadCount = alerts.filter((a) => !isRead(a)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Alerts</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Real-Time Notifications</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Operational Alert Center
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            SLA breach warnings, missing statutory file flags, and executive gatekeeper sign-off notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-lg text-xs w-fit shadow-sm">
        {['ALL', 'OPENING_REMINDER', 'DEADLINE', 'BLOCKER', 'APPROVAL', 'VAULT'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeFilter === tab
                ? 'bg-[#0F172A] text-white font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <Card title="Incoming Alerts" subtitle="Prioritized by severity and arrival time">
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {loading && (
            <div className="p-8 text-center text-xs text-[#94A3B8]">Loading live alerts…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#0F172A]">All clear</p>
              <p className="text-xs text-[#64748B] mt-0.5">No active alerts in this category.</p>
            </div>
          )}
          {!loading &&
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markRead(item.id)}
                className={`p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                  !isRead(item) ? 'bg-[#EFF6FF]/30 hover:bg-[#EFF6FF]/60' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      CATEGORY_COLORS[item.category] ?? 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {CATEGORY_ICON[item.category]}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs ${
                          !isRead(item) ? 'font-bold text-[#0F172A]' : 'font-medium text-[#475569]'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!isRead(item) && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            SEVERITY_DOT[item.severity] ?? 'bg-[#64748B]'
                          }`}
                        />
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>
                    {item.tender_id && (
                      <span className="font-mono text-[10px] text-[#94A3B8]">{item.tender_id}</span>
                    )}
                  </div>
                </div>

                <span className="font-mono text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0 capitalize">
                  {item.severity.toLowerCase()}
                </span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
