import React from 'react';
import { Card } from '../components/ui/Card';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const alerts = [
    {
      id: 'ALT-901',
      title: 'Portal Cutoff Imminent: TDR-2026-EU-089 closes in 48 hours',
      type: 'DEADLINE_URGENT',
      time: '15 mins ago',
      unread: true,
    },
    {
      id: 'ALT-902',
      title: 'Missing Solvency Guarantee: Bank guarantee verification seal pending',
      type: 'COMPLIANCE_BLOCKER',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 'ALT-903',
      title: 'Stage Transition Approved: TDR-2026-WB-104 passed Tier 2 Financial Review',
      type: 'APPROVAL_PASSED',
      time: '3 hours ago',
      unread: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>System</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">Alert Center</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          Operational Alert Center
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Real-time notifications, cutoff window timers, and statutory compliance warnings.
        </p>
      </div>

      <Card title="Pending System Alerts">
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                alt.unread ? 'bg-[#EFF6FF]/40' : 'hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {alt.type.includes('DEADLINE') ? (
                    <Clock className="w-4 h-4 text-[#DC2626]" />
                  ) : alt.type.includes('BLOCKER') ? (
                    <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-[#0F172A]">
                    {alt.title}
                  </h4>
                  <span className="text-[11px] text-[#64748B]">{alt.time}</span>
                </div>
              </div>
              {alt.unread && (
                <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0"></span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

