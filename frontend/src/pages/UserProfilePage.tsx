import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import {
  UserProfile,
  PastProjectAssignment,
  EmploymentType,
  UserRole,
} from '../types/tender';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Copy,
  Check,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Shield,
  GraduationCap,
  Award,
  FileText,
  UserCheck,
} from 'lucide-react';

const EMPLOYMENT_TYPE_CONFIG: Record<
  EmploymentType,
  { label: string; badgeClass: string; desc: string }
> = {
  PERMANENT: {
    label: 'Permanent Core Employee',
    badgeClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    desc: 'Full-time core team member of prime bidder entity',
  },
  JV_PARTNER_STAFF: {
    label: 'JV Partner Staff',
    badgeClass: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    desc: 'Consortium / Joint-Venture Partner Key Personnel',
  },
  EXTERNAL_CONSULTANT: {
    label: 'Dedicated External Consultant',
    badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    desc: 'Third-party advisory expert retained for specific tender scope',
  },
};

const ROLE_DISPLAY: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrator',
  BUSINESS_HEAD: 'Business Head (Executive Lead)',
  EXECUTIVE_MANAGER: 'Executive Manager',
  SENIOR_MANAGER: 'Senior Manager',
  TENDER_ANALYST: 'Tender Analyst',
};

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    teamMembers,
    tenders,
    formatCurrency,
    updateUserProfile,
    addPastAssignment,
    deletePastAssignment,
  } = useTenders();

  // Active profile being viewed
  const targetUser: UserProfile =
    (userId ? teamMembers.find((m) => m.id === userId) : null) ||
    currentUser ||
    teamMembers[0];

  const [copiedDesignation, setCopiedDesignation] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: targetUser.name || '',
    title: targetUser.title || '',
    department: targetUser.department || 'Bid Operations & Strategy',
    phone: targetUser.phone || '',
    location: targetUser.location || 'Dhaka, Bangladesh',
    employmentType: (targetUser.employmentType || 'PERMANENT') as EmploymentType,
    proposedDesignation: targetUser.proposedDesignation || '',
    maxCapacity: targetUser.maxCapacity || 5,
  });

  // Add Assignment Form State
  const [assignmentForm, setAssignmentForm] = useState({
    projectName: '',
    client: '',
    role: '',
    duration: '',
    deploymentMonths: 6,
    keyDeliverables: '',
    technologiesUsed: '',
    coreResponsibilities: '',
  });

  const memberName = (targetUser.name || '').toLowerCase();
  const assignedTasks = tenders.flatMap((t) =>
    (t.tasks || []).filter(
      (task) =>
        (task.assignee || '').toLowerCase().includes(memberName) &&
        task.status !== 'DONE'
    )
  );

  // Tenders associated with user (via leadOwner, tasks, or activeTenderRoles map)
  const activeTenders = tenders.filter((t) => {
    if (t.stage === 'ARCHIVED') return false;
    const isLead = (t.leadOwner?.name || '').toLowerCase().includes(memberName);
    const hasTasks = (t.tasks || []).some((tsk) =>
      (tsk.assignee || '').toLowerCase().includes(memberName)
    );
    const hasRoleInMap =
      targetUser.activeTenderRoles && targetUser.activeTenderRoles[t.id];
    return isLead || hasTasks || hasRoleInMap;
  });

  const handleCopyDesignation = () => {
    const textToCopy =
      targetUser.proposedDesignation ||
      `${targetUser.name} — ${targetUser.title}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedDesignation(true);
    setTimeout(() => setCopiedDesignation(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(targetUser.id, {
      name: editForm.name.trim(),
      title: editForm.title.trim(),
      department: editForm.department.trim(),
      phone: editForm.phone.trim(),
      location: editForm.location.trim(),
      employmentType: editForm.employmentType,
      proposedDesignation: editForm.proposedDesignation.trim(),
      maxCapacity: Number(editForm.maxCapacity) || 5,
    });
    setIsEditModalOpen(false);
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.projectName.trim()) return;

    const newAssignment: PastProjectAssignment = {
      id: `PA-${Date.now().toString().slice(-4)}`,
      projectName: assignmentForm.projectName.trim(),
      client: assignmentForm.client.trim(),
      role: assignmentForm.role.trim() || 'Key Expert',
      duration: assignmentForm.duration.trim() || '6 Months',
      deploymentMonths: Number(assignmentForm.deploymentMonths) || 6,
      keyDeliverables: assignmentForm.keyDeliverables
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      technologiesUsed: assignmentForm.technologiesUsed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      coreResponsibilities: assignmentForm.coreResponsibilities.trim(),
    };

    await addPastAssignment(targetUser.id, newAssignment);
    setAssignmentForm({
      projectName: '',
      client: '',
      role: '',
      duration: '',
      deploymentMonths: 6,
      keyDeliverables: '',
      technologiesUsed: '',
      coreResponsibilities: '',
    });
    setIsAddAssignmentModalOpen(false);
  };

  const handleExportCV = () => {
    const lines = [
      `# KEY PERSONNEL DOSSIER & CV SUMMARY`,
      `**Name:** ${targetUser.name}`,
      `**Proposed Tender Designation:** ${targetUser.proposedDesignation || targetUser.title}`,
      `**Official Title:** ${targetUser.title}`,
      `**Department:** ${targetUser.department || 'Bid Operations'}`,
      `**Employment Relationship:** ${targetUser.employmentType || 'PERMANENT'}`,
      `**Contact:** ${targetUser.email} | ${targetUser.phone || 'N/A'} | ${targetUser.location || 'N/A'}`,
      ``,
      `## Professional Certifications`,
      ...(targetUser.certifications || []).map((c) => `- ${c}`),
      ``,
      `## Academic Credentials`,
      ...(targetUser.education || []).map((e) => `- ${e.degree} — ${e.institution} (${e.year || 'N/A'})`),
      ``,
      `## Project Track Record & Past Assignments`,
      ...(targetUser.pastAssignments || []).map(
        (a) =>
          `### ${a.projectName}\n- **Client:** ${a.client}\n- **Role:** ${a.role}\n- **Duration:** ${a.duration} (${a.deploymentMonths || 'N/A'} months)\n- **Deliverables:** ${a.keyDeliverables.join(', ')}\n- **Technologies:** ${a.technologiesUsed.join(', ')}\n- **Responsibilities:** ${a.coreResponsibilities}\n`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  const empTypeConfig =
    EMPLOYMENT_TYPE_CONFIG[
      (targetUser.employmentType as EmploymentType) || 'PERMANENT'
    ] || EMPLOYMENT_TYPE_CONFIG.PERMANENT;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Team Member Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Personnel &amp; Governance</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Key Personnel Dossier</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[#2563EB]" />
            <span>Personnel Dossier &amp; Profile Hub</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Comprehensive key personnel credentials, proposed tender roles, live capacity sentinel, and technical CV track record.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-xs"
            title="Copy formatted CV markdown for tender annexures"
          >
            {copiedDossier ? (
              <>
                <Check className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">Dossier Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-[#64748B]" />
                <span>Export CV Dossier</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditForm({
                name: targetUser.name || '',
                title: targetUser.title || '',
                department: targetUser.department || 'Bid Operations & Strategy',
                phone: targetUser.phone || '',
                location: targetUser.location || 'Dhaka, Bangladesh',
                employmentType: (targetUser.employmentType || 'PERMANENT') as EmploymentType,
                proposedDesignation: targetUser.proposedDesignation || '',
                maxCapacity: targetUser.maxCapacity || 5,
              });
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
          >
            <span>Edit Profile Details</span>
          </button>
        </div>
      </div>

      {/* Personnel Selector Carousel / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-[#64748B] shrink-0 mr-1 uppercase tracking-wider">
          Team Member:
        </span>
        {teamMembers.map((member) => {
          const isSelected = member.id === targetUser.id;
          return (
            <button
              key={member.id}
              onClick={() => navigate(`/profile/${member.id}`)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                isSelected
                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#0F172A] text-white'
                }`}
              >
                {member.avatar}
              </div>
              <span>{member.name}</span>
            </button>
          );
        })}
      </div>

      {/* PILLAR 1: User Identity & Core Profile Card */}
      <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Identity & Core Badges */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#334155] text-white flex items-center justify-center text-xl font-display font-bold shadow-md shrink-0 ring-4 ring-[#F1F5F9]">
              {targetUser.avatar}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  {targetUser.name}
                </h2>
                {/* System Role Badge */}
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
                  {ROLE_DISPLAY[targetUser.role] || targetUser.role}
                </span>
                {/* Employment Type Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${empTypeConfig.badgeClass}`}
                  title={empTypeConfig.desc}
                >
                  {empTypeConfig.label}
                </span>
              </div>

              <p className="text-sm font-medium text-[#475569]">
                {targetUser.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-1">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{targetUser.department || 'Bid Operations & Strategy'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                  <a
                    href={`mailto:${targetUser.email}`}
                    className="hover:underline text-[#0F172A] font-medium"
                  >
                    {targetUser.email}
                  </a>
                </div>
                {targetUser.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-[#0F172A] font-medium">
                      {targetUser.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{targetUser.location || 'Dhaka, Bangladesh'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="flex items-center gap-3 self-start lg:self-auto bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
            <div className="text-center px-3 border-r border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] font-medium">Live Tenders</div>
              <div className="text-lg font-bold font-mono text-[#0F172A]">
                {activeTenders.length}
              </div>
            </div>
            <div className="text-center px-3 border-r border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] font-medium">Active Tasks</div>
              <div className="text-lg font-bold font-mono text-[#2563EB]">
                {assignedTasks.length}
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-[#64748B] font-medium">Track Record</div>
              <div className="text-lg font-bold font-mono text-[#16A34A]">
                {(targetUser.pastAssignments || []).length} Bids
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 2: Tender-Specific Identity (Proposed Role) */}
        <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
          <div className="bg-gradient-to-r from-[#F0FDF4] via-[#EFF6FF] to-[#FAF5FF] border border-[#BFDBFE] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E40AF]">
                  Tender-Specific Identity &amp; Proposed Bid Role
                </span>
              </div>
              <div className="text-sm font-bold text-[#0F172A] font-display">
                {targetUser.proposedDesignation ||
                  `${targetUser.name} — ${targetUser.title}`}
              </div>
              <p className="text-[11px] text-[#64748B]">
                Official designation formatted for Technical Proposal Submissions, Form Tech-1 CV annexures, and Procuring Authority scoring.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyDesignation}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shrink-0 shadow-xs self-start md:self-auto"
            >
              {copiedDesignation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Copy Designation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* PILLAR 4: Active Assignments & Workspace Integration */}
      <Card
        title={`Active Tender Commitments (${activeTenders.length})`}
        subtitle="Direct links to live Proposal Workspaces with role matrix designations and delivery milestones"
      >
        {activeTenders.length === 0 ? (
          <div className="py-8 text-center text-[#64748B] text-xs">
            No active tender assignments currently recorded for this team member.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTenders.map((tender) => {
              const roleInMap =
                targetUser.activeTenderRoles &&
                targetUser.activeTenderRoles[tender.id];
              const isLead = (tender.leadOwner?.name || '')
                .toLowerCase()
                .includes(memberName);
              const userRoleBadge =
                roleInMap === 'LEAD_MANAGER' || isLead ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    Lead Proposal Manager
                  </span>
                ) : roleInMap === 'REVIEWER' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                    Quality &amp; Compliance Reviewer
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    Core Technical Contributor
                  </span>
                );

              const userTasks = (tender.tasks || []).filter((tsk) =>
                (tsk.assignee || '').toLowerCase().includes(memberName)
              );

              return (
                <div
                  key={tender.id}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] p-4 rounded-xl flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        {tender.referenceNo || tender.id}
                      </span>
                      {userRoleBadge}
                    </div>

                    <h4 className="text-xs font-bold text-[#0F172A] line-clamp-2 leading-snug">
                      {tender.title}
                    </h4>

                    <div className="text-[11px] text-[#64748B]">
                      {tender.organization || 'Procuring Authority'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E2E8F0]/60">
                      <span className="text-[#64748B]">Est. Value</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {formatCurrency(tender.estimatedValue || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Submission Deadline</span>
                      <span className="font-mono text-[#0F172A] font-medium">
                        {tender.submissionDeadline || 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Active Assigned Tasks</span>
                      <span className="font-mono font-bold text-[#2563EB]">
                        {userTasks.length} Tasks
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => navigate(`/tenders/${tender.id}`)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#0F172A] hover:text-white hover:border-[#0F172A] rounded-lg text-xs font-semibold text-[#0F172A] transition-all shadow-xs"
                    >
                      <span>Open Proposal Workspace</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* PILLAR 3: Professional Track Record & Past Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
              <span>Professional Track Record &amp; Past Project Assignments</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Verified project history for Form Tech-1 CV generation, past performance scoring, and procuring authority qualification.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddAssignmentModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project Assignment</span>
          </button>
        </div>

        {/* Assignments Ledger */}
        {(!targetUser.pastAssignments || targetUser.pastAssignments.length === 0) ? (
          <Card className="py-8 text-center text-[#64748B] text-xs">
            No past project assignments recorded. Click "Add Project Assignment" to build this specialist's tender track record.
          </Card>
        ) : (
          <div className="space-y-3">
            {targetUser.pastAssignments.map((assignment, idx) => (
              <Card
                key={assignment.id || idx}
                className="p-5 border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-sm font-bold text-[#0F172A]">
                        {assignment.projectName}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                        {assignment.role}
                      </span>
                      {assignment.deploymentMonths && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                          {assignment.deploymentMonths} Months Deployed
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                      <span>
                        <strong>Client:</strong> {assignment.client}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#64748B]" />
                        <span>{assignment.duration}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#334155] leading-relaxed pt-1">
                      {assignment.coreResponsibilities}
                    </p>

                    {/* Key Deliverables */}
                    {assignment.keyDeliverables && assignment.keyDeliverables.length > 0 && (
                      <div className="space-y-1 pt-1.5">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                          Key Deliverables:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {assignment.keyDeliverables.map((deliv, dIdx) => (
                            <span
                              key={dIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]"
                            >
                              {deliv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technologies & Methods */}
                    {assignment.technologiesUsed && assignment.technologiesUsed.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                          Technologies &amp; Tools:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {assignment.technologiesUsed.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deletePastAssignment(targetUser.id, assignment.id)}
                    className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors self-start shrink-0"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Academic Credentials & Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certifications */}
        <Card
          title="Professional Certifications & Accreditations"
          subtitle="Accredited qualifications verified for statutory compliance scoring"
        >
          {(!targetUser.certifications || targetUser.certifications.length === 0) ? (
            <div className="py-6 text-center text-xs text-[#64748B]">
              No certifications on record.
            </div>
          ) : (
            <div className="space-y-2.5">
              {targetUser.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <Award className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span className="text-xs font-semibold text-[#0F172A]">{cert}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Education */}
        <Card
          title="Academic Degrees & Education"
          subtitle="University degrees required for Form Tech personnel qualifications"
        >
          {(!targetUser.education || targetUser.education.length === 0) ? (
            <div className="py-6 text-center text-xs text-[#64748B]">
              No educational qualifications recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {targetUser.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <GraduationCap className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{edu.degree}</div>
                    <div className="text-[11px] text-[#64748B]">
                      {edu.institution} {edu.year && `• Class of ${edu.year}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Profile Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">
                Edit Personnel Profile: {targetUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Official Corporate Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Internal Department Alignment
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Bid Operations & Strategy">Bid Operations &amp; Strategy</option>
                    <option value="Technical Solutions Architecture">Technical Solutions Architecture</option>
                    <option value="Commercial & Legal Risk Management">Commercial &amp; Legal Risk Management</option>
                    <option value="Commercial Finance">Commercial Finance</option>
                    <option value="Quality Assurance & Auditing">Quality Assurance &amp; Auditing</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Employment Relationship Type
                  </label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        employmentType: e.target.value as EmploymentType,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="PERMANENT">Permanent Core Employee</option>
                    <option value="JV_PARTNER_STAFF">JV Partner Staff</option>
                    <option value="EXTERNAL_CONSULTANT">Dedicated External Consultant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Proposed Tender Designation (Format: Name — Specific Role)
                </label>
                <input
                  type="text"
                  value={editForm.proposedDesignation}
                  placeholder="e.g. Sarah Jenkins — Senior Bid Operations Director & Chief Commercial Strategist"
                  onChange={(e) =>
                    setEditForm({ ...editForm, proposedDesignation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
                <span className="text-[11px] text-[#64748B] mt-0.5 block">
                  This designation will be auto-formatted on Form Tech-1 CVs and tender rosters.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    placeholder="+880 1711-000000"
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Physical Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    placeholder="Dhaka, Bangladesh"
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Max Concurrent Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={editForm.maxCapacity}
                    onChange={(e) =>
                      setEditForm({ ...editForm, maxCapacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 border border-[#CBD5E1] rounded-lg font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {isAddAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">
                Add Past Project Assignment: {targetUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAssignmentModalOpen(false)}
                className="text-xs text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National e-Procurement Portal Revamp Phase III"
                  value={assignmentForm.projectName}
                  onChange={(e) =>
                    setAssignmentForm({ ...assignmentForm, projectName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Client / Procuring Authority *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Procurement Technical Unit (CPTU)"
                    value={assignmentForm.client}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, client: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Exact Role Held on Project *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Solutions Architect & Technical Authority"
                    value={assignmentForm.role}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Duration Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2023 - Nov 2023"
                    value={assignmentForm.duration}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0F172A] block mb-1">
                    Deployment Duration (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={assignmentForm.deploymentMonths}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        deploymentMonths: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Key Deliverables (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. High-Security Tender Gateway, Bid Evaluation Engine, Biometric Clearance API"
                  value={assignmentForm.keyDeliverables}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      keyDeliverables: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Technologies / Standards Utilized (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FastAPI, PostgreSQL, HSM Cryptography, Docker, React"
                  value={assignmentForm.technologiesUsed}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      technologiesUsed: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Core Responsibilities &amp; Impact Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize key responsibilities, leadership scope, and concrete achievements on this assignment..."
                  value={assignmentForm.coreResponsibilities}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      coreResponsibilities: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="px-3.5 py-2 border border-[#CBD5E1] rounded-lg font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B]"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
