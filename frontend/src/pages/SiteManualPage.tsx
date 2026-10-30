import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import {
  BookOpen,
  Search,
  Printer,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  CheckCircle2,
  Layers,
  ShieldCheck,
  FileCheck,
  CalendarDays,
  Users,
  Building2,
  Sparkles,
  Compass,
  X,
  ClipboardList,
  FolderGit2,
  BarChart3,
  UserCheck,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface ManualSection {
  id: string;
  number: string;
  title: string;
  category: 'Core' | 'Tender Lifecycle' | 'Libraries' | 'Admin & System';
  route?: string;
  icon: any;
  summary: string;
  screenshots: {
    src: string;
    caption: string;
  }[];
  keyPoints: string[];
  instructions: {
    step: string;
    desc: string;
  }[];
  tips?: string[];
}

const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'principles',
    number: '01',
    title: 'Architecture & Core Principles',
    category: 'Core',
    icon: ShieldCheck,
    summary:
      'High-reliability enterprise tender management platform designed for prime contractors, engineering firms, software consortiums, and procurement specialists.',
    screenshots: [
      {
        src: '/screenshots/02-dashboard.png',
        caption: 'Command Center Mission Control with live bidding metrics and 10-second urgency cues',
      },
    ],
    keyPoints: [
      'The 10-Second Rule: Instantly identify overdue tasks, missing documents, and approaching deadlines within 10 seconds.',
      'Segregation of Lifecycle Stage vs. Go/No-Go: Operational pipeline stages are decoupled from commercial feasibility decisions.',
      'Zero-Cloud Local Storage Vault: All files, work orders, and credentials stay securely on local disk storage with SHA-256 hashes.',
      'Anti-Leakage Partner Isolation: Joint Venture (JV) partners only see authorized credentials and folders, protecting lead bidder IP.',
    ],
    instructions: [
      {
        step: '1. Access System',
        desc: 'Log in with your corporate credential. The system opens directly into your role-specific dashboard with dual timezones (BD Standard Time and UTC).',
      },
      {
        step: '2. Review Critical Alerts',
        desc: 'Scan the Urgent Attention Sentinel at the top to clear red-flagged bids before beginning normal workflow tasks.',
      },
    ],
    tips: [
      'Dual-mode database architecture enables zero-config local SQLite for testing and instantaneous cutover to MySQL 8.0/8.4 for production.',
    ],
  },
  {
    id: 'dashboard',
    number: '02',
    title: 'Command Center Dashboard',
    category: 'Core',
    route: '/dashboard',
    icon: Compass,
    summary:
      'Executive mission control showing live bidding volume, financial metrics, countdown clocks, and instant action items.',
    screenshots: [
      {
        src: '/screenshots/02-dashboard.png',
        caption: 'Dashboard Overview: KPIs, urgent attention sentinel, and active tender ledger',
      },
    ],
    keyPoints: [
      'Active Bids KPI: Real-time count of active tenders currently progressing through preparation.',
      'Pipeline Volume: Aggregate valuation with dual BDT / USD currency conversion.',
      'Critical 48h Deadlines: Real-time countdown of bids with submission or schedule purchase deadlines.',
      'Readiness Score: Automated composite score based on required technical & statutory files.',
    ],
    instructions: [
      {
        step: '1. Inspect Urgent Sentinel',
        desc: 'Cards highlighted in red indicate tenders with missing statutory documents, overdue milestones, or unassigned roles.',
      },
      {
        step: '2. Filter Active Ledger',
        desc: 'Use the quick search or stage chips to isolate tenders by client, SOW category, or submission date.',
      },
      {
        step: '3. Jump to Workspace',
        desc: 'Click anywhere on a tender row to enter that tender’s dedicated 6-gate workspace.',
      },
    ],
    tips: ['The global search bar (Ctrl + K) lets you jump to any tender by reference number or client name instantly.'],
  },
  {
    id: 'pipeline',
    number: '03',
    title: 'Tender Pipeline & Stage Management',
    category: 'Tender Lifecycle',
    route: '/tenders',
    icon: FolderGit2,
    summary:
      'Full pipeline view organized by operational lifecycle stages with advanced filters, bulk actions, and readiness tracking.',
    screenshots: [
      {
        src: '/screenshots/03-tender-list.png',
        caption: 'Pipeline Overview: Filter tenders by Discovered, Screening, Preparation, Review, and Submission',
      },
    ],
    keyPoints: [
      '6 Lifecycle Stages: DISCOVERED → SCREENING → PREPARATION → REVIEW → SUBMITTED → EVALUATION / AWARDED.',
      'Go/No-Go Decision Matrix: Clearly labeled independent status chips (GO, NO-GO, PENDING, UNDER_EVALUATION).',
      'Batch Actions: Export selected bids, archive outdated notices, or reassign primary owners.',
    ],
    instructions: [
      {
        step: '1. Choose Pipeline View',
        desc: 'Toggle between Pipeline Overview or filter by specific stage tabs using the top tabs.',
      },
      {
        step: '2. Filter by Organization',
        desc: 'Filter bids by Procuring Authority (e.g. Bangladesh Bank, Roads & Highways, ICT Division).',
      },
      {
        step: '3. Fast Status Switch',
        desc: 'Update bid stages or commercial Go/No-Go determinations directly from the dropdown menus.',
      },
    ],
  },
  {
    id: 'registry',
    number: '04',
    title: 'Tender Intake & Fast Registry',
    category: 'Tender Lifecycle',
    route: '/registry',
    icon: ClipboardList,
    summary:
      'Streamlined tender registration wizard designed for 2-minute bid onboarding with automated document folder creation.',
    screenshots: [
      {
        src: '/screenshots/04-tender-registry.png',
        caption: 'Fast Registry Form: Intake tender notice, client, financial threshold, and mandatory dates',
      },
      {
        src: '/screenshots/30-registry-summary.png',
        caption: 'Executive Tender Summary: Auto-generated printable brief of newly registered tenders',
      },
    ],
    keyPoints: [
      'Automated Folder Structure: Generates storage/tenders/{TDR-ID}/ folders (Technical, Financial, Statutory, JV, Drafts).',
      'Auto-Injected Default Documents: Standard corporate docs (Trade License, TIN, Tax Clearance) are automatically linked.',
      'Printable Executive Brief: Generate a one-page tender intake summary for committee review.',
    ],
    instructions: [
      {
        step: '1. Open Registry',
        desc: 'Navigate to Tender Registry or click "+ New Tender" in the global header.',
      },
      {
        step: '2. Fill Core Details',
        desc: 'Enter Tender Reference, Title, Procuring Authority, Category, Estimated Value, and Submission Deadline.',
      },
      {
        step: '3. Save & Review',
        desc: 'Click "Register Tender". The system seeds default document requirements and redirects to the Executive Summary.',
      },
    ],
    tips: [
      'All folders created in the storage vault are physically isolated on local disk storage with zero cloud dependencies.',
    ],
  },
  {
    id: 'workspace',
    number: '05',
    title: 'Tender Workspace (6 Lifecycle Gates)',
    category: 'Tender Lifecycle',
    icon: Layers,
    summary:
      'Dedicated collaborative workspace for each tender with 6 functional tabs: Requirements, Tasks, Documents, Partners, Submission, and Result.',
    screenshots: [
      {
        src: '/screenshots/23-tender-detail-overview.png',
        caption: 'Tender Detail Workspace: High-level overview, countdown timers, and gate status',
      },
      {
        src: '/screenshots/24-tender-requirements.png',
        caption: 'Requirements Matrix: Trace technical, legal, and financial RFP clauses',
      },
      {
        src: '/screenshots/25-tender-tasks.png',
        caption: 'Task Kanban: Assign tasks to team members with progress bars and due dates',
      },
      {
        src: '/screenshots/26-tender-documents.png',
        caption: 'Tender Document Vault: Upload, organize into folders, and verify SHA-256 integrity',
      },
      {
        src: '/screenshots/27-tender-partners.png',
        caption: 'JV & Partner Coordination: Manage JV consortia, share agreements, and assign scopes',
      },
      {
        src: '/screenshots/28-tender-submission.png',
        caption: 'Submission Ledger: 4-tier sign-off protocol, physical delivery receipt, and submission hash',
      },
      {
        src: '/screenshots/29-tender-result.png',
        caption: 'Outcome & Win/Loss Debrief: Record awarded bidder, bid price spread, and retrospective lessons',
      },
    ],
    keyPoints: [
      'Sentinel Cards: Live readiness percentage, unassigned tasks, and countdown clock.',
      'Compliance Matrix: Mark requirements as Compliant, Non-Compliant, or Deviated.',
      '4-Tier Sign-Off: Ensures Technical Lead, Legal Counsel, Finance Director, and MD approve before bidding.',
      'Submission Proof: Store courier tracking, submission receipts, and sealed envelope photos.',
    ],
    instructions: [
      {
        step: '1. Tab 1: Requirements',
        desc: 'Break down RFP mandatory qualifications (Turnover, experience, certifications) and assign owners.',
      },
      {
        step: '2. Tab 2: Tasks Kanban',
        desc: 'Distribute preparation tasks (BoQ pricing, methodology, bid security) across your team.',
      },
      {
        step: '3. Tab 3: Documents',
        desc: 'Upload finalized technical and financial proposals into the secure local vault.',
      },
      {
        step: '4. Tab 4: Partners',
        desc: 'If bidding as a Joint Venture, invite partner firms and exchange authorized documents.',
      },
      {
        step: '5. Tab 5: Submission',
        desc: 'Execute final executive sign-offs, log courier / e-GP receipt details, and freeze the bid package.',
      },
      {
        step: '6. Tab 6: Result & Debrief',
        desc: 'Log tender opening results, competitor bid prices, evaluation rank, and post-bid debrief findings.',
      },
    ],
  },
  {
    id: 'tasks',
    number: '06',
    title: 'My Tasks Console & Team Allocation',
    category: 'Core',
    route: '/tasks/my-tasks',
    icon: CheckCircle2,
    summary:
      'Personalized task dashboard and organization-wide capacity radar for managing workload distribution.',
    screenshots: [
      {
        src: '/screenshots/05-my-tasks.png',
        caption: 'My Tasks Console: View pending, in-progress, and completed tasks across all bids',
      },
      {
        src: '/screenshots/11-team-allocation.png',
        caption: 'Team Capacity Radar: Balance workload and active bid allocations across staff members',
      },
    ],
    keyPoints: [
      'Prioritized Task List: Grouped by Urgent (due < 24h), Active, and Completed.',
      'Direct Context Links: Each task links directly back to the parent tender workspace.',
      'Capacity Balancing: Visual indicators highlight overloaded team members to prevent bid deadline burnout.',
    ],
    instructions: [
      {
        step: '1. Review Daily Workload',
        desc: 'Open "My Tasks" from the sidebar to review deliverables assigned to you.',
      },
      {
        step: '2. Update Task Status',
        desc: 'Click on a task status pill to transition from "TODO" → "IN PROGRESS" → "DONE".',
      },
      {
        step: '3. Team Rebalancing',
        desc: 'Managers use "Team & Capacity" (/team) to drag and drop tenders to rebalance staff allocations.',
      },
    ],
  },
  {
    id: 'calendar',
    number: '07',
    title: 'Calendar & Submission Schedule',
    category: 'Core',
    route: '/calendar',
    icon: CalendarDays,
    summary:
      'Interactive monthly, weekly, and agenda view tracking tender pre-bid meetings, purchase deadlines, and submission dates.',
    screenshots: [
      {
        src: '/screenshots/06-calendar.png',
        caption: 'Calendar Schedule: Color-coded tender deadlines with urgent countdown warnings',
      },
    ],
    keyPoints: [
      'Color-Coded Events: Pre-bid conferences (Purple), Schedule Purchase (Amber), Final Submission (Red).',
      'One-Click Navigation: Clicking any calendar event opens the corresponding tender summary.',
      'Deadline Protection: Highlights overlapping submissions to avoid logistics congestion.',
    ],
    instructions: [
      {
        step: '1. Select Month or Week View',
        desc: 'Switch views using the top-right controls to plan ahead for upcoming tender submissions.',
      },
      {
        step: '2. Click an Event',
        desc: 'Open the event detail popover to see time remaining, client name, and tender reference.',
      },
    ],
  },
  {
    id: 'vault',
    number: '08',
    title: 'Master Document Vault & Reusable Libraries',
    category: 'Libraries',
    route: '/documents',
    icon: FileCheck,
    summary:
      'Central corporate repository for statutory documents, company past project credentials (WO & CC), and tender default document templates.',
    screenshots: [
      {
        src: '/screenshots/09-documents-vault.png',
        caption: 'Statutory & Master Documents: Corporate tax, trade license, certificates with expiry monitoring',
      },
      {
        src: '/screenshots/09b-documents-credentials.png',
        caption: 'Past Projects & Work Orders: Archive past project contracts, values, WOs, and Completion Certificates',
      },
      {
        src: '/screenshots/09c-documents-defaults.png',
        caption: 'Default Tender Documents: Configure standard document templates auto-injected into every new tender',
      },
    ],
    keyPoints: [
      '3 Dedicated Vault Tabs: Statutory Documents, Past Projects (WO & CC), and Default Tender Documents.',
      'Work Order & CC Verification: Store verified proof of past experience required for technical scoring.',
      'Automated Default Injection: Every newly registered tender automatically receives standard statutory documents.',
      'Expiry Radar: Live amber/red badges warn of expiring trade licenses or tax clearance certificates.',
    ],
    instructions: [
      {
        step: '1. Upload Statutory Docs',
        desc: 'Click "+ Upload Document" in Tab 1, pick your company entity, and attach the PDF (e.g. Trade License).',
      },
      {
        step: '2. Add Past Project Credentials',
        desc: 'In Tab 2, click "+ Add Past Project". Input client, contract value, and upload Work Order & Completion Certificate.',
      },
      {
        step: '3. Manage Default Documents',
        desc: 'In Tab 3, toggle default inclusion switches or specify default target folder names (e.g. "Statutory Docs").',
      },
    ],
    tips: [
      'Files are hashed with SHA-256 and stored in the local file vault. Expiry dates update automatically on replacement.',
    ],
  },
  {
    id: 'companies',
    number: '09',
    title: 'Corporate Entities & Company Profiles',
    category: 'Libraries',
    route: '/tools/company-profiles',
    icon: Building2,
    summary:
      'Multi-entity governance hub managing Lead Bidders, Joint Venture Partners, and Subcontractor corporate profiles.',
    screenshots: [
      {
        src: '/screenshots/15-company-profiles.png',
        caption: 'Corporate Entities: Manage legal identity, audited turnover, banking solvency, and linked credentials',
      },
    ],
    keyPoints: [
      'Multi-Company Management: Manage your primary company plus consortium partners and subcontractors.',
      'Financial Credentials: Track 3-year audited turnover, banking solvency, and credit lines in one place.',
      'Linked Credentials & Vault Docs Tab: View verified past projects (WO/CC) and master documents tagged to this entity.',
      'One-Click Profile Copy: Export corporate summary text formatted for inclusion into tender technical bids.',
    ],
    instructions: [
      {
        step: '1. Select or Add Entity',
        desc: 'Click on a company pill (e.g. PrimeTech, Meghna Data Systems) or click "+ Add Company Profile".',
      },
      {
        step: '2. Update Financial Standing',
        desc: 'Enter audited revenue, authorized capital, and bank credit facilities in the Financials tab.',
      },
      {
        step: '3. Inspect Linked Assets',
        desc: 'Switch to "Linked Credentials & Vault Docs" to verify past project experience and uploaded credentials.',
      },
    ],
  },
  {
    id: 'client-visits',
    number: '10',
    title: 'Client Visitors & Meeting Hub',
    category: 'Core',
    route: '/clients/visits',
    icon: UserCheck,
    summary:
      'Log pre-bid client meetings, site inspections, clarification queries, and procuring entity visitor interactions.',
    screenshots: [
      {
        src: '/screenshots/12-client-visits.png',
        caption: 'Client Visitors & Interactions: Register meetings, agenda items, and official visitor badges',
      },
    ],
    keyPoints: [
      'Meeting Traceability: Tie client meetings directly to relevant tender IDs.',
      'Follow-up Tasks: Convert pre-bid meeting notes into actionable preparation tasks.',
      'Visitor Security Log: Maintain records of client site inspections and executive visits.',
    ],
    instructions: [
      {
        step: '1. Log New Interaction',
        desc: 'Click "+ Register Client Visit". Record client organization, date, attendee names, and discussion points.',
      },
      {
        step: '2. Link to Tender',
        desc: 'Associate the meeting with an ongoing tender to display notes on that tender’s workspace.',
      },
    ],
  },
  {
    id: 'organizations',
    number: '11',
    title: 'Procuring Organizations & SOW Categories',
    category: 'Libraries',
    route: '/tools/organizations',
    icon: Building2,
    summary:
      'Master directory of procuring authorities, ministries, e-GP portals, and Scope of Work (SOW) domain categories.',
    screenshots: [
      {
        src: '/screenshots/13-organizations.png',
        caption: 'Procuring Organizations: Directory of authorities with contact points and historical win rates',
      },
      {
        src: '/screenshots/14-categories.png',
        caption: 'SOW Categories: Define domain specialties (Software, Networking, Hardware, Civil Works)',
      },
    ],
    keyPoints: [
      'Procuring Entity Intel: Store official portal URLs, key contact persons, and past payment reliability.',
      'Category Intelligence: Track win/loss ratios by sector to guide bidding strategy.',
    ],
    instructions: [
      {
        step: '1. Create Procuring Organization',
        desc: 'Navigate to Tools & Addons → Organizations. Click "+ Add Organization" with short code and address.',
      },
      {
        step: '2. Manage Categories',
        desc: 'Under Tools & Addons → SOW Categories, customize technical domains to categorize tenders.',
      },
    ],
  },
  {
    id: 'reports',
    number: '12',
    title: 'Reports, Analytics & Win-Rate Ledger',
    category: 'Admin & System',
    route: '/reports',
    icon: BarChart3,
    summary:
      'Business intelligence dashboards providing win/loss ratios, category breakdowns, financial pipelines, and CSV/PDF exports.',
    screenshots: [
      {
        src: '/screenshots/07-reports.png',
        caption: 'Analytics Dashboard: Visual charts for win rates, revenue pipeline, and procurement category splits',
      },
    ],
    keyPoints: [
      'Multi-Level Reports: Basic (Executive), General (Operational), and Advanced (Financial Win/Loss).',
      'One-Click Export: Export any ledger or breakdown to Excel/CSV or print-ready PDF.',
      'Competitor Benchmarking: Analyze competitor pricing spreads to refine pricing algorithms.',
    ],
    instructions: [
      {
        step: '1. Select Report Mode',
        desc: 'Toggle between Basic, General, or Advance reporting views at the top.',
      },
      {
        step: '2. Export Data',
        desc: 'Click the "Export" dropdown button to download summary spreadsheets or audit trails.',
      },
    ],
  },
  {
    id: 'collaboration',
    number: '13',
    title: 'Team Discussions & Partner Portal',
    category: 'Core',
    route: '/discussions',
    icon: Users,
    summary:
      'Real-time tender communication threads and secure external portal for Joint Venture consortium partners.',
    screenshots: [
      {
        src: '/screenshots/10-discussions.png',
        caption: 'Chat & Discussions: Cross-department communication threads with mentions and file attachments',
      },
      {
        src: '/screenshots/18-partner-portal.png',
        caption: 'Partner Portal: Isolated interface for external JV partners to submit requested documents',
      },
    ],
    keyPoints: [
      'Tender-Linked Discussions: Messages remain attached to the tender record for complete audit history.',
      'Isolated Partner View: External JV partners only access the documents and tasks assigned to them.',
      'Notifications Center: Real-time alerts on deadline changes, document updates, and mentions.',
    ],
    instructions: [
      {
        step: '1. Collaborate on a Bid',
        desc: 'Open Discussions from the sidebar or click "Comments" inside any tender workspace.',
      },
      {
        step: '2. Share JV Links',
        desc: 'Generate a secure partner access token under Tender Workspace → Partners tab to share with JV firms.',
      },
    ],
  },
  {
    id: 'admin',
    number: '14',
    title: 'Security, Permissions & Settings',
    category: 'Admin & System',
    route: '/settings',
    icon: Sliders,
    summary:
      'Role-based access control (RBAC), vault storage paths, backup management, and notification configurations.',
    screenshots: [
      {
        src: '/screenshots/16-permissions.png',
        caption: 'Access & Permissions: Configure granular capabilities for Bid Directors, Leads, and Analysts',
      },
      {
        src: '/screenshots/19-settings.png',
        caption: 'System Settings: Local storage path settings, backup controls, and theme preferences',
      },
      {
        src: '/screenshots/20-user-profile.png',
        caption: 'User Profile: Manage personal credentials, password, and notification preferences',
      },
    ],
    keyPoints: [
      'Role-Based Permissions: Granular read/write toggles for Finance, Documents, Submissions, and Admin.',
      'Local Storage Directory: Set the root storage directory for HDD/SSD tender vaults.',
      'One-Click Backup: Trigger local database and document vault backups with automated archiving.',
    ],
    instructions: [
      {
        step: '1. Adjust Role Permissions',
        desc: 'Under Tools & Addons → Access & Permissions, configure permissions per role.',
      },
      {
        step: '2. Storage & Backups',
        desc: 'Under Settings, inspect the storage path (storage/tenders/) and click "Create Backup" as needed.',
      },
    ],
  },
];

export const SiteManualPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeSectionId, setActiveSectionId] = useState<string>('principles');
  const [modalImage, setModalImage] = useState<{ src: string; caption: string } | null>(null);

  const categories = ['ALL', 'Core', 'Tender Lifecycle', 'Libraries', 'Admin & System'];

  const filteredSections = useMemo(() => {
    return MANUAL_SECTIONS.filter((section) => {
      const matchesCategory = selectedCategory === 'ALL' || section.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesCategory;

      const matchesText =
        section.title.toLowerCase().includes(term) ||
        section.summary.toLowerCase().includes(term) ||
        section.keyPoints.some((p) => p.toLowerCase().includes(term)) ||
        section.instructions.some(
          (i) => i.step.toLowerCase().includes(term) || i.desc.toLowerCase().includes(term)
        );

      return matchesCategory && matchesText;
    });
  }, [searchTerm, selectedCategory]);

  const activeSection = useMemo(() => {
    return MANUAL_SECTIONS.find((s) => s.id === activeSectionId) || MANUAL_SECTIONS[0];
  }, [activeSectionId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Page Header */}
      <div className="bg-linear-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-[#334155] rounded-2xl p-6 text-white shadow-lg print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Site User Manual & Operating Guide</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Version 2.4 Live
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
                Comprehensive step-by-step operating instructions, interactive workflows, and visual screen guides for
                TenderTracker Command Center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer shadow-xs"
              title="Print or Export PDF manual"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            {activeSection.route && (
              <Link
                to={activeSection.route}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                <span>Launch Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user manual (e.g., Default documents, Past projects, Sign-off)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/70'
                }`}
              >
                {cat === 'ALL' ? 'All Modules (14)' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Nav + Right Section Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chapters / Topics List */}
        <div className="lg:col-span-4 space-y-2 print:hidden">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Manual Topics ({filteredSections.length})
            </span>
            <span className="text-[11px] text-[#94A3B8]">Click to view guide</span>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-1.5 pr-1">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSectionId === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                      : 'bg-white border-[#E2E8F0] hover:border-blue-200 hover:bg-slate-50/80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-[#F1F5F9] text-[#64748B] group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                        Section {section.number}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-medium">{section.category}</span>
                    </div>
                    <div
                      className={`text-xs font-bold truncate mt-0.5 ${
                        isActive ? 'text-blue-900' : 'text-[#0F172A] group-hover:text-blue-700'
                      }`}
                    >
                      {section.title}
                    </div>
                    <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">{section.summary}</p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                      isActive ? 'text-blue-600 translate-x-0.5' : 'text-[#CBD5E1] group-hover:text-[#94A3B8]'
                    }`}
                  />
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-xs text-[#64748B]">
                No manual sections match your search term "{searchTerm}".
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Section Detail & Screenshots */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 border border-[#E2E8F0] shadow-xs">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1F5F9] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
                    Section {activeSection.number}
                  </span>
                  <span className="text-xs font-medium text-[#64748B]">• {activeSection.category}</span>
                </div>
                <h2 className="text-lg font-bold text-[#0F172A] mt-1 flex items-center gap-2">
                  <activeSection.icon className="w-5 h-5 text-blue-600" />
                  {activeSection.title}
                </h2>
              </div>

              {activeSection.route && (
                <Link
                  to={activeSection.route}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold self-start sm:self-auto transition-colors"
                >
                  <span>Open Screen</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Summary */}
            <div className="mt-4 text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <strong>Module Overview:</strong> {activeSection.summary}
            </div>

            {/* Visual Screenshots Carousel / Grid */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                  Visual Screen Reference ({activeSection.screenshots.length})
                </span>
                <span className="text-[11px] text-[#64748B]">Click any image to enlarge</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activeSection.screenshots.map((shot, idx) => (
                  <div
                    key={idx}
                    onClick={() => setModalImage(shot)}
                    className="group relative rounded-xl border border-[#CBD5E1] bg-slate-900 overflow-hidden cursor-zoom-in shadow-xs transition-all hover:shadow-md hover:border-blue-400"
                  >
                    <img
                      src={shot.src}
                      alt={shot.caption}
                      className="w-full h-auto max-h-[380px] object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="text-white text-xs flex items-center justify-between w-full">
                        <span className="font-medium drop-shadow-xs">{shot.caption}</span>
                        <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[10px] font-semibold flex items-center gap-1 shrink-0 ml-2">
                          <ZoomIn className="w-3 h-3" /> Enlarge
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Architectural & Operational Rules */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Key Capabilities & System Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {activeSection.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Operating Instructions */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Step-by-Step User Instructions
              </h3>
              <div className="space-y-2.5">
                {activeSection.instructions.map((inst, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-blue-200 transition-colors"
                  >
                    <div className="text-xs font-bold text-blue-900">{inst.step}</div>
                    <div className="text-xs text-[#475569] mt-1 leading-relaxed">{inst.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips / Notice */}
            {activeSection.tips && activeSection.tips.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Pro Tip & Best Practice
                </div>
                <div className="text-xs space-y-1">
                  {activeSection.tips.map((t, i) => (
                    <p key={i}>• {t}</p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Image Preview / Zoom Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[92vh] flex flex-col bg-[#0F172A] border border-[#334155] rounded-2xl overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between text-white bg-[#0F172A]">
              <div className="text-xs font-bold truncate max-w-2xl">{modalImage.caption}</div>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Scrollable High-Res Image */}
            <div className="overflow-auto p-2 bg-slate-950 flex items-center justify-center">
              <img
                src={modalImage.src}
                alt={modalImage.caption}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SiteManualPage;
