import React from 'react';
import { Card } from '../components/ui/Card';
import { Clock } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const events = [
    {
      date: 'Sep 05, 2026',
      time: '12:00 GMT',
      tenderId: 'TDR-2026-ADB-215',
      title: 'ADB Pre-Bid Clarification Meeting & Portal Q&A Lock',
      type: 'PRE_BID_MEETING',
    },
    {
      date: 'Sep 06, 2026',
      time: '14:00 GMT',
      tenderId: 'TDR-2026-EU-089',
      title: 'UNDP Sovereign Cloud Final Electronic Submission Lock',
      type: 'SUBMISSION_DEADLINE',
      critical: true,
    },
    {
      date: 'Sep 08, 2026',
      time: '18:00 GMT',
      tenderId: 'TDR-2026-WB-104',
      title: 'World Bank Telemedicine Network Tender Closes',
      type: 'SUBMISSION_DEADLINE',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>Schedule</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">Statutory Calendar</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          Tender Calendar &amp; Deadline Schedule
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Comprehensive timeline of statutory cutoff locks, pre-bid conferences, and addendum releases.
        </p>
      </div>

      <Card title="Upcoming Cutoff Dates &amp; Mandatory Events">
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {events.map((evt) => (
            <div
              key={evt.title}
              className="p-4 hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0F172A]">
                    {evt.tenderId}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      evt.critical
                        ? 'bg-[#FEF2F2] text-[#B91C1C]'
                        : 'bg-[#EFF6FF] text-[#1D4ED8]'
                    }`}
                  >
                    {evt.type}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#0F172A]">{evt.title}</h4>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0F172A] bg-[#F1F5F9] px-3 py-1.5 rounded border border-[#E2E8F0] shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>{evt.date} • {evt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

