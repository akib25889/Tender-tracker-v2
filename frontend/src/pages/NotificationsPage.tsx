import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Clock, AlertTriangle, CheckCircle2, ShieldCheck, Check, RefreshCw } from 'lucide-react';

interface Alert {
  id: string;
  category: 'DEADLINE' | 'BLOCKER' | 'APPROVAL' | 'VAULT';
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
};

const CATEGORY_COLORS: Record<string, string> = {
  DEADLINE: 'bg-[#FEF2F2] text-[#DC2626]',
  BLOCKER: 'bg-[#FFF7ED] text-[#EA580C]',
  APPROVAL: 'bg-[#F0FDF4] text-[#16A34A]',
  VAULT: 'bg-[#EFF6FF] text-[#2563EB]',
};

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-[#DC2626]',
  WARNING: 'bg-[#F59E0B]',
  INFO: 'bg-[#2563EB]',
};

export const NotificationsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchAlerts = useCallback(() => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/alerts')
      .then((r) => r.json())
      .then((data) => {
        setAlerts(data.alerts ?? []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

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
        {['ALL', 'DEADLINE', 'BLOCKER', 'APPROVAL', 'VAULT'].map((tab) => (
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
