import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTenders } from '../../context/TenderContext';
import { Clock, Plus, ArrowRight, ArrowLeft, CheckCircle2, User } from 'lucide-react';
import { TaskStatus } from '../../types/tender';
import { AddTaskModal } from '../../components/modals/AddTaskModal';

export const TenderTasksTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders, moveTask, assignTask, teamMembers } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  if (!tender) return null;

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'REVIEW', title: 'Under Review' },
    { id: 'DONE', title: 'Completed' },
  ];

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'REVIEW';
    if (current === 'REVIEW') return 'DONE';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'DONE') return 'REVIEW';
    if (current === 'REVIEW') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'TODO';
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            Tender Task Board
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Interactive cross-department workload tracking for bid proposal completion
          </p>
        </div>
        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-on)] text-xs font-semibold rounded-lg hover:bg-[var(--accent-hover)] shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = (tender.tasks || []).filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-[var(--bg-subtle)] p-3 rounded-lg flex flex-col gap-3 min-h-[450px]"
            >
              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-xs text-[var(--text-primary)]">
                  {col.title}
                </span>
                <span className="font-mono text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-default)]">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {colTasks.map((task) => {
                  const nextStatus = getNextStatus(task.status);
                  const prevStatus = getPrevStatus(task.status);

                  return (
                    <div
                      key={task.id}
                      className="bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-default)] shadow-sm space-y-2 hover:border-[var(--border-strong)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[var(--text-secondary)]">
                          {task.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
 task.priority === 'CRITICAL'
                              ? 'bg-[var(--crit-soft)] text-[var(--crit)]'
                              : task.priority === 'HIGH'
                              ? 'bg-[var(--warn-soft)] text-[var(--warn)]'
                              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          <select
                            value={task.assignee}
                            onChange={(e) =>
                              assignTask(tender.id, task.id, e.target.value)
                            }
                            className="bg-transparent text-[11px] font-medium text-[var(--text-primary)] border-none p-0 cursor-pointer hover:text-[var(--accent)] truncate max-w-[110px]"
                            title="Click to reassign task"
                          >
                            {teamMembers.map((m) => (
                              <option key={m.id} value={m.name}>
                                {m.name} ({m.role.replace('_', ' ')})
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="font-mono text-[10px] text-[var(--crit)] font-semibold flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {task.deadline}
                        </span>
                      </div>

                      {/* Quick Move Controls */}
                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
                        {prevStatus ? (
                          <button
                            onClick={() => moveTask(tender.id, task.id, prevStatus)}
                            className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Back</span>
                          </button>
                        ) : <span />}

                        {nextStatus ? (
                          <button
                            onClick={() => moveTask(tender.id, task.id, nextStatus)}
                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] font-semibold flex items-center gap-0.5 ml-auto"
                          >
                            <span>Move</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--ok)] font-semibold flex items-center gap-0.5 ml-auto">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskModal
        tenderId={tender.id}
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />
    </div>
  );
};
