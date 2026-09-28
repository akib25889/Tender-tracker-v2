import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import {
  UserProfile,
  PastProjectAssignment,
  EmploymentType,
  UserRole,
  UserActivityItem,
} from '../types/tender';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  GraduationCap,
  Award,
  UserCheck,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Camera,
  Upload,
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Filter,
  Search,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import {
  exportPersonnelDossierAsExcel,
} from '../utils/exportUtils';

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
    getUserActivities,
  } = useTenders();

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Tab navigation detection (Req #31)
  const activeTab: 'overview' | 'projects' | 'activities' = useMemo(() => {
    if (location.pathname.endsWith('/projects') || searchParams.get('tab') === 'projects') {
      return 'projects';
    }
    if (location.pathname.endsWith('/activities') || searchParams.get('tab') === 'activities') {
      return 'activities';
    }
    return 'overview';
  }, [location.pathname, searchParams]);

  const handleTabChange = (tab: 'overview' | 'projects' | 'activities') => {
    const basePrefix = userId ? `/profile/${userId}` : '/profile';
    if (tab === 'projects') {
      navigate(`${basePrefix}/projects`);
    } else if (tab === 'activities') {
      navigate(`${basePrefix}/activities`);
    } else {
      navigate(basePrefix);
    }
  };

  // Activity Feed State
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  // Dedicated Projects View Filters
  const [projectSearch, setProjectSearch] = useState('');
  const [projectRoleFilter, setProjectRoleFilter] = useState<'ALL' | 'LEAD' | 'REVIEWER' | 'CONTRIBUTOR'>('ALL');

  // Active profile being viewed
  const targetUser: UserProfile =
    (userId ? teamMembers.find((m) => m.id === userId) : null) ||
    currentUser ||
    teamMembers[0];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: targetUser.name || '',
    profilePic: targetUser.profilePic || '',
    title: targetUser.title || '',
    department: targetUser.department || 'Bid Operations & Strategy',
    phone: targetUser.phone || '',
    location: targetUser.location || 'Dhaka, Bangladesh',
    employmentType: (targetUser.employmentType || 'PERMANENT') as EmploymentType,
    proposedDesignation: targetUser.proposedDesignation || '',
    maxCapacity: targetUser.maxCapacity || 5,
  });

  useEffect(() => {
    setEditForm({
      name: targetUser.name || '',
      profilePic: targetUser.profilePic || '',
      title: targetUser.title || '',
      department: targetUser.department || 'Bid Operations & Strategy',
      phone: targetUser.phone || '',
      location: targetUser.location || 'Dhaka, Bangladesh',
      employmentType: (targetUser.employmentType || 'PERMANENT') as EmploymentType,
      proposedDesignation: targetUser.proposedDesignation || '',
      maxCapacity: targetUser.maxCapacity || 5,
    });
  }, [targetUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB. Please choose a smaller image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setEditForm((prev) => ({ ...prev, profilePic: result }));
      }
    };
    reader.readAsDataURL(file);
  };

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

  // Track Record pagination / progressive loading (initial 3)
  const [visibleAssignmentsCount, setVisibleAssignmentsCount] = useState(3);

  useEffect(() => {
    setVisibleAssignmentsCount(3);
  }, [targetUser.id]);

  const allAssignments = targetUser.pastAssignments || [];
  const displayedAssignments = allAssignments.slice(0, visibleAssignmentsCount);
  const hasMoreAssignments = allAssignments.length > visibleAssignmentsCount;

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

  // Fetch activities from context / backend
  useEffect(() => {
    let isMounted = true;
    setIsLoadingActivities(true);
    getUserActivities(targetUser.id, targetUser.name).then((res) => {
      if (isMounted) {
        setActivities(res);
        setIsLoadingActivities(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [targetUser.id, targetUser.name, getUserActivities]);

  // Filtered projects for dedicated Projects view
  const filteredProjects = useMemo(() => {
    return activeTenders.filter((t) => {
      const roleInMap = targetUser.activeTenderRoles && targetUser.activeTenderRoles[t.id];
      const isLead = (t.leadOwner?.name || '').toLowerCase().includes(memberName);
      const isReviewer = roleInMap === 'REVIEWER';

      if (projectRoleFilter === 'LEAD' && !(roleInMap === 'LEAD_MANAGER' || isLead)) return false;
      if (projectRoleFilter === 'REVIEWER' && !isReviewer) return false;
      if (projectRoleFilter === 'CONTRIBUTOR' && (isLead || roleInMap === 'LEAD_MANAGER' || isReviewer)) return false;

      if (projectSearch.trim()) {
        const q = projectSearch.toLowerCase();
        const matches =
          (t.title || '').toLowerCase().includes(q) ||
          (t.id || '').toLowerCase().includes(q) ||
          (t.referenceNo || '').toLowerCase().includes(q) ||
          (t.organization || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [activeTenders, targetUser.activeTenderRoles, memberName, projectRoleFilter, projectSearch]);

  // Filtered activities for dedicated Activities view
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (activityFilter !== 'ALL' && act.type !== activityFilter) return false;
      return true;
    });
  }, [activities, activityFilter]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editForm.name.trim();
    const initials =
      cleanName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || targetUser.avatar || 'TM';

    await updateUserProfile(targetUser.id, {
      name: cleanName,
      avatar: initials,
      profilePic: editForm.profilePic.trim(),
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
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
        <div className="flex items-center gap-2 shrink-0 flex-wrap">

          <button
            type="button"
            onClick={() => {
              setEditForm({
                name: targetUser.name || '',
                profilePic: targetUser.profilePic || '',
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Profile Info</span>
          </button>
        </div>
      </div>


      {/* PROFILE WORKSPACE NAVIGATION TABS (Req #31) */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Dossier &amp; Credentials</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('projects')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Projects I Work On</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
            activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
          }`}>
            {activeTenders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('activities')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>All My Activities</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
            activeTab === 'activities' ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
          }`}>
            {activities.length}
          </span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* PILLAR 1: User Identity & Core Profile Card */}
          <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Identity & Core Badges */}
              <div className="flex items-start gap-4">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-4 ring-[#F1F5F9] bg-[#0F172A] flex items-center justify-center">
                    {targetUser.profilePic ? (
                      <img
                        src={targetUser.profilePic}
                        alt={targetUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#0F172A] to-[#334155] text-white flex items-center justify-center text-xl font-display font-bold">
                        {targetUser.avatar || targetUser.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        name: targetUser.name || '',
                        profilePic: targetUser.profilePic || '',
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
                    className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium"
                    title="Change profile picture"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Edit Photo</span>
                  </button>
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
                <button
                  type="button"
                  onClick={() => handleTabChange('projects')}
                  className="text-center px-3 border-r border-[#E2E8F0] hover:bg-white rounded-lg p-1 transition-colors cursor-pointer"
                  title="View all projects I work on"
                >
                  <div className="text-xs text-[#64748B] font-medium">Live Tenders</div>
                  <div className="text-lg font-bold font-mono text-[#0F172A] hover:text-[#2563EB]">
                    {activeTenders.length}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivityFilter('TASK');
                    handleTabChange('activities');
                  }}
                  className="text-center px-3 border-r border-[#E2E8F0] hover:bg-white rounded-lg p-1 transition-colors cursor-pointer"
                  title="View my active tasks and activity log"
                >
                  <div className="text-xs text-[#64748B] font-medium">Active Tasks</div>
                  <div className="text-lg font-bold font-mono text-[#2563EB]">
                    {assignedTasks.length}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('overview')}
                  className="text-center px-3 hover:bg-white rounded-lg p-1 transition-colors cursor-pointer"
                  title="View verified track record"
                >
                  <div className="text-xs text-[#64748B] font-medium">Track Record</div>
                  <div className="text-lg font-bold font-mono text-[#16A34A]">
                    {(targetUser.pastAssignments || []).length} Bids
                  </div>
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
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#2563EB]" />
                <span>Professional Track Record &amp; Past Project Assignments</span>
              </h3>
              {allAssignments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  {allAssignments.length} Recorded
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              Verified project history for Form Tech-1 CV generation, past performance scoring, and procuring authority qualification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {allAssignments.length > 0 && (
              <button
                type="button"
                onClick={() => exportPersonnelDossierAsExcel(targetUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-xs cursor-pointer"
                title="Download assignments ledger as Excel spreadsheet (.csv)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Export Ledger (.csv)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAddAssignmentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project Assignment</span>
            </button>
          </div>
        </div>

        {/* Assignments Ledger */}
        {allAssignments.length === 0 ? (
          <Card className="py-8 text-center text-[#64748B] text-xs">
            No past project assignments recorded. Click "Add Project Assignment" to build this specialist's tender track record.
          </Card>
        ) : (
          <div className="space-y-3">
            {displayedAssignments.map((assignment, idx) => (
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
                    className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors self-start shrink-0 cursor-pointer"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}

            {/* Load More & Pagination Controls */}
            {hasMoreAssignments && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B]">
                  Showing <strong className="text-[#0F172A]">{displayedAssignments.length}</strong> of{' '}
                  <strong className="text-[#0F172A]">{allAssignments.length}</strong> project assignments (Initial 3 loaded)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleAssignmentsCount((prev) => prev + 3)}
                    className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded-lg text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Load More (+3)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleAssignmentsCount(allAssignments.length)}
                    className="px-3 py-1.5 text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
                  >
                    Show All ({allAssignments.length})
                  </button>
                </div>
              </div>
            )}

            {!hasMoreAssignments && allAssignments.length > 3 && (
              <div className="pt-2 flex items-center justify-between text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <span>
                  Showing all <strong className="text-[#0F172A]">{allAssignments.length}</strong> project assignments
                </span>
                <button
                  type="button"
                  onClick={() => setVisibleAssignmentsCount(3)}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Collapse to Initial 3</span>
                </button>
              </div>
            )}
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
      </div>
      )}

      {/* TAB 2: PROJECTS I WORK ON (Req #31) */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                Assigned Tender Projects
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#0F172A]">{activeTenders.length}</span>
                <Briefcase className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block">Live procurement workspaces</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                Lead Proposal Manager
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#B45309]">
                  {activeTenders.filter(t => (t.leadOwner?.name || '').toLowerCase().includes(memberName) || (targetUser.activeTenderRoles && targetUser.activeTenderRoles[t.id] === 'LEAD_MANAGER')).length}
                </span>
                <UserCheck className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block">Sole delivery ownership</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                Compliance Reviewer
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#059669]">
                  {activeTenders.filter(t => targetUser.activeTenderRoles && targetUser.activeTenderRoles[t.id] === 'REVIEWER').length}
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block">Quality gatekeeper</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                Pending Assigned Tasks
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[#DC2626]">
                  {assignedTasks.length}
                </span>
                <Clock className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block">Awaiting completion</span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects by ID, title, authority or ref..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              {projectSearch && (
                <button
                  type="button"
                  onClick={() => setProjectSearch('')}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[#64748B] font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Role:</span>
              </span>
              {[
                { key: 'ALL', label: 'All Roles' },
                { key: 'LEAD', label: 'Lead Manager' },
                { key: 'REVIEWER', label: 'Reviewer' },
                { key: 'CONTRIBUTOR', label: 'Technical Contributor' },
              ].map((rf) => (
                <button
                  key={rf.key}
                  type="button"
                  onClick={() => setProjectRoleFilter(rf.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    projectRoleFilter === rf.key
                      ? 'bg-[#0F172A] text-white shadow-2xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length === 0 ? (
            <Card className="py-12 text-center text-[#64748B] text-xs space-y-2">
              <Briefcase className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[#0F172A]">No projects match your current filter.</p>
              <p>Try clearing your search query or switching role filters.</p>
              {projectSearch && (
                <button
                  type="button"
                  onClick={() => setProjectSearch('')}
                  className="mt-2 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((tender) => {
                const roleInMap = targetUser.activeTenderRoles && targetUser.activeTenderRoles[tender.id];
                const isLead = (tender.leadOwner?.name || '').toLowerCase().includes(memberName);
                const isReviewer = roleInMap === 'REVIEWER';

                const userTasks = (tender.tasks || []).filter((tsk) =>
                  (tsk.assignee || '').toLowerCase().includes(memberName)
                );
                const doneTasks = userTasks.filter(t => t.status === 'DONE').length;

                return (
                  <div
                    key={tender.id}
                    className="bg-white border border-[#E2E8F0] hover:border-[#94A3B8] p-5 rounded-2xl flex flex-col justify-between transition-all shadow-xs hover:shadow-md group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                          {tender.referenceNo || tender.id}
                        </span>
                        {isLead || roleInMap === 'LEAD_MANAGER' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                            Lead Proposal Manager
                          </span>
                        ) : isReviewer ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                            Quality Reviewer
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                            Core Contributor
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/tenders/${tender.id}`}
                        className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] line-clamp-2 leading-snug transition-colors"
                      >
                        {tender.title}
                      </Link>

                      <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{tender.organization || 'Procuring Authority'}</span>
                        {tender.country && <span>• {tender.country}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9] text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Est. Value</span>
                          <span className="font-mono font-bold text-[#0F172A]">
                            {formatCurrency(tender.estimatedValue || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Stage</span>
                          <span className="font-semibold text-[#2563EB]">
                            {tender.stage?.replace(/_/g, ' ') || 'ACTIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#64748B]">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Deadline:</span>
                        </div>
                        <span className="font-mono font-medium text-[#0F172A] text-[11px]">
                          {tender.submissionDeadline || 'TBD'}
                        </span>
                      </div>

                      {userTasks.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#475569]">My Assigned Tasks</span>
                            <span className="font-mono font-bold text-[#2563EB]">
                              {doneTasks} / {userTasks.length} Done
                            </span>
                          </div>
                          <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-1.5 rounded-full transition-all"
                              style={{ width: `${(doneTasks / userTasks.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                      <Link
                        to={`/tenders/${tender.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Open Proposal Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL MY ACTIVITIES (Req #31) */}
      {activeTab === 'activities' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Activities Summary Banner */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-300 mb-1">
                <Activity className="w-4 h-4" />
                <span>Personnel Operational Audit Log</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Activity Stream &amp; Audit Ledger: {targetUser.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Chronological record of task updates, tender submissions, document uploads, reviewer comments, and security role modifications.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 shrink-0">
              <div className="text-center px-3 border-r border-white/20">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Total Actions</div>
                <div className="text-xl font-bold font-mono text-white">{activities.length}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-slate-300 uppercase font-semibold">Submissions</div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {activities.filter(a => a.type === 'SUBMISSION').length}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-[#64748B] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            {[
              { key: 'ALL', label: `All Activities (${activities.length})` },
              { key: 'TASK', label: `Tasks (${activities.filter(a => a.type === 'TASK').length})` },
              { key: 'SUBMISSION', label: `Submissions (${activities.filter(a => a.type === 'SUBMISSION').length})` },
              { key: 'DOCUMENT', label: `Vault & Files (${activities.filter(a => a.type === 'DOCUMENT').length})` },
              { key: 'COMMENT', label: `Comments & Chat (${activities.filter(a => a.type === 'COMMENT').length})` },
              { key: 'PERMISSION', label: `Permissions (${activities.filter(a => a.type === 'PERMISSION').length})` },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActivityFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activityFilter === f.key
                    ? 'bg-[#0F172A] text-white shadow-2xs'
                    : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity Timeline List */}
          {isLoadingActivities ? (
            <div className="py-12 text-center text-[#64748B] text-xs">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2563EB]" />
              <span>Compiling live chronological activity stream...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card className="py-12 text-center text-[#64748B] text-xs">
              <Activity className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[#0F172A]">No activity entries recorded for this filter.</p>
              <p className="mt-1">Actions taken on tender tasks, proposal documents, submissions, or chat will automatically be indexed here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act) => {
                const isSubmission = act.type === 'SUBMISSION';
                const isTask = act.type === 'TASK';
                const isDoc = act.type === 'DOCUMENT';
                const isComment = act.type === 'COMMENT';

                const IconComponent = isSubmission
                  ? CheckCircle2
                  : isTask
                  ? Clock
                  : isDoc
                  ? FileText
                  : isComment
                  ? MessageSquare
                  : ShieldCheck;

                const iconBg = isSubmission
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : isTask
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : isDoc
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : isComment
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div
                    key={act.id}
                    className="p-4 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all shadow-xs flex items-start gap-4"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {act.action}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                            {act.type}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#94A3B8] shrink-0">
                          {act.timestamp ? new Date(act.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>

                      {act.tenderId && (
                        <div className="text-xs text-[#2563EB] font-medium flex items-center gap-1.5">
                          <Link to={`/tenders/${act.tenderId}`} className="hover:underline flex items-center gap-1">
                            <span className="font-mono font-bold">{act.tenderId}</span>
                            {act.tenderTitle && <span>• {act.tenderTitle}</span>}
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </Link>
                        </div>
                      )}

                      {act.details && (
                        <p className="text-xs text-[#64748B] pt-0.5 leading-relaxed">
                          {act.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
              {/* Profile Picture Upload & Preview */}
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#0F172A] block text-xs">
                    Profile Picture
                  </label>
                  {editForm.profilePic && (
                    <button
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, profilePic: '' }))}
                      className="text-[11px] text-[#DC2626] hover:underline font-medium cursor-pointer"
                    >
                      Reset to Initials
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#0F172A] ring-2 ring-[#E2E8F0] shadow-sm shrink-0 flex items-center justify-center">
                    {editForm.profilePic ? (
                      <img
                        src={editForm.profilePic}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#0F172A] to-[#334155] text-white flex items-center justify-center text-lg font-display font-bold">
                        {editForm.name.slice(0, 2).toUpperCase() || 'TM'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded-lg font-semibold text-xs text-[#0F172A] cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-[#64748B]">PNG, JPG or WebP (max 5MB)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={editForm.profilePic}
                        onChange={(e) => setEditForm({ ...editForm, profilePic: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={editForm.department}
                      placeholder="e.g. Bid Operations & Strategy"
                      onChange={(e) =>
                        setEditForm({ ...editForm, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Bid Operations & Strategy',
                        'Technical Solutions Architecture',
                        'Commercial & Legal Risk Management',
                        'Commercial Finance',
                        'Quality Assurance & Auditing',
                      ].map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, department: dept })}
                          className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                            editForm.department === dept
                              ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          {dept.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
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
