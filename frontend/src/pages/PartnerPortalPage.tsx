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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans">
      {/* 1. Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. Partner Left Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0F172A] text-white flex flex-col z-40 shrink-0 transition-transform duration-200 ease-in-out border-r border-[#1E293B] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white tracking-tight truncate">
                Consortium Tech
              </h2>
              <span className="text-[10px] text-blue-400 font-semibold block uppercase tracking-wider">
                JV Partner Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Partner Identity Card */}
        <div className="p-4 border-b border-[#1E293B] bg-[#0B132B]/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider">
              Layer-2 Authenticated
            </span>
          </div>
          <div className="text-[11px] text-slate-200 font-semibold truncate">
            Consortium Technology Partners
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Tender: TDR-2026-EU-089
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
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
                  ? 'bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'text-amber-400 hover:bg-[#1E293B]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Action Required</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
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
                ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4" />
              <span>Document Hub</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-[#1E293B] px-1.5 py-0.5 rounded">
              {documents.length}
            </span>
          </a>

          <div className="pt-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4" />
              <span>Deliverables</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-[#1E293B] px-1.5 py-0.5 rounded">
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
                ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>TOR Extraction</span>
            </div>
            <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
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
                ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Prime Comms</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          </a>
        </div>

        {/* Sidebar Bottom Security Card */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0B132B]/40 space-y-3">
          <div className="p-2.5 rounded-lg bg-[#1E293B]/70 border border-[#334155] flex items-start gap-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Layer-2 Hard Barrier</span>
              <span className="text-slate-400">Financial BoQ &amp; Margins Sealed</span>
            </div>
          </div>

          <Link
            to="/tenders/TDR-2026-EU-089/partners"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Internal Command</span>
          </Link>
        </div>
      </aside>

      {/* 3. Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Partner Header */}
        <header className="bg-white border-b border-[#E2E8F0] shadow-xs h-16 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-[#0F172A] tracking-tight">
                  Consortium Technology Partners Ltd.
                </h1>
                <span className="hidden sm:inline-block text-xs text-[#94A3B8]">•</span>
                <span className="hidden sm:inline-block text-xs font-semibold text-[#2563EB]">
                  JV Partner Portal
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">Authenticated Collaboration Workspace (Section 5/6)</p>
            </div>
          </div>

          {/* Right Profile & Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#0F172A]">Elena Rostova</p>
                <p className="text-[10px] text-[#64748B]">Partner Compliance Lead</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#2563EB]/20">
                ER
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#475569] text-xs font-medium flex items-center gap-1.5 transition-colors"
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
          <section id="tender-context" className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden scroll-mt-20">
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-[#0F172A] text-white font-mono text-xs px-2.5 py-1 rounded font-semibold tracking-wider">
                TDR-2026-EU-089
              </span>
              <h2 className="text-base font-bold text-[#0F172A]">
                Next-Generation Enterprise ERP Modernization
              </h2>
              <span className="text-xs text-[#64748B] hidden sm:inline">(DIGIT European Authority)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                ACTIVE JV COLLABORATOR
              </span>
            </div>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category */}
            <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-[#F1F5F9] pb-3 md:pb-0 md:pr-4">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Category</span>
              <span className="text-sm font-bold text-[#0F172A]">Software Development</span>
              <span className="text-[11px] text-[#64748B]">Role: Statutory Compliance & Integration</span>
            </div>

            {/* Submission Deadline */}
            <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-[#F1F5F9] pb-3 md:pb-0 md:pr-4">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Submission Deadline</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span className="font-mono text-sm font-bold text-[#0F172A]">T-11 Days</span>
                <span className="text-xs text-[#64748B]">(2026-09-15 12:00 BST)</span>
              </div>
              <span className="text-[11px] text-[#F59E0B] font-medium">Stage: Preparation Gate 3 (Pre-Signoff)</span>
            </div>

            {/* Security Clearance Seal */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Security Clearance</span>
              <div className="flex items-start gap-2.5 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#0F172A] block">Layer-2 Hard Boundary Enforced</span>
                  <p className="text-[11px] text-[#64748B] leading-snug">
                    Commercial Margins, Bill of Quantities &amp; Financial Formulas Sealed (Prime Contractor NYK Advance internal access only).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Action Required Re-Upload Notice (Amber Callout Card) */}
        {flaggedDoc && (
          <section id="action-required" className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl shadow-xs p-5 relative overflow-hidden scroll-mt-20">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F59E0B]" />
            <div className="flex items-start gap-4 ml-1">
              <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#D97706] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm md:text-base font-bold text-[#92400E]">
                    Action Required: Document Revision & Re-Upload Request
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2.5 py-0.5 rounded-md uppercase">
                    Urgent • Due in T-48 Hours
                  </span>
                </div>

                <div>
                  <span className="text-xs font-mono font-semibold text-[#78350F] bg-[#FDE68A]/60 px-2 py-0.5 rounded">
                    {flaggedDoc.name} ({flaggedDoc.version})
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-[#FDE68A] text-xs text-[#78350F] leading-relaxed">
                  <span className="font-semibold text-[#92400E]">Reviewer Feedback (Mark D. - Prime Compliance Lead): </span>
                  "{flaggedDoc.flagComment}"
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => setIsReuploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Certified Revision (v1.1)</span>
                  </button>
                  <button
                    onClick={() => setIsFlaggedDocModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FEF3C7]/40 text-[#92400E] border border-[#FCD34D] rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="border-b border-[#E2E8F0] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">Document Contribution Hub</h3>
                  <span className="text-[11px] font-mono text-[#64748B]">({documents.length} files)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="px-5 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  {(['All', 'Statutory', 'Technical', 'Legal'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-[#64748B] hidden sm:block">
                  SHA-256 Tamper Protection Enabled
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => setIsNewUploadModalOpen(true)}
                className="m-5 border-2 border-dashed border-[#CBD5E1] rounded-xl bg-[#F8FAFC] p-6 flex flex-col items-center justify-center text-center hover:bg-[#F1F5F9] hover:border-[#2563EB] transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#0F172A] mb-0.5">
                  Drag and drop JV partner documents here, or click to browse
                </p>
                <p className="text-[11px] text-[#64748B]">
                  PDF, DOCX, XLSX up to 50MB. Automatic SHA-256 hash generation on drop.
                </p>
              </div>

              {/* Document Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#F8FAFC] border-y border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
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
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`transition-colors ${
                          doc.status === 'ACTION_REQUIRED'
                            ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7]/60'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-3 px-4 text-[#94A3B8]">
                          {doc.status === 'ACTION_REQUIRED' ? (
                            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                          ) : doc.status === 'PENDING_AUDIT' ? (
                            <Clock className="w-4 h-4 text-[#2563EB]" />
                          ) : (
                            <FileCheck className="w-4 h-4 text-[#15803D]" />
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
                            className="font-semibold text-[#0F172A] hover:text-[#2563EB] hover:underline text-left cursor-pointer"
                            title="Preview document in browser"
                          >
                            {doc.name}
                          </button>
                          <div className="text-[10px] text-[#64748B]">Uploaded: {doc.uploadedAt}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] font-bold text-[#0F172A]">
                          {doc.version}
                        </td>
                        <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">{doc.size}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#64748B]">
                            <span>{doc.hash.slice(0, 8)}...{doc.hash.slice(-4)}</span>
                            <button
                              onClick={() => handleCopyHash(doc.hash)}
                              className="p-1 hover:text-[#0F172A] rounded"
                              title="Copy SHA-256 Hash"
                            >
                              {copiedHash === doc.hash ? (
                                <Check className="w-3 h-3 text-[#15803D]" />
                              ) : (
                                <Copy className="w-3 h-3 text-[#94A3B8]" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              doc.status === 'VERIFIED'
                                ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                                : doc.status === 'ACTION_REQUIRED'
                                ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                                : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
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
                              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors"
                              title="Preview document in browser"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {doc.status === 'ACTION_REQUIRED' ? (
                              <button
                                onClick={() => setIsReuploadModalOpen(true)}
                                className="px-2.5 py-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-[11px] font-semibold transition-colors shadow-2xs"
                              >
                                Re-Upload
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  alert(`Downloading ${doc.name} (SHA-256 verified)`);
                                }}
                                className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors"
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
            <div id="deliverables" className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden scroll-mt-20">
              <div className="border-b border-[#E2E8F0] px-4 py-3 bg-[#F8FAFC] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Assigned Deliverables
                </h3>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {tasks.filter((t) => t.completed).length} of {tasks.length} Completed
                </span>
              </div>

              <div className="p-4 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                      task.urgent
                        ? 'bg-[#FFFBEB] border-[#FDE68A]'
                        : task.completed
                        ? 'bg-[#F0FDF4]/50 border-[#DCFCE7]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <button
                      onClick={() =>
                        setTasks((prev) =>
                          prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
                        )
                      }
                      className="mt-0.5 text-[#2563EB]"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] flex items-center justify-center">
                          {task.urgent && <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-ping" />}
                        </div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold leading-snug ${
                          task.completed ? 'text-[#64748B] line-through' : 'text-[#0F172A]'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span
                          className={task.urgent ? 'text-[#B45309] font-bold font-mono' : 'text-[#64748B]'}
                        >
                          {task.due}
                        </span>
                        <span className="bg-white text-[#475569] border border-[#E2E8F0] px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TOR Extraction Checklist (Technical) */}
            <div id="tor-extraction" className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden scroll-mt-20">
              <div className="border-b border-[#E2E8F0] px-4 py-3 bg-[#F8FAFC] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  TOR Extraction (Technical)
                </h3>
                <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-1.5 py-0.5 rounded font-bold">
                  Auto-Extracted
                </span>
              </div>

              {/* Progress Coverage Bar */}
              <div className="p-3 bg-[#F8FAFC]/50 border-b border-[#F1F5F9]">
                <div className="flex items-center justify-between mb-1 text-[10px]">
                  <span className="font-bold text-[#64748B] uppercase">Compliance Coverage</span>
                  <span className="font-mono font-bold text-[#0F172A]">{torPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                    style={{ width: `${torPercentage}%` }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-[#F1F5F9]">
                {torItems.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleToggleTor(item.id)}
                    className="p-3 flex items-start gap-2.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-[#15803D]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#CBD5E1]" />
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        item.checked ? 'text-[#334155]' : 'text-[#64748B] italic'
                      }`}
                    >
                      "{item.text}"
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Secure Comms Thread with Prime Lead */}
            <div id="secure-comms" className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden flex flex-col h-[340px] scroll-mt-20">
              <div className="border-b border-[#E2E8F0] px-4 py-3 bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Secure Comms (Prime)
                  </h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="Encrypted Connection Online" />
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]/30 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${msg.isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-[#64748B] px-1">
                      {msg.sender} ({msg.role}) • {msg.timestamp}
                    </span>
                    <div
                      className={`p-2.5 rounded-xl max-w-[90%] shadow-2xs leading-relaxed ${
                        msg.isSelf
                          ? 'bg-[#EFF6FF] text-[#0F172A] border border-[#BFDBFE] rounded-tr-none'
                          : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat input form */}
              <form onSubmit={handleSendChat} className="p-2.5 border-t border-[#E2E8F0] bg-white space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                  <span className="shrink-0 font-semibold text-[#64748B]">Quick reply:</span>
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => insertIntoChatDraft(reply)}
                      className="shrink-0 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[#475569] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
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
                      className="w-full border border-[#CBD5E1] rounded-lg px-3 py-1.5 pr-9 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChatEmojiPicker((open) => !open)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#2563EB]"
                      title="Add emoji"
                      aria-label="Add emoji"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    {showChatEmojiPicker && (
                      <div className="absolute bottom-9 right-0 z-20 flex gap-1 rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-lg">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              insertIntoChatDraft(emoji);
                              setShowChatEmojiPicker(false);
                            }}
                            className="rounded-md p-1 text-base transition-colors hover:bg-[#EFF6FF]"
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
                    className="bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white p-2 rounded-lg transition-colors shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">Upload Certified Revision (v1.1)</h3>
              </div>
              <button
                onClick={() => setIsReuploadModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteReupload} className="space-y-4 pt-4">
              {/* Reviewer flag banner */}
              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs space-y-1">
                <span className="font-bold text-[#92400E] block">Deficiency Flagged by Prime Auditor:</span>
                <p className="text-[#78350F] italic">
                  "Page 4 is missing the external Chartered Accountant seal and signature. Please re-scan in 300 DPI and upload certified revision before T-48h."
                </p>
              </div>

              {/* Target File Info */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Target Document</label>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-xs text-[#0F172A] flex items-center justify-between">
                  <span>Audited_Financials_FY24-25.pdf</span>
                  <span className="text-[10px] bg-[#E2E8F0] px-2 py-0.5 rounded font-bold">Replacing v1.0</span>
                </div>
              </div>

              {/* New File Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">New Certified File Name</label>
                <input
                  type="text"
                  value={reuploadFileName}
                  onChange={(e) => setReuploadFileName(e.target.value)}
                  className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  required
                />
              </div>

              {/* Hash Preview */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#64748B] font-semibold">Simulated SHA-256 Checksum:</span>
                  <span className="text-[#15803D] font-bold">Calculated ✓</span>
                </div>
                <div className="font-mono text-[10px] text-[#475569] break-all bg-white p-2 rounded border border-[#E2E8F0]">
                  9e11f7c228da01b97cf2941160a2b4cd988f01b3a3c2009bf336017bca88102
                </div>
              </div>

              {/* Partner Response Note */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Partner Resolution Note (Visible to Prime Lead)
                </label>
                <textarea
                  value={reuploadComment}
                  onChange={(e) => setReuploadComment(e.target.value)}
                  rows={3}
                  className="w-full border border-[#CBD5E1] rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  placeholder="Explain how the feedback was addressed..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReuploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReupload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E2E8F0]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#D97706]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Audited_Financials_FY24-25.pdf (v1.0)
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Page 4 of 12 • Flagged by Mark D. (Prime Lead)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFlaggedDocModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Mock Viewer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#E2E8F0]/50 flex flex-col items-center">
              <div className="w-full max-w-xl bg-white shadow-lg rounded border border-[#CBD5E1] p-8 space-y-6 relative min-h-[500px]">
                {/* Header Mock */}
                <div className="border-b border-[#E2E8F0] pb-4 flex justify-between items-center text-[10px] text-[#64748B]">
                  <span className="font-bold uppercase tracking-wider">Consortium Technology Partners Ltd.</span>
                  <span>Financial Year 2024-2025 Statement</span>
                </div>

                <div className="space-y-3 text-xs text-[#334155]">
                  <h4 className="font-bold text-sm text-[#0F172A]">Balance Sheet & Auditor Declaration (Page 4)</h4>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    The undersigned representatives have audited the accounts in conformity with International Financial Reporting Standards (IFRS). Total operating revenue of €14,280,000 recorded with liquid reserve of €3,850,000.
                  </p>
                </div>

                {/* Annotation Highlight Box */}
                <div className="p-4 border-2 border-dashed border-[#F59E0B] bg-[#FEF3C7]/40 rounded-xl relative space-y-2 mt-8">
                  <div className="absolute -top-3 left-4 bg-[#D97706] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Audit Flag: Missing Seal
                  </div>
                  <div className="h-20 border border-[#CBD5E1] bg-white/60 rounded flex items-center justify-center text-[#94A3B8] text-xs italic">
                    [External Auditor Official Stamp Zone — Blank]
                  </div>
                  <p className="text-[11px] text-[#92400E] font-medium leading-tight">
                    "Page 4 is missing the external Chartered Accountant seal and signature. Please re-scan in 300 DPI and upload certified revision before T-48h."
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-2xl flex items-center justify-between">
              <span className="text-xs text-[#64748B] font-mono">
                SHA-256: a2c99b1177ef44b0e98031d227b68181a4d87bc0
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFlaggedDocModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setIsFlaggedDocModalOpen(false);
                    setIsReuploadModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">Upload Partner Document</h3>
              </div>
              <button
                onClick={() => setIsNewUploadModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDoc} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Document File Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Subcontractor_Security_Plan.pdf"
                  className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                >
                  <option value="Statutory">Statutory</option>
                  <option value="Technical">Technical</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] text-[#64748B] space-y-1">
                <p className="font-semibold text-[#0F172A]">Security Protocol:</p>
                <p>
                  Documents submitted will be automatically hashed with SHA-256 and queued for Prime Contractor compliance audit under Layer-2 permissions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
