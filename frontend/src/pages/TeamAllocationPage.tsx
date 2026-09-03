import React from 'react';
import { Card } from '../components/ui/Card';

export const TeamAllocationPage: React.FC = () => {
  const members = [
    {
      name: 'Sarah Jenkins',
      role: 'Senior Bid Operations Director',
      activeBids: 4,
      workloadScore: 88,
      status: 'HIGH CAPACITY',
    },
    {
      name: 'Dr. Marcus Vance',
      role: 'Technical Solutions Lead',
      activeBids: 3,
      workloadScore: 72,
      status: 'OPTIMAL',
    },
    {
      name: 'Elena Rostova',
      role: 'Bid Manager',
      activeBids: 2,
      workloadScore: 65,
      status: 'OPTIMAL',
    },
    {
      name: 'Tariq Al-Mansoor',
      role: 'Finance & Compliance Officer',
      activeBids: 5,
      workloadScore: 94,
      status: 'OVERLOAD WARNING',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>Operations</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">Resource Management</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          Tender Team &amp; Workload Allocation
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Real-time human capacity monitoring and cross-bid bottleneck prevention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((m) => (
          <Card key={m.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  m.status.includes('OVERLOAD')
                    ? 'bg-[#FEF2F2] text-[#B91C1C]'
                    : m.status.includes('HIGH')
                    ? 'bg-[#FFFBEB] text-[#B45309]'
                    : 'bg-[#F0FDF4] text-[#15803D]'
                }`}
              >
                {m.status}
              </span>
              <span className="font-mono text-xs font-bold text-[#0F172A]">
                {m.workloadScore}%
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">{m.name}</h4>
              <p className="text-[11px] text-[#64748B]">{m.role}</p>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Active Bids:</span>
              <span className="font-mono font-bold text-[#0F172A]">{m.activeBids}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

