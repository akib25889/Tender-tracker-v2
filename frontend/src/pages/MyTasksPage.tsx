import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { CheckCircle2, Filter, Search, ArrowRight, Square } from 'lucide-react';
import { TaskStatus } from '../types/tender';

export const MyTasksPage: React.FC = () => {
  const { tenders, moveTask, assignTask, teamMembers } = useTenders();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all tasks across all tenders with their tender metadata
  const allTasks = tenders.flatMap((tender) =>
    tender.tasks.map((task) => ({
      ...task,
      tenderId: tender.id,
      tenderTitle: tender.title,
      tenderStage: tender.stage,
    }))
  );

  const filteredTasks = allTasks.filter((task) => {
    const matchesStatus =
      filterStatus === 'ALL' || task.status === filterStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tenderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleToggleDone = (tenderId: string, taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'DONE' ? 'IN_PROGRESS' : 'DONE';
    moveTask(tenderId, taskId, nextStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Workload Console</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Cross-Tender Execution</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            My Operational Tasks
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Centralized checklist of all assigned deliverables across {tenders.length} active tender proposals.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium">
          <span className="text-[#64748B]">Completed:</span>
          <span className="font-mono font-bold text-[#16A34A]">
            {allTasks.filter((t) => t.status === 'DONE').length} / {allTasks.length}
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables, assignee..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          {['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-[#0F172A] text-white font-semibold'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {s === 'ALL' ? 'All Deliverables' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <Card title="Assigned Deliverables Checklist" subtitle="Click checkbox to mark complete and update global tender readiness score">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10">Done</th>
                <th className="py-2.5 px-3">Task Deliverable</th>
                <th className="py-2.5 px-3">Associated Tender</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Deadline</th>
                <th className="py-2.5 px-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-[#94A3B8]">
                    No deliverables found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  return (
                    <tr
                      key={`${task.tenderId}-${task.id}`}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isDone ? 'opacity-60 bg-[#F8FAFC]/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <button
                          onClick={() =>
                            handleToggleDone(task.tenderId, task.id, task.status)
                          }
                          className="text-[#64748B] hover:text-[#16A34A] transition-colors"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#CBD5E1]" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[#0F172A] max-w-sm">
                        <span className={isDone ? 'line-through text-[#94A3B8]' : ''}>
                          {task.title}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs truncate font-medium text-[#475569]">
                        <Link
                          to={`/tenders/${task.tenderId}`}
                          className="hover:text-[#2563EB] truncate block"
                        >
                          {task.tenderId}: {task.tenderTitle}
                        </Link>
                      </td>

                      <td className="py-3 px-3 text-[#475569]">
                        <select
                          value={task.assignee}
                          onChange={(e) =>
                            assignTask(task.tenderId, task.id, e.target.value)
                          }
                          className="bg-transparent text-xs font-medium text-[#0F172A] border border-transparent hover:border-[#CBD5E1] rounded px-1.5 py-0.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                          title="Click to reassign team member"
                        >
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            task.priority === 'CRITICAL'
                              ? 'bg-[#FEF2F2] text-[#B91C1C]'
                              : task.priority === 'HIGH'
                              ? 'bg-[#FFFBEB] text-[#B45309]'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[10px] font-semibold text-[#64748B]">
                        {task.status}
                      </td>

                      <td className="py-3 px-3 font-mono text-[10px] text-[#DC2626] font-semibold">
                        {task.deadline}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/tenders/${task.tenderId}/tasks`}
                          className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] font-semibold hover:underline"
                        >
                          <span>Board</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
