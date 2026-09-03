import React from 'react';
import { Clock, Plus } from 'lucide-react';

export const TenderTasksTab: React.FC = () => {
  const columns = [
    {
      id: 'TODO',
      title: 'To Do',
      count: 2,
      tasks: [
        {
          id: 'TSK-101',
          title: 'Compile Sovereign Cloud Node Architecture Diagram',
          assignee: 'Dr. Marcus Vance',
          priority: 'HIGH',
          deadline: 'Sep 05',
        },
        {
          id: 'TSK-102',
          title: 'Finalize Pricing BOQ Schedule with Subcontractor',
          assignee: 'Tariq Al-Mansoor',
          priority: 'CRITICAL',
          deadline: 'Sep 05',
        },
      ],
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      count: 3,
      tasks: [
        {
          id: 'TSK-103',
          title: 'Obtain Notarized Bank Solvency & Performance Letter',
          assignee: 'Sarah Jenkins',
          priority: 'CRITICAL',
          deadline: 'Sep 05',
        },
        {
          id: 'TSK-104',
          title: 'Draft Technical Methodology Section 3: SLA Operations',
          assignee: 'Elena Rostova',
          priority: 'MEDIUM',
          deadline: 'Sep 06',
        },
      ],
    },
    {
      id: 'REVIEW',
      title: 'Under Review',
      count: 2,
      tasks: [
        {
          id: 'TSK-105',
          title: 'Legal Counsel Review of Liquidated Damages Clause',
          assignee: 'Legal Officer',
          priority: 'HIGH',
          deadline: 'Sep 06',
        },
      ],
    },
    {
      id: 'DONE',
      title: 'Completed',
      count: 19,
      tasks: [
        {
          id: 'TSK-089',
          title: 'Statutory Tax Clearance & Trade License Upload',
          assignee: 'Tariq Al-Mansoor',
          priority: 'LOW',
          deadline: 'Aug 28',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Tender Task Board (Kanban)
          </h2>
          <p className="text-xs text-[#64748B]">
            Interactive cross-department workload tracking for bid proposal completion
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-[#F1F5F9] p-3 rounded-lg flex flex-col gap-3 min-h-[400px]"
          >
            <div className="flex items-center justify-between px-1">
              <span className="font-semibold text-xs text-[#0F172A]">
                {col.title}
              </span>
              <span className="font-mono text-xs font-bold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                {col.count}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-sm space-y-2 hover:border-[#CBD5E1] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#64748B]">
                      {task.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        task.priority === 'CRITICAL'
                          ? 'bg-[#FEF2F2] text-[#B91C1C]'
                          : task.priority === 'HIGH'
                          ? 'bg-[#FFFBEB] text-[#B45309]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-[#0F172A] leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-[#F8FAFC]">
                    <span>{task.assignee}</span>
                    <span className="font-mono text-[10px] text-[#DC2626] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

