import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ExternalLink } from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const myTasks = [
    {
      id: 'TSK-103',
      tenderId: 'TDR-2026-EU-089',
      tenderTitle: 'Enterprise ERP Modernization',
      title: 'Obtain Notarized Bank Solvency & Performance Letter',
      priority: 'CRITICAL',
      deadline: 'Tomorrow, 14:00',
      status: 'IN_PROGRESS',
    },
    {
      id: 'TSK-109',
      tenderId: 'TDR-2026-WB-104',
      tenderTitle: 'Digital Health Records Implementation',
      title: 'Finalize Pricing BOQ Schedule with Subcontractor',
      priority: 'HIGH',
      deadline: 'Sep 06',
      status: 'PENDING',
    },
    {
      id: 'TSK-112',
      tenderId: 'TDR-2026-MOF-052',
      tenderTitle: 'National Tax Portal Migration',
      title: 'Submit Technical Compliance Matrix for Director Review',
      priority: 'MEDIUM',
      deadline: 'Sep 08',
      status: 'PENDING',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>Personal Console</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">My Assigned Tasks</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          Cross-Tender Execution Console
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Unified personal task queue prioritizing action items across all active bids.
        </p>
      </div>

      <Card
        title="Active Operational Tasks"
        subtitle="3 tasks assigned to Sarah Jenkins"
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {myTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0F172A]">
                    {task.id}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      task.priority === 'CRITICAL'
                        ? 'bg-[#FEF2F2] text-[#B91C1C]'
                        : 'bg-[#FFFBEB] text-[#B45309]'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    {task.tenderId}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#0F172A]">
                  {task.title}
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Tender: {task.tenderTitle} • Due: {task.deadline}
                </p>
              </div>

              <Link
                to={`/tenders/${task.tenderId}/tasks`}
                className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] shrink-0"
              >
                <span>Go to Task</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

