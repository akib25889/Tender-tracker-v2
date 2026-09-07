import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { UserRole } from '../types/tender';
import { Plus, Shield, Check, X, Users, Lock } from 'lucide-react';

export const TeamAllocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenders, teamMembers, addTeamMember } = useTenders();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('TENDER_ANALYST');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Solutions Architecture');
  const [newCapacity, setNewCapacity] = useState(6);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addTeamMember({
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@tendertracker.io`,
      role: newRole,
      title: newTitle.trim() || newRole.replace('_', ' '),
      dept: newDept,
      maxCapacity: Number(newCapacity) || 6,
    });

    setNewName('');
    setNewEmail('');
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  // Calculate dynamic active tasks per member
  const memberStats = teamMembers.map((m) => {
    const maxCap = m.maxCapacity || 6;
    const memberName = (m.name || '').toLowerCase();
    const assignedTasks = tenders.flatMap((t) =>
      (t.tasks || []).filter((task) => (task.assignee || '').toLowerCase().includes(memberName) && task.status !== 'DONE')
    );
    const ledTenders = tenders.filter((t) => t.leadOwner?.name?.toLowerCase().includes(memberName));
    const loadPercent = Math.min(100, Math.round((assignedTasks.length / maxCap) * 100));

    const title = m.title || '';
    return {
      ...m,
      dept: title.includes('Finance') ? 'Commercial Finance' : title.includes('Technical') ? 'Solutions Architecture' : title.includes('Compliance') ? 'Legal & Risk' : 'Bid Operations',
      activeTasksCount: assignedTasks.length,
      ledTendersCount: ledTenders.length,
      loadPercent,
      isOverloaded: loadPercent >= 85,
    };
  });

  const PERMISSION_MATRIX = [
    {
      feature: 'Tender Creation & Discovery Queue',
      businessHead: true,
      execManager: true,
      seniorManager: true,
      analyst: true,
      note: 'All staff can register discovered opportunities and draft specifications',
    },
    {
      feature: 'Technical Scope of Work (SOW) Sign-Off (Tier 1)',
      businessHead: true,
      execManager: true,
      seniorManager: false,
      analyst: false,
      note: 'Strictly restricted to Technical & Solutions Architecture leaders',
    },
    {
      feature: 'Commercial BOQ & Margin Sign-Off (Tier 2)',
      businessHead: true,
      execManager: false,
      seniorManager: true,
      analyst: false,
      note: 'Strictly restricted to Commercial Finance & Pricing leads',
    },
    {
      feature: 'Legal Solvency & Regulatory Sign-Off (Tier 3)',
      businessHead: true,
      execManager: false,
      seniorManager: false,
      analyst: false,
      note: 'Legal & compliance authorization before board packaging',
    },
    {
      feature: 'Executive Board Final Gatekeeper (Tier 4)',
      businessHead: true,
      execManager: false,
      seniorManager: false,
      analyst: false,
      note: 'Irreversible authorization for official donor electronic submission',
    },
    {
      feature: 'Task Delegation & Cross-Tender Reassignment',
      businessHead: true,
      execManager: true,
      seniorManager: true,
      analyst: false,
      note: 'Managers can reallocate workloads; Analysts execute assigned items',
    },
    {
      feature: 'Send to Archive (Non-Participation Records)',
      businessHead: true,
      execManager: true,
      seniorManager: true,
      analyst: true,
      note: 'Permitted in any stage before final submission',
    },
    {
      feature: 'Permanent Tender Deletion',
      businessHead: true,
      execManager: false,
      seniorManager: false,
      analyst: false,
      note: 'Executive safeguard to prevent accidental audit record loss',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Operations</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Resource Matrix</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Team Capacity &amp; Access Control
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage team member profiles, live workload allocations, and role-based access limitations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member Profile</span>
        </button>
      </div>

      {/* Member Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {memberStats.map((member) => (
          <Card key={member.id} className="hover:border-[#CBD5E1] transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                  {member.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0F172A] truncate">{member.name}</h4>
                  <span className="text-[11px] text-[#64748B] block truncate">{member.title}</span>
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

            <div className="pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => navigate(`/profile/${member.id}`)}
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#0F172A] hover:text-white hover:border-[#0F172A] rounded-md text-[11px] font-semibold text-[#0F172A] transition-all shadow-xs"
              >
                <span>View Personnel Dossier &amp; CV →</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Role-Based Limitation of Access (RBAC Matrix) */}
      <Card
        title="Limitation of Access & Role-Based Permissions Matrix (RBAC)"
        subtitle="Operational security boundaries enforced across tender lifecycle gates and statutory sign-offs"
      >
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                <th className="py-3 px-4 font-semibold">System Action / Gate</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Business Head</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Executive Mgr</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Senior Mgr</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Tender Analyst</th>
                <th className="py-3 px-4 font-semibold">Limitation Rule & Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {PERMISSION_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#0F172A] flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>{row.feature}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.businessHead ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.execManager ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.seniorManager ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.analyst ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ECFDF5] text-[#047857]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                        <Lock className="w-3 h-3 text-[#DC2626]" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] text-[11px] leading-relaxed">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cross-Department Workload Breakdown */}
      <Card
        title="Departmental Task Distribution Matrix"
        subtitle="Live cross-tender task assignments grouped by operational unit"
      >
        <div className="divide-y divide-[#F1F5F9] -mx-5 -my-5">
          {memberStats.map((member) => {
            const memberTasks = tenders.flatMap((t) =>
              t.tasks
                .filter((task) => task.assignee.toLowerCase().includes(member.name.toLowerCase()))
                .map((task) => ({ ...task, tenderId: t.id, tenderTitle: t.title }))
            );

            return (
              <div key={member.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F172A]">{member.name}</span>
                    <span className="text-[11px] text-[#64748B]">({member.title})</span>
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
                  {memberTasks.length === 0 && (
                    <span className="text-xs text-[#94A3B8] italic">No active tasks assigned yet.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal: Create Team Member Profile */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Create Team Member Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Corporate Email</label>
                <input
                  type="email"
                  placeholder="rachel.adams@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Access Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="BUSINESS_HEAD">Business Head (Full Admin)</option>
                    <option value="EXECUTIVE_MANAGER">Executive Manager (Technical)</option>
                    <option value="SENIOR_MANAGER">Senior Manager (Commercial)</option>
                    <option value="TENDER_ANALYST">Tender Analyst (Operational)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Job Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Solutions Lead"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Solutions Architecture"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Max Concurrent Tasks</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[11px] text-[#1D4ED8]">
                <span className="font-bold block mb-0.5">Role Access Note:</span>
                Assigning this profile will immediately make them available across Task Boards, Review Sign-Off Tiers, and Tender Ownership dropdowns.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
                >
                  Create Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
