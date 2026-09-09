import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { UserRole, isSuperAdminRole } from '../types/tender';
import { Plus, Shield, Check, X, Users, Lock, Eye, EyeOff, KeyRound, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

export const TeamAllocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenders, teamMembers, addTeamMember, currentUser, setCurrentUser } = useTenders();
  const isSuperAdmin = isSuperAdminRole(currentUser.role);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('TENDER_ANALYST');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Solutions Architecture');
  const [newCapacity, setNewCapacity] = useState(6);
  const [newPassword, setNewPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);

  // Credentials Dispatch Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    title: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !newName.trim()) return;

    const finalEmail = newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@tendertracker.io`;
    const finalPassword = newPassword.trim() || 'Password123!';

    addTeamMember({
      name: newName.trim(),
      email: finalEmail,
      role: newRole,
      title: newTitle.trim() || newRole.replace('_', ' '),
      dept: newDept,
      maxCapacity: Number(newCapacity) || 6,
      password: finalPassword,
    });

    setCreatedCredentials({
      name: newName.trim(),
      email: finalEmail,
      password: finalPassword,
      role: newRole,
      title: newTitle.trim() || newRole.replace('_', ' '),
    });

    setNewName('');
    setNewEmail('');
    setNewTitle('');
    setNewPassword('Password123!');
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
          <div className="mt-2.5">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-[11px] font-semibold text-[#065F46]">
                <Shield className="w-3.5 h-3.5 text-[#059669]" />
                <span>Super Admin Active: Authorized to create accounts, assign roles, and dispatch credentials</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[11px] font-semibold text-[#DC2626]">
                <Lock className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Standard Access ({currentUser.role.replace('_', ' ')}): User provisioning restricted to Super Admin</span>
              </span>
            )}
          </div>
        </div>

        {isSuperAdmin ? (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs font-semibold text-[#DC2626] self-start sm:self-auto">
            <Lock className="w-4 h-4 text-[#DC2626]" />
            <span>Super Admin Authorization Required</span>
          </div>
        )}
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
                    <option value="SUPER_ADMIN">Super Admin (System Authority & Account Creation)</option>
                    <option value="BUSINESS_HEAD">Business Head (Executive Leadership & Sign-Off)</option>
                    <option value="EXECUTIVE_MANAGER">Executive Manager (Technical Solutions Authority)</option>
                    <option value="SENIOR_MANAGER">Senior Manager (Commercial & Contracts Lead)</option>
                    <option value="TENDER_ANALYST">Tender Analyst (Operational Specialist)</option>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#0F172A]">Initial Login Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. Password123!"
                    className="w-full pl-3 pr-9 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">
                  The designated user will use this password to authenticate at http://localhost:5173/
                </p>
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
                  className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#1E293B] shadow-sm transition-colors cursor-pointer"
                >
                  Create Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Dispatch Modal for Super Admin */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#E2E8F0] overflow-hidden">
            <div className="p-5 bg-[#0F172A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center text-white shadow-sm">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Account Provisioned Successfully</h3>
                  <p className="text-[11px] text-[#94A3B8]">Credentials generated for designated user</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[#065F46] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>Ready for Delegated Login</span>
                </div>
                <p className="text-[11px] text-[#065F46] leading-relaxed">
                  Share these credentials with the designated person so they can sign in to the TenderTracker Command Center.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Designated Name:</span>
                  <span className="font-bold text-[#0F172A]">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Assigned Role:</span>
                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#2563EB] border border-[#BFDBFE] text-[10px]">
                    {createdCredentials.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Login Email:</span>
                  <span className="font-mono font-bold text-[#0F172A]">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Initial Password:</span>
                  <span className="font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                    {createdCredentials.password}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#64748B]">Login Portal:</span>
                  <span className="font-mono text-[11px] text-[#2563EB]">http://localhost:5173/</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `TenderTracker Command Center Access:\nName: ${createdCredentials.name}\nRole: ${createdCredentials.role.replace('_', ' ')}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nPortal URL: http://localhost:5173/`;
                    navigator.clipboard.writeText(text);
                    setHasCopied(true);
                    setTimeout(() => setHasCopied(false), 2500);
                  }}
                  className="flex-1 py-2 px-3 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded-lg font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-4 h-4 text-[#059669]" />
                      <span className="text-[#059669]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#64748B]" />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const matched = teamMembers.find((m) => m.email.toLowerCase() === createdCredentials.email.toLowerCase());
                    if (matched) {
                      setCurrentUser(matched);
                      navigate('/dashboard');
                    } else {
                      // Construct profile from credentials
                      const newProf = {
                        id: `USR-${Date.now()}`,
                        name: createdCredentials.name,
                        role: createdCredentials.role as UserRole,
                        title: createdCredentials.title,
                        email: createdCredentials.email,
                        avatar: createdCredentials.name.substring(0, 2).toUpperCase(),
                      };
                      setCurrentUser(newProf);
                      navigate('/dashboard');
                    }
                    setCreatedCredentials(null);
                  }}
                  className="flex-1 py-2 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Test Login Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
