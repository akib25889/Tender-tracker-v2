import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Clock, AlertTriangle, CheckCircle2, ShieldCheck, Check } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'N-01',
      title: 'TDR-2026-EU-089 Deadline Critical: 48 Hours Remaining',
      desc: 'Submission window for United Nations Enterprise ERP closes on Sep 06, 14:00 GMT.',
      category: 'DEADLINE',
      time: '15 mins ago',
      read: false,
    },
    {
      id: 'N-02',
      title: 'Missing Bank Guarantee Seal: TDR-2026-EU-089',
      desc: 'Elena Rostova flagged missing solvency certificate in vault folder 04_financial_proposal.',
      category: 'BLOCKER',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 'N-03',
      title: 'Tier 2 Financial Margin Sign-Off Cleared',
      desc: 'Tariq Al-Mansoor signed off the commercial BOQ for TDR-2026-WB-104.',
      category: 'APPROVAL',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 'N-04',
      title: 'Document Upload Logged: Technical_Methodology_SOW_v3.pdf',
      desc: 'SHA-256 Checksum verified: 8f4c2b9a7d1e3f5...93d182a.',
      category: 'VAULT',
      time: '5 hours ago',
      read: true,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('ALL');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.category === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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

      {/* Notifications List */}
      <Card title="Incoming Alerts" subtitle="Prioritized by severity and arrival time">
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markSingleRead(item.id)}
              className={`p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                !item.read ? 'bg-[#EFF6FF]/30 hover:bg-[#EFF6FF]/60' : 'hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.category === 'DEADLINE'
                      ? 'bg-[#FEF2F2] text-[#DC2626]'
                      : item.category === 'BLOCKER'
                      ? 'bg-[#FFF7ED] text-[#EA580C]'
                      : item.category === 'APPROVAL'
                      ? 'bg-[#F0FDF4] text-[#16A34A]'
                      : 'bg-[#EFF6FF] text-[#2563EB]'
                  }`}
                >
                  {item.category === 'DEADLINE' ? (
                    <Clock className="w-4 h-4" />
                  ) : item.category === 'BLOCKER' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : item.category === 'APPROVAL' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs ${
                        !item.read ? 'font-bold text-[#0F172A]' : 'font-medium text-[#475569]'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <span className="font-mono text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
