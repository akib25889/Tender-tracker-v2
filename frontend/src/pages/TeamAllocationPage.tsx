import React from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';

export const TeamAllocationPage: React.FC = () => {
  const { tenders } = useTenders();

  const members = [
    {
      name: 'Sarah Jenkins',
      role: 'Senior Bid Operations Director',
      dept: 'Executive & Strategy',
      avatar: 'SJ',
      maxCapacity: 8,
    },
    {
      name: 'Dr. Marcus Vance',
      role: 'Technical Solutions Lead',
      dept: 'Solutions Architecture',
      avatar: 'MV',
      maxCapacity: 6,
    },
    {
      name: 'Elena Rostova',
      role: 'Bid & Compliance Lead',
      dept: 'Legal & Risk',
      avatar: 'ER',
      maxCapacity: 6,
    },
    {
      name: 'Tariq Al-Mansoor',
      role: 'Finance & BOQ Lead',
      dept: 'Commercial Finance',
      avatar: 'TM',
      maxCapacity: 5,
    },
  ];

  // Calculate dynamic active tasks per member
  const memberStats = members.map((m) => {
    const assignedTasks = tenders.flatMap((t) =>
      t.tasks.filter((task) => task.assignee.includes(m.name) && task.status !== 'DONE')
    );
    const ledTenders = tenders.filter((t) => t.leadOwner.name.includes(m.name));
    const loadPercent = Math.min(100, Math.round((assignedTasks.length / m.maxCapacity) * 100));

    return {
      ...m,
      activeTasksCount: assignedTasks.length,
      ledTendersCount: ledTenders.length,
      loadPercent,
      isOverloaded: loadPercent >= 85,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>Operations</span>
          <span>•</span>
          <span className="font-semibold text-[#0F172A]">Resource Matrix</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
          Team Capacity &amp; Workload Allocation
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Real-time workload heatmaps and cross-functional task balancing across active tender proposals.
        </p>
      </div>

      {/* Member Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {memberStats.map((member) => (
          <Card key={member.name} className="hover:border-[#CBD5E1] transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{member.name}</h4>
                  <span className="text-[11px] text-[#64748B] block">{member.dept}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Capacity Load</span>
                <span
                  className={`font-mono font-bold ${
                    member.isOverloaded ? 'text-[#DC2626]' : 'text-[#0F172A]'
                  }`}
                >
                  {member.loadPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    member.isOverloaded
                      ? 'bg-[#DC2626]'
                      : member.loadPercent >= 60
                      ? 'bg-[#D97706]'
                      : 'bg-[#16A34A]'
                  }`}
                  style={{ width: `${member.loadPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
              <span>{member.activeTasksCount} Active Tasks</span>
              <span>{member.ledTendersCount} Lead Bids</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Cross-Department Workload Breakdown */}
      <Card
        title="Departmental Task Distribution Matrix"
        subtitle="Live cross-tender task assignments grouped by operational unit"
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {memberStats.map((member) => {
            const memberTasks = tenders.flatMap((t) =>
              t.tasks
                .filter((task) => task.assignee.includes(member.name))
                .map((task) => ({ ...task, tenderId: t.id, tenderTitle: t.title }))
            );

            return (
              <div key={member.name} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F172A]">{member.name}</span>
                    <span className="text-[11px] text-[#64748B]">({member.role})</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
                    {memberTasks.length} Total Deliverables
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {memberTasks.slice(0, 4).map((task) => (
                    <div
                      key={`${task.tenderId}-${task.id}`}
                      className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[#0F172A] block truncate">
                          {task.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#64748B] block">
                          {task.tenderId} • Due {task.deadline}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                          task.status === 'DONE'
                            ? 'bg-[#F0FDF4] text-[#15803D]'
                            : 'bg-[#EFF6FF] text-[#1D4ED8]'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
