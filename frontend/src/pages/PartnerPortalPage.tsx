import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  Folder,
  Copy,
  Check,
  ArrowLeft,
  CheckSquare,
  Square,
  Download,
  X,
  FileCheck,
  Building2,
  Menu,
  Gavel,
  Smile,
} from 'lucide-react';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';

const QUICK_REPLIES = [
  'Acknowledged, I will review this.',
  'Thanks, I will follow up shortly.',
  'This is blocked pending additional information.',
  'Approved from my side.',
];

const QUICK_EMOJIS = ['👍', '✅', '🎯', '🙌', '⚠️', '💬'];

interface DocumentItem {
  id: string;
  name: string;
  category: 'Statutory' | 'Technical' | 'Legal';
  version: string;
  size: string;
  hash: string;
  status: 'VERIFIED' | 'ACTION_REQUIRED' | 'PENDING_AUDIT';
  uploadedAt: string;
  flagComment?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  timestamp: string;
  content: string;
  isSelf: boolean;
}

interface DeliverableTask {
  id: string;
  title: string;
  due: string;
  category: 'Legal' | 'Statutory' | 'Technical';
  completed: boolean;
  urgent?: boolean;
}

export const PartnerPortalPage: React.FC = () => {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'tender' | 'revisions' | 'documents' | 'deliverables' | 'tor' | 'comms'>('tender');

  // Category tab state
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Statutory' | 'Technical' | 'Legal'>('All');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  
  // Document ledger state
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'DOC-001',
      name: 'JV_Agreement_Final_Signed.pdf',
      category: 'Legal',
      version: 'v1.0',
      size: '2.4 MB',
      hash: '8f434346d83a1288c39fa454641e7790b1e16f39',
      status: 'VERIFIED',
      uploadedAt: '2026-09-03',
    },
    {
      id: 'DOC-002',
      name: 'Audited_Financials_FY24-25.pdf',
      category: 'Statutory',
      version: 'v1.0',
      size: '15.1 MB',
      hash: 'a2c99b1177ef44b0e98031d227b68181a4d87bc0',
      status: 'ACTION_REQUIRED',
      uploadedAt: '2026-09-04',
      flagComment: 'Page 4 is missing the external Chartered Accountant seal and signature. Please re-scan in 300 DPI and upload certified revision before T-48h.',
    },
    {
      id: 'DOC-003',
      name: 'ISO27001_Certificate_Current.pdf',
      category: 'Technical',
      version: 'v1.1',
      size: '850 KB',
      hash: 'e5b61c994d210515903bde224a1b0231cf50d771',
      status: 'PENDING_AUDIT',
      uploadedAt: '2026-09-05',
    },
    {
      id: 'DOC-004',
      name: 'Directors_Bios_Resumes.docx',
      category: 'Statutory',
      version: 'v1.0',
      size: '1.2 MB',
      hash: 'c3a12b449f0012e8432a199859f772ba61d40211',
      status: 'VERIFIED',
      uploadedAt: '2026-09-02',
    },
  ]);

  // Tasks state
  const [tasks, setTasks] = useState<DeliverableTask[]>([
    {
      id: 'TASK-1',
      title: 'Submit JV Agreement (Notarized)',
      due: 'Completed 2 days ago',
      category: 'Legal',
      completed: true,
    },
    {
      id: 'TASK-2',
      title: 'Financial Statements Re-upload',
      due: 'Due: T-48h',
      category: 'Statutory',
      completed: false,
      urgent: true,
    },
    {
      id: 'TASK-3',
      title: 'Technical Architecture Diagrams',
      due: 'Due: 2026-09-10',
      category: 'Technical',
      completed: false,
    },
  ]);

  // TOR Checklist state
  const [torItems, setTorItems] = useState([
    {
      id: 'TOR-1',
      text: 'Must demonstrate ISO 27001 compliance for all data processing facilities.',
      checked: true,
    },
    {
      id: 'TOR-2',
      text: 'Proposed architecture must utilize containerized microservices (Kubernetes).',
      checked: true,
    },
    {
      id: 'TOR-3',
      text: 'Provide SLA metrics for 99.99% uptime in multi-region failover scenario.',
      checked: false,
    },
  ]);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG-1',
      sender: 'Mark D.',
      role: 'Prime Lead',
      timestamp: '10:42 AM',
      content: "Elena, I've flagged the financials. The auditor's stamp is required on pg4. Can you get that sorted today?",
      isSelf: false,
    },
    {
      id: 'MSG-2',
      sender: 'Elena Rostova',
      role: 'You',
      timestamp: '10:45 AM',
      content: 'Saw the flag. Contacting our external auditor now to re-stamp the digital copy. Will upload v1.1 by EOD.',
      isSelf: true,
    },
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [showChatEmojiPicker, setShowChatEmojiPicker] = useState(false);

  // Modals state
  const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
  const [isFlaggedDocModalOpen, setIsFlaggedDocModalOpen] = useState(false);
  const [isNewUploadModalOpen, setIsNewUploadModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Re-upload form state
  const [reuploadFileName, setReuploadFileName] = useState('Audited_Financials_FY24-25_Signed_CA_v1.1.pdf');
  const [reuploadComment, setReuploadComment] = useState('Re-scanned at 300 DPI with certified Chartered Accountant seal & physical signature on page 4.');
  const [isSubmittingReupload, setIsSubmittingReupload] = useState(false);

  // New generic upload form state
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'Statutory' | 'Technical' | 'Legal'>('Statutory');

  // Copy hash helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filtered documents
  const filteredDocuments = documents.filter(
    (doc) => selectedCategory === 'All' || doc.category === selectedCategory
  );

  // Action required document
  const flaggedDoc = documents.find((d) => d.status === 'ACTION_REQUIRED');

  // Handle re-upload submission
  const handleCompleteReupload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReupload(true);

    setTimeout(() => {
      // Update the document to v1.1 and PENDING_AUDIT
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === 'DOC-002'
            ? {
                ...doc,
                name: reuploadFileName,
                version: 'v1.1',
                size: '15.4 MB',
                hash: '9e11f7c228da01b97cf2941160a2b4cd988f01b3',
                status: 'PENDING_AUDIT',
                uploadedAt: new Date().toISOString().split('T')[0],
              }
            : doc
        )
      );

      // Mark the task as done
      setTasks((prev) =>
        prev.map((t) => (t.id === 'TASK-2' ? { ...t, completed: true, urgent: false, due: 'Submitted for Audit' } : t))
      );

      // Add a chat confirmation message
      setChatMessages((prev) => [
        ...prev,
        {
          id: `MSG-${Date.now()}`,
          sender: 'Elena Rostova',
          role: 'You',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `✅ Certified Revision v1.1 uploaded (${reuploadFileName}). Auditor seal on pg4 verified. Awaiting prime compliance audit.`,
          isSelf: true,
        },
      ]);

      setIsSubmittingReupload(false);
      setIsReuploadModalOpen(false);
    }, 600);
  };

  // Handle generic new document upload
  const handleCreateNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const newDoc: DocumentItem = {
      id: `DOC-00${documents.length + 1}`,
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      category: newDocCategory,
      version: 'v1.0',
      size: '3.2 MB',
      hash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'PENDING_AUDIT',
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setNewDocName('');
    setIsNewUploadModalOpen(false);
  };

  // Send chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `MSG-${Date.now()}`,
        sender: 'Elena Rostova',
        role: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: newChatText.trim(),
        isSelf: true,
      },
    ]);
    setNewChatText('');
  };

  const insertIntoChatDraft = (value: string) => {
    setNewChatText((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${value}`);
  };

  // Toggle TOR checklist
  const handleToggleTor = (id: string) => {
    setTorItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Calculate TOR coverage
  const torCompletedCount = torItems.filter((t) => t.checked).length;
  const torPercentage = Math.round((torCompletedCount / torItems.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] text-[var(--text-primary)] flex font-sans">
      {/* 1. Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[var(--text-primary)]/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. Partner Left Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[var(--accent)] text-[var(--accent-on)] flex flex-col z-40 shrink-0 transition-transform duration-200 ease-in-out border-r border-[var(--border-strong)] ${
 isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
 }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-[var(--border-strong)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-4 h-4 text-[var(--accent-on)]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[var(--accent-on)] tracking-tight truncate">
                Consortium Tech
              </h2>
              <span className="text-[10px] text-[var(--accent)] font-semibold block uppercase tracking-wider">
                JV Partner Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-[var(--text-muted)] hover:text-[var(--accent-on)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Partner Identity Card */}
        <div className="p-4 border-b border-[var(--border-strong)] bg-[var(--bg-canvas)]/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse"></span>
            <span className="text-[10px] font-bold text-[var(--ok)] uppercase tracking-wider">
              Layer-2 Authenticated
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-semibold truncate">
            Consortium Technology Partners
          </div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
            Tender: TDR-2026-EU-089
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Workspace
          </div>

          <a
            href="#tender-context"
            onClick={() => {
              setActiveNav('tender');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
 activeNav === 'tender'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-on)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Gavel className="w-4 h-4" />
              <span>Tender Specs</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">T-11d</span>
          </a>

          {flaggedDoc && (
            <a
              href="#action-required"
              onClick={() => {
                setActiveNav('revisions');
                setIsSidebarOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
 activeNav === 'revisions'
 ? 'bg-[var(--warn)] text-[var(--accent-on)] font-semibold shadow-xs'
                  : 'text-[var(--warn)] hover:bg-[var(--accent-hover)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Action Required</span>
              </div>
              <span className="text-[10px] font-bold bg-[var(--warn)]/20 text-[var(--warn)] px-1.5 py-0.5 rounded">
                1 Urgent
              </span>
            </a>
          )}

          <a
            href="#document-hub"
            onClick={() => {
              setActiveNav('documents');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
 activeNav === 'documents'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-on)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4" />
              <span>Document Hub</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--accent-hover)] px-1.5 py-0.5 rounded">
              {documents.length}
            </span>
          </a>

          <div className="pt-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Compliance & Tasks
          </div>

          <a
            href="#deliverables"
            onClick={() => {
              setActiveNav('deliverables');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
 activeNav === 'deliverables'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-on)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4" />
              <span>Deliverables</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--accent-hover)] px-1.5 py-0.5 rounded">
              {tasks.filter((t) => t.completed).length}/{tasks.length}
            </span>
          </a>

          <a
            href="#tor-extraction"
            onClick={() => {
              setActiveNav('tor');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
 activeNav === 'tor'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-on)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>TOR Extraction</span>
            </div>
            <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/20 px-1.5 py-0.5 rounded">
              {torPercentage}%
            </span>
          </a>

          <a
            href="#secure-comms"
            onClick={() => {
              setActiveNav('comms');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
 activeNav === 'comms'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-on)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Prime Comms</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />
          </a>
        </div>

        {/* Sidebar Bottom Security Card */}
        <div className="p-4 border-t border-[var(--border-strong)] bg-[var(--bg-canvas)]/40 space-y-3">
          <div className="p-2.5 rounded-lg bg-[var(--accent-hover)]/70 border border-[var(--border-strong)] flex items-start gap-2 text-[10px] text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[var(--accent-on)] block">Layer-2 Hard Barrier</span>
              <span className="text-[var(--text-muted)]">Financial BoQ &amp; Margins Sealed</span>
            </div>
          </div>

          <Link
            to="/tenders/TDR-2026-EU-089/partners"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-hover)] hover:bg-[var(--accent-hover)] text-[var(--text-muted)] text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Internal Command</span>
          </Link>
        </div>
      </aside>

      {/* 3. Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Partner Header */}
        <header className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] shadow-xs h-16 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Consortium Technology Partners Ltd.
                </h1>
                <span className="hidden sm:inline-block text-xs text-[var(--text-muted)]">•</span>
                <span className="hidden sm:inline-block text-xs font-semibold text-[var(--accent)]">
                  JV Partner Portal
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">Authenticated Collaboration Workspace (Section 5/6)</p>
            </div>
          </div>

          {/* Right Profile & Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[var(--text-primary)]">Elena Rostova</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Partner Compliance Lead</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--accent-hover)] text-[var(--accent-on)] flex items-center justify-center font-bold text-xs ring-2 ring-[var(--accent)]/20">
                ER
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Return to Internal Command Center"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Internal Command Center</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Page Workspace */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* 1. Tender Context & Layer-2 Security Card */}
          <section id="tender-context" className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden scroll-mt-20">
            <div className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-[var(--accent)] text-[var(--accent-on)] font-mono text-xs px-2.5 py-1 rounded font-semibold tracking-wider">
                TDR-2026-EU-089
              </span>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Next-Generation Enterprise ERP Modernization
              </h2>
              <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">(DIGIT European Authority)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse"></span>
                ACTIVE JV COLLABORATOR
              </span>
            </div>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category */}
            <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] pb-3 md:pb-0 md:pr-4">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Category</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">Software Development</span>
              <span className="text-[11px] text-[var(--text-secondary)]">Role: Statutory Compliance & Integration</span>
            </div>

            {/* Submission Deadline */}
            <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] pb-3 md:pb-0 md:pr-4">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Submission Deadline</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--warn)]" />
                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">T-11 Days</span>
                <span className="text-xs text-[var(--text-secondary)]">(2026-09-15 12:00 BST)</span>
              </div>
              <span className="text-[11px] text-[var(--warn)] font-medium">Stage: Preparation Gate 3 (Pre-Signoff)</span>
            </div>

            {/* Security Clearance Seal */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Security Clearance</span>
              <div className="flex items-start gap-2.5 bg-[var(--bg-subtle)] p-2.5 rounded-lg border border-[var(--border-default)]">
                <ShieldCheck className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Layer-2 Hard Boundary Enforced</span>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                    Commercial Margins, Bill of Quantities &amp; Financial Formulas Sealed (Prime Contractor NYK Advance internal access only).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Action Required Re-Upload Notice (Amber Callout Card) */}
        {flaggedDoc && (
          <section id="action-required" className="bg-[var(--warn-soft)] border border-[var(--warn-line)] rounded-xl shadow-xs p-5 relative overflow-hidden scroll-mt-20">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--warn)]" />
            <div className="flex items-start gap-4 ml-1">
              <div className="p-2 rounded-lg bg-[var(--warn-soft)] text-[var(--warn)] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm md:text-base font-bold text-[var(--warn)]">
                    Action Required: Document Revision & Re-Upload Request
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn-line)] px-2.5 py-0.5 rounded-md uppercase">
                    Urgent • Due in T-48 Hours
                  </span>
                </div>

                <div>
                  <span className="text-xs font-mono font-semibold text-[var(--warn)] bg-[var(--warn-soft)]/60 px-2 py-0.5 rounded">
                    {flaggedDoc.name} ({flaggedDoc.version})
                  </span>
                </div>

                <div className="bg-[var(--bg-surface)]/80 p-3 rounded-lg border border-[var(--warn-line)] text-xs text-[var(--warn)] leading-relaxed">
                  <span className="font-semibold text-[var(--warn)]">Reviewer Feedback (Mark D. - Prime Compliance Lead): </span>
                  "{flaggedDoc.flagComment}"
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => setIsReuploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Certified Revision (v1.1)</span>
                  </button>
                  <button
                    onClick={() => setIsFlaggedDocModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--warn-soft)]/40 text-[var(--warn)] border border-[var(--warn-line)] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Flagged File (v1.0 & Review Annotation)</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Two-Column Workspace (Document Hub vs Context/Comms) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Document Contribution Hub (8 Cols) */}
          <div id="document-hub" className="xl:col-span-8 space-y-4 scroll-mt-20">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="border-b border-[var(--border-default)] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-subtle)]">
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Document Contribution Hub</h3>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)]">({documents.length} files)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="px-5 py-2.5 border-b border-[var(--border-default)] flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  {(['All', 'Statutory', 'Technical', 'Legal'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 selectedCategory === cat
 ? 'bg-[var(--accent)] text-[var(--accent-on)]'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-[var(--text-secondary)] hidden sm:block">
                  SHA-256 Tamper Protection Enabled
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => setIsNewUploadModalOpen(true)}
                className="m-5 border-2 border-dashed border-[var(--border-strong)] rounded-xl bg-[var(--bg-subtle)] p-6 flex flex-col items-center justify-center text-center hover:bg-[var(--bg-subtle)] hover:border-[var(--accent)] transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[var(--text-primary)] mb-0.5">
                  Drag and drop JV partner documents here, or click to browse
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  PDF, DOCX, XLSX up to 50MB. Automatic SHA-256 hash generation on drop.
                </p>
              </div>

              {/* Document Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-8"></th>
                      <th className="py-2.5 px-4">Document Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Version</th>
                      <th className="py-2.5 px-4">Size</th>
                      <th className="py-2.5 px-4">SHA-256 Hash</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`transition-colors ${
 doc.status === 'ACTION_REQUIRED'
 ? 'bg-[var(--warn-soft)] hover:bg-[var(--warn-soft)]/60'
                            : 'hover:bg-[var(--bg-subtle)]'
                        }`}
                      >
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {doc.status === 'ACTION_REQUIRED' ? (
                            <AlertTriangle className="w-4 h-4 text-[var(--warn)]" />
                          ) : doc.status === 'PENDING_AUDIT' ? (
                            <Clock className="w-4 h-4 text-[var(--accent)]" />
                          ) : (
                            <FileCheck className="w-4 h-4 text-[var(--ok)]" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                id: doc.id,
                                name: doc.name,
                                size: doc.size,
                                sha256: doc.hash,
                                revision: doc.version,
                                folder: doc.category,
                                uploadedAt: doc.uploadedAt,
                                isJvPartner: true,
                                companyName: 'Consortium Technology Partners Ltd.',
                              })
                            }
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline text-left cursor-pointer"
                            title="Preview document in browser"
                          >
                            {doc.name}
                          </button>
                          <div className="text-[10px] text-[var(--text-secondary)]">Uploaded: {doc.uploadedAt}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] font-bold text-[var(--text-primary)]">
                          {doc.version}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] font-mono text-[11px]">{doc.size}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-secondary)]">
                            <span>{doc.hash.slice(0, 8)}...{doc.hash.slice(-4)}</span>
                            <button
                              onClick={() => handleCopyHash(doc.hash)}
                              className="p-1 hover:text-[var(--text-primary)] rounded"
                              title="Copy SHA-256 Hash"
                            >
                              {copiedHash === doc.hash ? (
                                <Check className="w-3 h-3 text-[var(--ok)]" />
                              ) : (
                                <Copy className="w-3 h-3 text-[var(--text-muted)]" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
 doc.status === 'VERIFIED'
 ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]'
                                : doc.status === 'ACTION_REQUIRED'
                                ? 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]'
                                : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]'
                            }`}
                          >
                            {doc.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* In-Browser Preview Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  id: doc.id,
                                  name: doc.name,
                                  size: doc.size,
                                  sha256: doc.hash,
                                  revision: doc.version,
                                  folder: doc.category,
                                  uploadedAt: doc.uploadedAt,
                                  isJvPartner: true,
                                  companyName: 'Consortium Technology Partners Ltd.',
                                })
                              }
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
                              title="Preview document in browser"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {doc.status === 'ACTION_REQUIRED' ? (
                              <button
                                onClick={() => setIsReuploadModalOpen(true)}
                                className="px-2.5 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded text-[11px] font-semibold transition-colors shadow-2xs"
                              >
                                Re-Upload
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  alert(`Downloading ${doc.name} (SHA-256 verified)`);
                                }}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
                                title="Download document"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Context, Deliverables & Comms (4 Cols) */}
          <div className="xl:col-span-4 space-y-6">
            {/* 1. Assigned Deliverables */}
            <div id="deliverables" className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden scroll-mt-20">
              <div className="border-b border-[var(--border-default)] px-4 py-3 bg-[var(--bg-subtle)] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Assigned Deliverables
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {tasks.filter((t) => t.completed).length} of {tasks.length} Completed
                </span>
              </div>

              <div className="p-4 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
 task.urgent
 ? 'bg-[var(--warn-soft)] border-[var(--warn-line)]'
                        : task.completed
                        ? 'bg-[var(--ok-soft)]/50 border-[var(--ok-line)]'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-default)]'
                    }`}
                  >
                    <button
                      onClick={() =>
                        setTasks((prev) =>
                          prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
                        )
                      }
                      className="mt-0.5 text-[var(--accent)]"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--ok)]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[var(--border-strong)] flex items-center justify-center">
                          {task.urgent && <div className="w-1.5 h-1.5 bg-[var(--warn)] rounded-full animate-ping" />}
                        </div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold leading-snug ${
 task.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
 }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span
                          className={task.urgent ? 'text-[var(--warn)] font-bold font-mono' : 'text-[var(--text-secondary)]'}
                        >
                          {task.due}
                        </span>
                        <span className="bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TOR Extraction Checklist (Technical) */}
            <div id="tor-extraction" className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden scroll-mt-20">
              <div className="border-b border-[var(--border-default)] px-4 py-3 bg-[var(--bg-subtle)] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  TOR Extraction (Technical)
                </h3>
                <span className="text-[10px] font-mono bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] px-1.5 py-0.5 rounded font-bold">
                  Auto-Extracted
                </span>
              </div>

              {/* Progress Coverage Bar */}
              <div className="p-3 bg-[var(--bg-subtle)]/50 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-1 text-[10px]">
                  <span className="font-bold text-[var(--text-secondary)] uppercase">Compliance Coverage</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{torPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                    style={{ width: `${torPercentage}%` }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-[var(--border-subtle)]">
                {torItems.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleToggleTor(item.id)}
                    className="p-3 flex items-start gap-2.5 hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-[var(--ok)]" />
                      ) : (
                        <Square className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
 item.checked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)] italic'
 }`}
                    >
                      "{item.text}"
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Secure Comms Thread with Prime Lead */}
            <div id="secure-comms" className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden flex flex-col h-[340px] scroll-mt-20">
              <div className="border-b border-[var(--border-default)] px-4 py-3 bg-[var(--bg-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Secure Comms (Prime)
                  </h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-[var(--ok)]" title="Encrypted Connection Online" />
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-subtle)]/30 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${msg.isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-[var(--text-secondary)] px-1">
                      {msg.sender} ({msg.role}) • {msg.timestamp}
                    </span>
                    <div
                      className={`p-2.5 rounded-xl max-w-[90%] shadow-2xs leading-relaxed ${
 msg.isSelf
 ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--accent-line)] rounded-tr-none'
                          : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat input form */}
              <form onSubmit={handleSendChat} className="p-2.5 border-t border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                  <span className="shrink-0 font-semibold text-[var(--text-secondary)]">Quick reply:</span>
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => insertIntoChatDraft(reply)}
                      className="shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-subtle)] px-2 py-1 text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newChatText}
                      onChange={(e) => setNewChatText(e.target.value)}
                      placeholder="Type a secure message to Prime Lead..."
                      className="w-full border border-[var(--border-strong)] rounded-lg px-3 py-1.5 pr-9 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChatEmojiPicker((open) => !open)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)]"
                      title="Add emoji"
                      aria-label="Add emoji"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    {showChatEmojiPicker && (
                      <div className="absolute bottom-9 right-0 z-20 flex gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 shadow-lg">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              insertIntoChatDraft(emoji);
                              setShowChatEmojiPicker(false);
                            }}
                            className="rounded-md p-1 text-base transition-colors hover:bg-[var(--accent-soft)]"
                            title={`Add ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!newChatText.trim()}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--accent-on)] p-2 rounded-lg transition-colors shadow-2xs"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>

      {/* --- MODAL 1: Upload Certified Revision (v1.1) --- */}
      {isReuploadModalOpen && (
        <div className="tt-overlay items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--border-default)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Upload Certified Revision (v1.1)</h3>
              </div>
              <button
                onClick={() => setIsReuploadModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteReupload} className="space-y-4 pt-4">
              {/* Reviewer flag banner */}
              <div className="p-3 bg-[var(--warn-soft)] border border-[var(--warn-line)] rounded-xl text-xs space-y-1">
                <span className="font-bold text-[var(--warn)] block">Deficiency Flagged by Prime Auditor:</span>
                <p className="text-[var(--warn)] italic">
                  "Page 4 is missing the external Chartered Accountant seal and signature. Please re-scan in 300 DPI and upload certified revision before T-48h."
                </p>
              </div>

              {/* Target File Info */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Target Document</label>
                <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-mono text-xs text-[var(--text-primary)] flex items-center justify-between">
                  <span>Audited_Financials_FY24-25.pdf</span>
                  <span className="text-[10px] bg-[var(--bg-muted)] px-2 py-0.5 rounded font-bold">Replacing v1.0</span>
                </div>
              </div>

              {/* New File Selection */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">New Certified File Name</label>
                <input
                  type="text"
                  value={reuploadFileName}
                  onChange={(e) => setReuploadFileName(e.target.value)}
                  className="w-full border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  required
                />
              </div>

              {/* Hash Preview */}
              <div className="p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-secondary)] font-semibold">Simulated SHA-256 Checksum:</span>
                  <span className="text-[var(--ok)] font-bold">Calculated ✓</span>
                </div>
                <div className="font-mono text-[10px] text-[var(--text-secondary)] break-all bg-[var(--bg-surface)] p-2 rounded border border-[var(--border-default)]">
                  9e11f7c228da01b97cf2941160a2b4cd988f01b3a3c2009bf336017bca88102
                </div>
              </div>

              {/* Partner Response Note */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Partner Resolution Note (Visible to Prime Lead)
                </label>
                <textarea
                  value={reuploadComment}
                  onChange={(e) => setReuploadComment(e.target.value)}
                  rows={3}
                  className="w-full border border-[var(--border-strong)] rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  placeholder="Explain how the feedback was addressed..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReuploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReupload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingReupload ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Hashing & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Submit Certified Revision (v1.1)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: View Flagged Document v1.0 & Review Annotation --- */}
      {isFlaggedDocModalOpen && (
        <div className="tt-overlay items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[var(--border-default)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)] bg-[var(--bg-subtle)] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--warn)]" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Audited_Financials_FY24-25.pdf (v1.0)
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Page 4 of 12 • Flagged by Mark D. (Prime Lead)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFlaggedDocModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Mock Viewer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-muted)]/50 flex flex-col items-center">
              <div className="w-full max-w-xl bg-[var(--bg-surface)] shadow-lg rounded border border-[var(--border-strong)] p-8 space-y-6 relative min-h-[500px]">
                {/* Header Mock */}
                <div className="border-b border-[var(--border-default)] pb-4 flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                  <span className="font-bold uppercase tracking-wider">Consortium Technology Partners Ltd.</span>
                  <span>Financial Year 2024-2025 Statement</span>
                </div>

                <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Balance Sheet & Auditor Declaration (Page 4)</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    The undersigned representatives have audited the accounts in conformity with International Financial Reporting Standards (IFRS). Total operating revenue of €14,280,000 recorded with liquid reserve of €3,850,000.
                  </p>
                </div>

                {/* Annotation Highlight Box */}
                <div className="p-4 border-2 border-dashed border-[var(--warn)] bg-[var(--warn-soft)]/40 rounded-xl relative space-y-2 mt-8">
                  <div className="absolute -top-3 left-4 bg-[var(--warn)] text-[var(--accent-on)] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Audit Flag: Missing Seal
                  </div>
                  <div className="h-20 border border-[var(--border-strong)] bg-[var(--bg-surface)]/60 rounded flex items-center justify-center text-[var(--text-muted)] text-xs italic">
                    [External Auditor Official Stamp Zone — Blank]
                  </div>
                  <p className="text-[11px] text-[var(--warn)] font-medium leading-tight">
                    "Page 4 is missing the external Chartered Accountant seal and signature. Please re-scan in 300 DPI and upload certified revision before T-48h."
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-subtle)] rounded-b-2xl flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                SHA-256: a2c99b1177ef44b0e98031d227b68181a4d87bc0
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFlaggedDocModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setIsFlaggedDocModalOpen(false);
                    setIsReuploadModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Proceed to Upload Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Generic Upload New Document --- */}
      {isNewUploadModalOpen && (
        <div className="tt-overlay items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--border-default)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Upload Partner Document</h3>
              </div>
              <button
                onClick={() => setIsNewUploadModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDoc} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Document File Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Subcontractor_Security_Plan.pdf"
                  className="w-full border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full border border-[var(--border-strong)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                >
                  <option value="Statutory">Statutory</option>
                  <option value="Technical">Technical</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[11px] text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold text-[var(--text-primary)]">Security Protocol:</p>
                <p>
                  Documents submitted will be automatically hashed with SHA-256 and queued for Prime Contractor compliance audit under Layer-2 permissions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on)] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload &amp; Hash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Document Preview Modal (Clean View) */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc ? {
          ...previewDoc,
          previewUrl: `/api/documents/${previewDoc.id}/preview`,
          downloadUrl: `/api/documents/${previewDoc.id}/download`,
        } : null}
        tenderId="TDR-2026-EU-089"
      />
    </div>
  );
};
