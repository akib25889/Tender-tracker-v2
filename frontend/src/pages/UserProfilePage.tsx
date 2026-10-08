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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>Personnel &amp; Governance</span>
            <span>•</span>
            <span className="font-semibold text-[var(--text-primary)]">Key Personnel Dossier</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[var(--accent)]" />
            <span>Personnel Dossier &amp; Profile Hub</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Edit Profile Info</span>
          </button>
        </div>
      </div>


      {/* PROFILE WORKSPACE NAVIGATION TABS (Req #31) */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
 activeTab === 'overview'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
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
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Projects I Work On</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
 activeTab === 'projects' ? 'bg-[var(--bg-surface)]/20 text-[var(--accent-on)]' : 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]'
 }`}>
            {activeTenders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('activities')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
 activeTab === 'activities'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>All My Activities</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
 activeTab === 'activities' ? 'bg-[var(--bg-surface)]/20 text-[var(--accent-on)]' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]'
 }`}>
            {activities.length}
          </span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* PILLAR 1: User Identity & Core Profile Card */}
          <Card className="p-6 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Identity & Core Badges */}
              <div className="flex items-start gap-4">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-4 ring-[var(--border-subtle)] bg-[var(--accent)] flex items-center justify-center">
                    {targetUser.profilePic ? (
                      <img
                        src={targetUser.profilePic}
                        alt={targetUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-on)] flex items-center justify-center text-xl font-display font-bold">
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
                    className="absolute inset-0 bg-[var(--text-primary)]/50 rounded-2xl flex flex-col items-center justify-center text-[var(--accent-on)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium"
                    title="Change profile picture"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Edit Photo</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                      {targetUser.name}
                    </h2>
                    {/* System Role Badge */}
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                      {ROLE_DISPLAY[targetUser.role] || targetUser.role}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {targetUser.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{targetUser.department || 'Bid Operations & Strategy'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <a
                        href={`mailto:${targetUser.email}`}
                        className="hover:underline text-[var(--text-primary)] font-medium"
                      >
                        {targetUser.email}
                      </a>
                    </div>
                    {targetUser.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span className="text-[var(--text-primary)] font-medium">
                          {targetUser.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>{targetUser.location || 'Dhaka, Bangladesh'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Summary */}
              <div className="flex items-center gap-3 self-start lg:self-auto bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => handleTabChange('projects')}
                  className="text-center px-3 border-r border-[var(--border-default)] hover:bg-[var(--bg-surface)] rounded-lg p-1 transition-colors cursor-pointer"
                  title="View all projects I work on"
                >
                  <div className="text-xs text-[var(--text-secondary)] font-medium">Live Tenders</div>
                  <div className="text-lg font-bold font-mono text-[var(--text-primary)] hover:text-[var(--accent)]">
                    {activeTenders.length}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivityFilter('TASK');
                    handleTabChange('activities');
                  }}
                  className="text-center px-3 border-r border-[var(--border-default)] hover:bg-[var(--bg-surface)] rounded-lg p-1 transition-colors cursor-pointer"
                  title="View my active tasks and activity log"
                >
                  <div className="text-xs text-[var(--text-secondary)] font-medium">Active Tasks</div>
                  <div className="text-lg font-bold font-mono text-[var(--accent)]">
                    {assignedTasks.length}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('overview')}
                  className="text-center px-3 hover:bg-[var(--bg-surface)] rounded-lg p-1 transition-colors cursor-pointer"
                  title="View verified track record"
                >
                  <div className="text-xs text-[var(--text-secondary)] font-medium">Track Record</div>
                  <div className="text-lg font-bold font-mono text-[var(--ok)]">
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
          <div className="py-8 text-center text-[var(--text-secondary)] text-xs">
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn-line)]">
                    Lead Proposal Manager
                  </span>
                ) : roleInMap === 'REVIEWER' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)]">
                    Quality &amp; Compliance Reviewer
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                    Core Technical Contributor
                  </span>
                );

              const userTasks = (tender.tasks || []).filter((tsk) =>
                (tsk.assignee || '').toLowerCase().includes(memberName)
              );

              return (
                <div
                  key={tender.id}
                  className="bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--border-strong)] p-4 rounded-xl flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--accent)]">
                        {tender.referenceNo || tender.id}
                      </span>
                      {userRoleBadge}
                    </div>

                    <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
                      {tender.title}
                    </h4>

                    <div className="text-[11px] text-[var(--text-secondary)]">
                      {tender.organization || 'Procuring Authority'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-default)]/60">
                      <span className="text-[var(--text-secondary)]">Est. Value</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(tender.estimatedValue || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">Submission Deadline</span>
                      <span className="font-mono text-[var(--text-primary)] font-medium">
                        {tender.submissionDeadline || 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">Active Assigned Tasks</span>
                      <span className="font-mono font-bold text-[var(--accent)]">
                        {userTasks.length} Tasks
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[var(--border-default)]">
                    <button
                      type="button"
                      onClick={() => navigate(`/tenders/${tender.id}`)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] hover:border-[var(--accent)] rounded-lg text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs"
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
              <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--accent)]" />
                <span>Professional Track Record &amp; Past Project Assignments</span>
              </h3>
              {allAssignments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                  {allAssignments.length} Recorded
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Verified project history for Form Tech-1 CV generation, past performance scoring, and procuring authority qualification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {allAssignments.length > 0 && (
              <button
                type="button"
                onClick={() => exportPersonnelDossierAsExcel(targetUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shadow-xs cursor-pointer"
                title="Download assignments ledger as Excel spreadsheet (.csv)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Export Ledger (.csv)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAddAssignmentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project Assignment</span>
            </button>
          </div>
        </div>

        {/* Assignments Ledger */}
        {allAssignments.length === 0 ? (
          <Card className="py-8 text-center text-[var(--text-secondary)] text-xs">
            No past project assignments recorded. Click "Add Project Assignment" to build this specialist's tender track record.
          </Card>
        ) : (
          <div className="space-y-3">
            {displayedAssignments.map((assignment, idx) => (
              <Card
                key={assignment.id || idx}
                className="p-5 border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {assignment.projectName}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                        {assignment.role}
                      </span>
                      {assignment.deploymentMonths && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                          {assignment.deploymentMonths} Months Deployed
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                      <span>
                        <strong>Client:</strong> {assignment.client}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--text-secondary)]" />
                        <span>{assignment.duration}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                      {assignment.coreResponsibilities}
                    </p>

                    {/* Key Deliverables */}
                    {assignment.keyDeliverables && assignment.keyDeliverables.length > 0 && (
                      <div className="space-y-1 pt-1.5">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                          Key Deliverables:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {assignment.keyDeliverables.map((deliv, dIdx) => (
                            <span
                              key={dIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]"
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
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                          Technologies &amp; Tools:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {assignment.technologiesUsed.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)]"
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
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--crit)] hover:bg-[var(--crit-soft)] rounded-lg transition-colors self-start shrink-0 cursor-pointer"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}

            {/* Load More & Pagination Controls */}
            {hasMoreAssignments && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-secondary)]">
                  Showing <strong className="text-[var(--text-primary)]">{displayedAssignments.length}</strong> of{' '}
                  <strong className="text-[var(--text-primary)]">{allAssignments.length}</strong> project assignments (Initial 3 loaded)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleAssignmentsCount((prev) => prev + 3)}
                    className="px-3.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-lg text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Load More (+3)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleAssignmentsCount(allAssignments.length)}
                    className="px-3 py-1.5 text-xs text-[var(--accent)] hover:underline font-semibold cursor-pointer"
                  >
                    Show All ({allAssignments.length})
                  </button>
                </div>
              </div>
            )}

            {!hasMoreAssignments && allAssignments.length > 3 && (
              <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-secondary)] bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-default)]">
                <span>
                  Showing all <strong className="text-[var(--text-primary)]">{allAssignments.length}</strong> project assignments
                </span>
                <button
                  type="button"
                  onClick={() => setVisibleAssignmentsCount(3)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
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
            <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
              No certifications on record.
            </div>
          ) : (
            <div className="space-y-2.5">
              {targetUser.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)]"
                >
                  <Award className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{cert}</span>
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
            <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
              No educational qualifications recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {targetUser.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)]"
                >
                  <GraduationCap className="w-4 h-4 text-[var(--ok)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">{edu.degree}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
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
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                Assigned Tender Projects
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">{activeTenders.length}</span>
                <Briefcase className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Live procurement workspaces</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                Lead Proposal Manager
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[var(--warn)]">
                  {activeTenders.filter(t => (t.leadOwner?.name || '').toLowerCase().includes(memberName) || (targetUser.activeTenderRoles && targetUser.activeTenderRoles[t.id] === 'LEAD_MANAGER')).length}
                </span>
                <UserCheck className="w-5 h-5 text-[var(--warn)]" />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Sole delivery ownership</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                Compliance Reviewer
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[var(--ok)]">
                  {activeTenders.filter(t => targetUser.activeTenderRoles && targetUser.activeTenderRoles[t.id] === 'REVIEWER').length}
                </span>
                <ShieldCheck className="w-5 h-5 text-[var(--ok)]" />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Quality gatekeeper</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                Pending Assigned Tasks
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-[var(--crit)]">
                  {assignedTasks.length}
                </span>
                <Clock className="w-5 h-5 text-[var(--crit)]" />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Awaiting completion</span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects by ID, title, authority or ref..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              {projectSearch && (
                <button
                  type="button"
                  onClick={() => setProjectSearch('')}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[var(--text-secondary)] font-medium mr-1 flex items-center gap-1">
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
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-2xs'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length === 0 ? (
            <Card className="py-12 text-center text-[var(--text-secondary)] text-xs space-y-2">
              <Briefcase className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[var(--text-primary)]">No projects match your current filter.</p>
              <p>Try clearing your search query or switching role filters.</p>
              {projectSearch && (
                <button
                  type="button"
                  onClick={() => setProjectSearch('')}
                  className="mt-2 px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
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
                    className="bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-strong)] p-5 rounded-2xl flex flex-col justify-between transition-all shadow-xs hover:shadow-md group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded border border-[var(--accent-line)]">
                          {tender.referenceNo || tender.id}
                        </span>
                        {isLead || roleInMap === 'LEAD_MANAGER' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn-line)]">
                            Lead Proposal Manager
                          </span>
                        ) : isReviewer ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)]">
                            Quality Reviewer
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                            Core Contributor
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/tenders/${tender.id}`}
                        className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-2 leading-snug transition-colors"
                      >
                        {tender.title}
                      </Link>

                      <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{tender.organization || 'Procuring Authority'}</span>
                        {tender.country && <span>• {tender.country}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Est. Value</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            {formatCurrency(tender.estimatedValue || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Stage</span>
                          <span className="font-semibold text-[var(--accent)]">
                            {tender.stage?.replace(/_/g, ' ') || 'ACTIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Clock className="w-3.5 h-3.5 text-[var(--warn)]" />
                          <span>Deadline:</span>
                        </div>
                        <span className="font-mono font-medium text-[var(--text-primary)] text-[11px]">
                          {tender.submissionDeadline || 'TBD'}
                        </span>
                      </div>

                      {userTasks.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[var(--text-secondary)]">My Assigned Tasks</span>
                            <span className="font-mono font-bold text-[var(--accent)]">
                              {doneTasks} / {userTasks.length} Done
                            </span>
                          </div>
                          <div className="w-full bg-[var(--bg-muted)] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[var(--accent)] h-1.5 rounded-full transition-all"
                              style={{ width: `${(doneTasks / userTasks.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-[var(--border-default)]">
                      <Link
                        to={`/tenders/${tender.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Open Proposal Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
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
          <div className="p-5 bg-gradient-to-r from-[var(--bg-muted)] to-[var(--bg-muted)] text-[var(--accent-on)] rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--accent)] mb-1">
                <Activity className="w-4 h-4" />
                <span>Personnel Operational Audit Log</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Activity Stream &amp; Audit Ledger: {targetUser.name}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                Chronological record of task updates, tender submissions, document uploads, reviewer comments, and security role modifications.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[var(--bg-surface)]/10 backdrop-blur-xs p-2.5 rounded-xl border border-[var(--accent-on)]/10 shrink-0">
              <div className="text-center px-3 border-r border-[var(--accent-on)]/20">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Total Actions</div>
                <div className="text-xl font-bold font-mono text-[var(--accent-on)]">{activities.length}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Submissions</div>
                <div className="text-xl font-bold font-mono text-[var(--ok)]">
                  {activities.filter(a => a.type === 'SUBMISSION').length}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-[var(--text-secondary)] font-medium mr-1 flex items-center gap-1">
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
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-2xs'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity Timeline List */}
          {isLoadingActivities ? (
            <div className="py-12 text-center text-[var(--text-secondary)] text-xs">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent)]" />
              <span>Compiling live chronological activity stream...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card className="py-12 text-center text-[var(--text-secondary)] text-xs">
              <Activity className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm text-[var(--text-primary)]">No activity entries recorded for this filter.</p>
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
                  ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]'
                  : isTask
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]'
                  : isDoc
                  ? 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]'
                  : isComment
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-default)]';

                return (
                  <div
                    key={act.id}
                    className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all shadow-xs flex items-start gap-4"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {act.action}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                            {act.type}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                          {act.timestamp ? new Date(act.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>

                      {act.tenderId && (
                        <div className="text-xs text-[var(--accent)] font-medium flex items-center gap-1.5">
                          <Link to={`/tenders/${act.tenderId}`} className="hover:underline flex items-center gap-1">
                            <span className="font-mono font-bold">{act.tenderId}</span>
                            {act.tenderTitle && <span>• {act.tenderTitle}</span>}
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </Link>
                        </div>
                      )}

                      {act.details && (
                        <p className="text-xs text-[var(--text-secondary)] pt-0.5 leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-primary)]/50 p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--border-default)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Edit Personnel Profile: {targetUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Profile Picture Upload & Preview */}
              <div className="p-3.5 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[var(--text-primary)] block text-xs">
                    Profile Picture
                  </label>
                  {editForm.profilePic && (
                    <button
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, profilePic: '' }))}
                      className="text-[11px] text-[var(--crit)] hover:underline font-medium cursor-pointer"
                    >
                      Reset to Initials
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--accent)] ring-2 ring-[var(--border-default)] shadow-sm shrink-0 flex items-center justify-center">
                    {editForm.profilePic ? (
                      <img
                        src={editForm.profilePic}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-on)] flex items-center justify-center text-lg font-display font-bold">
                        {editForm.name.slice(0, 2).toUpperCase() || 'TM'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-lg font-semibold text-xs text-[var(--text-primary)] cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-[var(--text-secondary)]">PNG, JPG or WebP (max 5MB)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={editForm.profilePic}
                        onChange={(e) => setEditForm({ ...editForm, profilePic: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
                    Official Corporate Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                      className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
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
 ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] font-bold'
                              : 'bg-[var(--bg-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                          }`}
                        >
                          {dept.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="PERMANENT">Permanent Core Employee</option>
                    <option value="JV_PARTNER_STAFF">JV Partner Staff</option>
                    <option value="EXTERNAL_CONSULTANT">Dedicated External Consultant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">
                  Proposed Tender Designation (Format: Name — Specific Role)
                </label>
                <input
                  type="text"
                  value={editForm.proposedDesignation}
                  placeholder="e.g. Sarah Jenkins — Senior Bid Operations Director & Chief Commercial Strategist"
                  onChange={(e) =>
                    setEditForm({ ...editForm, proposedDesignation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                  This designation will be auto-formatted on Form Tech-1 CVs and tender rosters.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    placeholder="+880 1711-000000"
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
                    Physical Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    placeholder="Dhaka, Bangladesh"
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 border border-[var(--border-strong)] rounded-lg font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg font-semibold hover:bg-[var(--accent-hover)]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-primary)]/50 p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--border-default)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Add Past Project Assignment: {targetUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAssignmentModalOpen(false)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                  className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
                    Duration Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2023 - Nov 2023"
                    value={assignmentForm.duration}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                    className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                  className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                  className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">
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
                  className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="px-3.5 py-2 border border-[var(--border-strong)] rounded-lg font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-on)] rounded-lg font-semibold hover:bg-[var(--accent-hover)]"
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
