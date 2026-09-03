import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';
import { TenderPriority, TaskStatus } from '../../types/tender';

interface AddTaskModalProps {
  tenderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  tenderId,
  isOpen,
  onClose,
}) => {
  const { addTask } = useTenders();

  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('Dr. Marcus Vance');
  const [priority, setPriority] = useState<TenderPriority>('HIGH');
  const [deadline, setDeadline] = useState('Sep 08');
  const [status, setStatus] = useState<TaskStatus>('TODO');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(tenderId, {
      title,
      assignee,
      priority,
      deadline,
      status,
    });
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A]">
              Create Workload Task
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Assign task deliverables across bid management teams
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Task Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Audit Subcontractor SLA & Cybersecurity Accreditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Assignee *
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="Sarah Jenkins">Sarah Jenkins (Director)</option>
                <option value="Dr. Marcus Vance">Dr. Marcus Vance (Tech Lead)</option>
                <option value="Elena Rostova">Elena Rostova (Bid Lead)</option>
                <option value="Tariq Al-Mansoor">Tariq Al-Mansoor (Finance)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TenderPriority)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="CRITICAL">Critical Blocker</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Target Column *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Under Review</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Deadline Tag *
              </label>
              <input
                type="text"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Sep 08"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

