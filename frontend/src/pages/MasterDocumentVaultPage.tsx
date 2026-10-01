import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { DocumentAccessLevel, ReusableDocument } from '../types/tender';
import { CompanyProjectCredentialsManager } from '../components/credentials/CompanyProjectCredentialsManager';
import { fuzzyMatch } from '../utils/fuzzySearch';
import {
  FileCheck,
  Plus,
  Search,
  Download,
  Shield,
  Lock,
  Calendar,
  Link as LinkIcon,
  X,
  CheckCircle2,
  FileText,
  Building2,
  Award,
  Users,
  DollarSign,
  Scale,
  Share2,
  Briefcase,
  Eye,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Upload,
  UploadCloud,
  Loader2,
  Edit2,
  Trash2,
  Save,
} from 'lucide-react';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; label: string }
> = {
  'Company Statutory': {
    icon: Building2,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/40',
    label: 'Statutory & Corporate',
  },
  'Financial & Tax': {
    icon: DollarSign,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    label: 'Financial Audits & Tax',
  },
  'Certifications & ISO': {
    icon: Award,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/40',
    label: 'Certifications & ISO',
  },
  'Key Personnel CV': {
    icon: Users,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800/40',
    label: 'Personnel & CVs',
  },
  'Past Credentials': {
    icon: CheckCircle2,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/40',
    label: 'Past Experience & CC',
  },
  'Legal & Governance': {
    icon: Scale,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/40',
    label: 'Legal & Governance',
  },
};

const ACCESS_CONFIG: Record<
  DocumentAccessLevel,
  { label: string; bg: string; text: string; border: string; dot: string; desc: string }
> = {
  ALL_TEAM: {
    label: 'All Team Members',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
    desc: 'Accessible by all staff and analysts',
  },
  MANAGEMENT_ONLY: {
    label: 'Management Only',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/50',
    dot: 'bg-blue-500',
    desc: 'Directors and Managers only',
  },
  RESTRICTED_FINANCE: {
    label: 'Finance & Legal Only',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-500',
    desc: 'Commercial Finance and Executive Board',
  },
  EXECUTIVE_ONLY: {
    label: 'Executive Board Only',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/50',
    dot: 'bg-rose-500',
    desc: 'Strictly restricted to Business Head',
  },
};

export const MasterDocumentVaultPage: React.FC = () => {
  const {
    reusableDocuments,
    addReusableDocument,
    updateReusableDocument,
    deleteReusableDocument,
    updateDocumentAccess,
    linkReusableDocumentToTender,
    hasDocumentAccess,
    currentUser,
    tenders,
    setActiveDocForShare,
    companyProjects,
    companyProfiles,
  } = useTenders();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'credentials' ? 'PROJECT_CREDENTIALS' : 'DOCUMENTS';
  const [activeLibraryTab, setActiveLibraryTab] = useState<'DOCUMENTS' | 'PROJECT_CREDENTIALS'>(initialTab);

  const handleSwitchTab = (tab: 'DOCUMENTS' | 'PROJECT_CREDENTIALS') => {
    setActiveLibraryTab(tab);
    setSearchParams(tab === 'PROJECT_CREDENTIALS' ? { tab: 'credentials' } : {});
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccess, setSelectedAccess] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  // Modal: Add New Reusable Document
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Company Statutory');
  const [newCompanyName, setNewCompanyName] = useState('PrimeTech Ltd');
  const [newCompanyRole, setNewCompanyRole] = useState<'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR'>('LEAD_BIDDER');
  const [newExpiry, setNewExpiry] = useState('');
  const [newAccess, setNewAccess] = useState<DocumentAccessLevel>('ALL_TEAM');
  const [newDesc, setNewDesc] = useState('');

  // Modal: Reference / Link Document to Tender
  const [docToLink, setDocToLink] = useState<ReusableDocument | null>(null);
  const [targetTenderId, setTargetTenderId] = useState<string>(tenders[0]?.id || '');
  const [targetFolder, setTargetFolder] = useState<string>('02_company_statutory_documents');
  const [linkSuccessMsg, setLinkSuccessMsg] = useState<string | null>(null);

  // Modal: Edit Master Document
  const [editingDoc, setEditingDoc] = useState<ReusableDocument | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Company Statutory',
    companyName: 'PrimeTech Ltd',
    companyRole: 'LEAD_BIDDER' as 'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR',
    expiryDate: '',
    accessLevel: 'ALL_TEAM' as DocumentAccessLevel,
    description: '',
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isEditDragging, setIsEditDragging] = useState(false);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Modal: Delete Document
  const [docToDelete, setDocToDelete] = useState<ReusableDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEditModal = (doc: ReusableDocument) => {
    setEditingDoc(doc);
    setEditFormData({
      name: doc.name || '',
      category: doc.category || 'Company Statutory',
      companyName: doc.companyName || 'PrimeTech Ltd',
      companyRole: (doc.companyRole as any) || (doc.isJvPartner ? 'JV_PARTNER' : 'LEAD_BIDDER'),
      expiryDate: doc.expiryDate || '',
      accessLevel: doc.accessLevel || 'ALL_TEAM',
      description: doc.description || '',
    });
    setEditFile(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setIsEditSaving(true);
    try {
      await updateReusableDocument(
        editingDoc.id,
        {
          name: editFormData.name.trim() || editingDoc.name,
          category: editFormData.category,
          companyName: editFormData.companyName,
          companyRole: editFormData.companyRole,
          isJvPartner: editFormData.companyRole === 'JV_PARTNER',
          accessLevel: editFormData.accessLevel,
          expiryDate: editFormData.expiryDate || undefined,
          description: editFormData.description,
        },
        editFile || undefined
      );
      setEditingDoc(null);
      setEditFile(null);
    } catch (err) {
      console.error('Failed to save document updates:', err);
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteReusableDocument(docToDelete.id);
      setDocToDelete(null);
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    'Company Statutory',
    'Financial & Tax',
    'Certifications & ISO',
    'Key Personnel CV',
    'Past Credentials',
    'Legal & Governance',
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedAccess !== 'ALL' ||
    selectedCompany !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedAccess('ALL');
    setSelectedCompany('ALL');
  };

  const filteredDocs = reusableDocuments.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesAccess =
      selectedAccess === 'ALL' || doc.accessLevel === selectedAccess;
    const matchesCompany =
      selectedCompany === 'ALL' ||
      (selectedCompany === 'JV' && (doc.isJvPartner || doc.companyRole === 'JV_PARTNER')) ||
      (selectedCompany === 'LEAD' && (!doc.isJvPartner && doc.companyRole !== 'JV_PARTNER')) ||
      doc.companyName === selectedCompany;
    const matchesSearch = fuzzyMatch(
      [doc.name, doc.category, doc.companyName, doc.description, doc.sha256],
      searchQuery
    );
    return matchesCategory && matchesAccess && matchesCompany && matchesSearch;
  });

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDocName = newName.trim() || (selectedFile ? selectedFile.name : '');
    if (!finalDocName && !selectedFile) return;

    setIsUploading(true);
    try {
      const calculatedSize = selectedFile
        ? (selectedFile.size >= 1024 * 1024
            ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(selectedFile.size / 1024)} KB`)
        : '2.5 MB';

      await addReusableDocument({
        name: finalDocName,
        category: newCategory,
        companyName: newCompanyName.trim() || 'PrimeTech Ltd',
        companyRole: newCompanyRole,
        isJvPartner: newCompanyRole === 'JV_PARTNER',
        expiryDate: newExpiry || undefined,
        accessLevel: newAccess,
        size: calculatedSize,
        description: newDesc.trim() || undefined,
        file: selectedFile || undefined,
      });

      setNewName('');
      setSelectedFile(null);
      setNewCompanyName('PrimeTech Ltd');
      setNewCompanyRole('LEAD_BIDDER');
      setNewDesc('');
      setNewExpiry('');
      setIsAddModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkToTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToLink || !targetTenderId) return;

    linkReusableDocumentToTender(targetTenderId, docToLink.id, targetFolder);
    const targetTender = tenders.find((t) => t.id === targetTenderId);
    setLinkSuccessMsg(
      `Linked "${docToLink.name}" into ${targetTender?.id || targetTenderId} (${targetFolder})`
    );
    setTimeout(() => {
      setLinkSuccessMsg(null);
      setDocToLink(null);
    }, 2000);
  };

  const renderValidityBadge = (expiryDate?: string) => {
    if (!expiryDate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Perpetual</span>
        </span>
      );
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Expired ({expiryDate})</span>
        </span>
      );
    }

    if (diffDays <= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Expires in {diffDays}d</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>Valid to {expiryDate}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Corporate Repository</span>
            <span>•</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Master Reusable Vault</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-slate-100 tracking-tight">
            Reusable Master Document Library
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 max-w-2xl">
            Central repository of statutory credentials, audited balance sheets, ISO certifications, and CVs. Reference into any tender with 1 click.
          </p>
        </div>

        {activeLibraryTab === 'DOCUMENTS' && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md active:scale-98 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Reusable Master File</span>
          </button>
        )}
      </div>

      {/* Primary Vault Mode Switcher: Reusable Documents vs Company Past Projects & Credentials */}
      <div className="flex items-center gap-1.5 bg-[#F1F5F9] dark:bg-slate-900/80 p-1.5 rounded-2xl w-fit border border-[#E2E8F0] dark:border-slate-800 shadow-2xs overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => handleSwitchTab('DOCUMENTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeLibraryTab === 'DOCUMENTS'
              ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-slate-100 shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Statutory &amp; Master Documents</span>
          <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-900/40">
            {reusableDocuments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab('PROJECT_CREDENTIALS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeLibraryTab === 'PROJECT_CREDENTIALS'
              ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-slate-100 shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Past Projects &amp; Work Orders (WO &amp; CC)</span>
          <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-900/40">
            {companyProjects.length}
          </span>
        </button>

        <Link
          to="/tools/company-profiles"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/40"
        >
          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Corporate Profiles &amp; Financials</span>
          <span className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-900/40">
            {companyProfiles.length}
          </span>
        </Link>
      </div>

      {activeLibraryTab === 'PROJECT_CREDENTIALS' ? (
        <CompanyProjectCredentialsManager />
      ) : (
        <>
          {/* KPI Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Master Files */}
            <Card className="p-4 relative overflow-hidden border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/10 shadow-xs hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                    Total Master Files
                  </span>
                  <div className="font-display text-2xl font-bold text-[#0F172A] dark:text-slate-100 mt-1">
                    {reusableDocuments.length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/40">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Ready for Tender Proposals</span>
              </div>
            </Card>

            {/* Card 2: Company Credentials */}
            <Card className="p-4 relative overflow-hidden border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10 shadow-xs hover:border-emerald-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                    Company Credentials
                  </span>
                  <div className="font-display text-2xl font-bold text-[#0F172A] dark:text-slate-100 mt-1">
                    {reusableDocuments.filter((d) => d.category === 'Company Statutory' || d.category === 'Certifications & ISO').length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400">
                <span>Trade Licenses &amp; ISO Standards</span>
              </div>
            </Card>

            {/* Card 3: Financial & Legal */}
            <Card className="p-4 relative overflow-hidden border-amber-100 dark:border-amber-900/30 bg-gradient-to-br from-white to-amber-50/20 dark:from-slate-900 dark:to-amber-950/10 shadow-xs hover:border-amber-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                    Financial &amp; Legal
                  </span>
                  <div className="font-display text-2xl font-bold text-[#0F172A] dark:text-slate-100 mt-1">
                    {reusableDocuments.filter((d) => d.category === 'Financial & Tax' || d.category === 'Legal & Governance').length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400">
                <span>Audited Statements, Solvency &amp; POA</span>
              </div>
            </Card>

            {/* Card 4: Current Identity Clearance */}
            <Card className="p-4 relative overflow-hidden border-purple-100 dark:border-purple-900/30 bg-gradient-to-br from-white to-purple-50/20 dark:from-slate-900 dark:to-purple-950/10 shadow-xs hover:border-purple-200 transition-all">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                    Your Clearance
                  </span>
                  <div className="font-bold text-sm text-[#0F172A] dark:text-slate-100 mt-1 truncate">
                    {currentUser.name}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{currentUser.role.replace(/_/g, ' ')}</span>
                </span>
              </div>
            </Card>
          </div>

          {/* Unified Command & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by file name, category, SHA-256, or entity..."
                  className="w-full pl-10 pr-9 py-2 bg-[#F8FAFC] dark:bg-slate-800/70 border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Entity & Access Level Dropdowns */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Owning Entity Selector */}
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] dark:bg-slate-800/70 border border-[#E2E8F0] dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Entity:</span>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#0F172A] dark:text-slate-200 border-none focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="ALL">All Entities</option>
                    <option value="LEAD">Lead Bidder (PrimeTech)</option>
                    <option value="JV">JV Consortium Partners</option>
                  </select>
                </div>

                {/* Access Level Selector */}
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] dark:bg-slate-800/70 border border-[#E2E8F0] dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Access:</span>
                  <select
                    value={selectedAccess}
                    onChange={(e) => setSelectedAccess(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#0F172A] dark:text-slate-200 border-none focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="ALL">All Access Levels</option>
                    <option value="ALL_TEAM">All Team Members</option>
                    <option value="MANAGEMENT_ONLY">Management Only</option>
                    <option value="RESTRICTED_FINANCE">Finance &amp; Legal Only</option>
                    <option value="EXECUTIVE_ONLY">Executive Board Only</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills Row */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2.5 border-t border-[#F1F5F9] dark:border-slate-800 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#0F172A] dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-[#F1F5F9] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>All Categories</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {reusableDocuments.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = reusableDocuments.filter((d) => d.category === cat).length;
                const isSelected = selectedCategory === cat;
                const cfg = CATEGORY_CONFIG[cat];
                const IconComponent = cfg?.icon || FileText;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F172A] dark:bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-[#F1F5F9] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cfg?.color || 'text-slate-500'}`} />
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Documents Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-[#F1F5F9] dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-100">
                  Reusable Master Files Dossier
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredDocs.length}</span> of {reusableDocuments.length} master credential(s) available for cross-tender referencing
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-[#E2E8F0] dark:border-slate-800 text-[11px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3.5 min-w-[240px] max-w-[320px]">Master Document</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Owning Entity</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Clearance Scope</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Validity / Expiry</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[#F8FAFC] dark:bg-slate-800 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] z-10 w-[210px] min-w-[210px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800/80">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Search className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">
                            No matching master documents found
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm">
                            Try adjusting your search terms, changing the category, or clearing the active filters.
                          </p>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset All Filters</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const hasAccess = hasDocumentAccess(doc.accessLevel);
                      const catConfig = CATEGORY_CONFIG[doc.category] || {
                        icon: FileText,
                        color: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50 dark:bg-blue-950/40',
                        border: 'border-blue-200 dark:border-blue-800/40',
                      };
                      const Icon = catConfig.icon;
                      const accessBadge = ACCESS_CONFIG[doc.accessLevel] || ACCESS_CONFIG.ALL_TEAM;
                      const isJv = doc.isJvPartner || doc.companyRole === 'JV_PARTNER';

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                          {/* Master Document Column */}
                          <td className="py-3 px-3.5 max-w-[280px]">
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${catConfig.bg} ${catConfig.color} ${catConfig.border} shadow-2xs`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="font-semibold text-xs text-[#0F172A] dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left cursor-pointer leading-snug block truncate"
                                  title={`Click to preview: ${doc.name}`}
                                >
                                  {doc.name}
                                </button>
                                {doc.description && (
                                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5 leading-relaxed truncate" title={doc.description}>
                                    {doc.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
                                    {doc.size || '2.8 MB'}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
                                    {doc.revision || 'v1.0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Owning Entity Column */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isJv ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 shadow-2xs">
                                <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span>{doc.companyName || 'JV Partner'}</span>
                                <span className="text-[9px] font-semibold opacity-75">(JV)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 shadow-2xs">
                                <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span>{doc.companyName || 'PrimeTech Ltd'}</span>
                                <span className="text-[9px] font-semibold opacity-75">(Lead)</span>
                              </span>
                            )}
                          </td>

                          {/* Access Scope Column */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={doc.accessLevel}
                                disabled={currentUser.role === 'TENDER_ANALYST'}
                                onChange={(e) =>
                                  updateDocumentAccess(
                                    doc.id,
                                    e.target.value as DocumentAccessLevel
                                  )
                                }
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all shadow-2xs ${accessBadge.bg} ${accessBadge.text} ${accessBadge.border}`}
                                title={accessBadge.desc}
                              >
                                <option value="ALL_TEAM">All Team Members</option>
                                <option value="MANAGEMENT_ONLY">Management Only</option>
                                <option value="RESTRICTED_FINANCE">Finance &amp; Legal Only</option>
                                <option value="EXECUTIVE_ONLY">Executive Board Only</option>
                              </select>
                            </div>
                          </td>

                          {/* Validity / Expiry Column */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {renderValidityBadge(doc.expiryDate)}
                          </td>

                          {/* Actions Column - Clean Redesigned Unified Action Bar */}
                          <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50/90 dark:group-hover:bg-slate-800/90 transition-colors shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] z-10 w-[210px] min-w-[210px]">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Preview Document */}
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-50 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Preview document in browser"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* 2. Generate Share Link */}
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveDocForShare({
                                    tenderId: 'Master Library',
                                    doc: {
                                      id: doc.id,
                                      name: doc.name,
                                      folder: doc.category,
                                      revision: doc.revision,
                                      uploadedAt: doc.uploadedAt,
                                      size: doc.size,
                                      sha256: doc.sha256,
                                      accessLevel: doc.accessLevel,
                                    },
                                  })
                                }
                                className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-50 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Generate secure shareable link"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* 3. Download or Lock Indicator (Exact same 28px button footprint!) */}
                              {hasAccess ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(`/api/reusable-documents/${doc.id}/download`, '_blank')}
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-50 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                                  title="Download original file"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div
                                  className="p-1.5 text-rose-500 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 rounded-lg cursor-not-allowed shrink-0"
                                  title={`Restricted: Requires ${accessBadge.label} clearance`}
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              )}

                              {/* 4. Primary Action: Reference into Active Tender (Icon Only) */}
                              <button
                                type="button"
                                onClick={() => setDocToLink(doc)}
                                className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                                title="Use in Tender (Reference into active tender)"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* 5. Edit Master Document */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(doc)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-50 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Edit document metadata or replace file"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* 6. Delete Master Document */}
                              <button
                                type="button"
                                onClick={() => setDocToDelete(doc)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-50 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Delete master document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Upload Reusable Document */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Upload Reusable Master File
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedFile(null);
                }}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs">
              {/* Interactive File Dropzone */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#0F172A]">
                  Select Master Document File <span className="text-[#DC2626]">*</span>
                </label>

                {selectedFile ? (
                  <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F172A] truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-[#15803D] font-mono">
                          {selectedFile.size >= 1024 * 1024
                            ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : `${Math.round(selectedFile.size / 1024)} KB`}{' '}
                          • Ready for secure cataloging
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-[#DBEAFE] rounded-md transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 text-[#94A3B8] hover:text-[#DC2626] rounded-md hover:bg-[#FEE2E2] transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setSelectedFile(file);
                        if (!newName) {
                          setNewName(file.name);
                        }
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.zip"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setSelectedFile(file);
                          if (!newName) {
                            setNewName(file.name);
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-[#0F172A]">
                        <span className="font-bold text-[#2563EB] hover:underline">
                          Click to browse
                        </span>{' '}
                        or drag and drop document file
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        PDF, Word, Excel, Images, or ZIP archives (max 50 MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO_27001_Global_Security_Accreditation_2026.pdf"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {/* Owning Entity & Role for Multi-Company Disambiguation */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Owning Entity Role *
                  </label>
                  <select
                    value={newCompanyRole}
                    onChange={(e) => {
                      const role = e.target.value as 'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR';
                      setNewCompanyRole(role);
                      if (role === 'LEAD_BIDDER' && newCompanyName === 'DataCore Systems Ltd') {
                        setNewCompanyName('PrimeTech Ltd');
                      } else if (role === 'JV_PARTNER' && newCompanyName === 'PrimeTech Ltd') {
                        setNewCompanyName('DataCore Systems Ltd');
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="LEAD_BIDDER">🏛️ Lead Bidder</option>
                    <option value="JV_PARTNER">⭐ JV Partner</option>
                    <option value="SUBCONTRACTOR">🤝 Subcontractor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Company / Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PrimeTech Ltd or JV Partner"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Document Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Validity / Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Access &amp; Security Permission Scope *
                </label>
                <select
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value as DocumentAccessLevel)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="ALL_TEAM">🌐 All Team Members (Public to organization)</option>
                  <option value="MANAGEMENT_ONLY">🛡️ Management Only (Directors &amp; Managers)</option>
                  <option value="RESTRICTED_FINANCE">🔒 Finance &amp; Legal Only (Confidential Financials)</option>
                  <option value="EXECUTIVE_ONLY">👑 Executive Board Only (C-Level Clearance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Brief Description / Scope of Use
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Certified copy of ISO audit report valid across EMEA and Asia..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[11px] text-[#1D4ED8]">
                <strong>Multi-Company Storage Isolation:</strong> Files are cataloged with their owning company entity ({newCompanyName || 'Entity'}) to prevent name collisions and allow instant reuse across JV proposals.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#1E293B] shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading &amp; Hashing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Save to Master Library</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reference / Link Document to Project Tender */}
      {docToLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Reference Document in Tender Project
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDocToLink(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {linkSuccessMsg ? (
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <p className="text-xs font-bold text-[#15803D]">{linkSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleLinkToTender} className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                    Referencing Master Document:
                  </span>
                  <span className="font-semibold text-xs text-[#0F172A] block mt-0.5">
                    {docToLink.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B]">
                    <span>Category: {docToLink.category}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#0F172A]">
                      {docToLink.companyName || 'PrimeTech Ltd'} ({docToLink.companyRole || 'LEAD_BIDDER'})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Select Target Tender Opportunity *
                  </label>
                  <select
                    value={targetTenderId}
                    onChange={(e) => {
                      const newTid = e.target.value;
                      setTargetTenderId(newTid);
                      const targetTdr = tenders.find((t) => t.id === newTid);
                      const hasJv = Boolean(
                        targetTdr?.summary?.jv?.participation?.toLowerCase().includes('allow') ||
                        targetTdr?.summary?.jv?.leadMember ||
                        targetTdr?.summary?.jv?.localPartner ||
                        docToLink?.isJvPartner ||
                        docToLink?.companyRole === 'JV_PARTNER'
                      );
                      if (hasJv && (docToLink?.isJvPartner || docToLink?.companyRole === 'JV_PARTNER')) {
                        setTargetFolder('02A_jv_partner_credentials');
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title} ({t.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Destination Vault Folder in Proposal *
                  </label>
                  <select
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {/* JV Partner Folder prioritized at top when JV is detected */}
                    <option value="02A_jv_partner_credentials" className="font-bold text-amber-700 bg-amber-50">
                      ⭐ 02A JV Partner Credentials &amp; Statutory Dossier
                    </option>
                    <option value="02_company_statutory_documents">
                      📁 02 Company Statutory Credentials (Lead Bidder)
                    </option>
                    <option value="01_original_tender_documents">
                      📁 01 Original RFP Notices &amp; Addenda
                    </option>
                    <option value="03_technical_proposal">
                      📁 03 Technical Proposal &amp; Architecture
                    </option>
                    <option value="04_financial_proposal">
                      📁 04 Financial Proposal &amp; BOQ Tables
                    </option>
                    <option value="05_final_submission_package">
                      📁 05 Compiled Sealed Submission Package
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setDocToLink(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] shadow-sm transition-colors"
                  >
                    Link to Project Folder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Master Document */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                    Edit Master Document Details
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>ID: <code className="font-mono text-slate-700 dark:text-slate-300">{editingDoc.id}</code></span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">{editingDoc.revision || 'v1.0'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingDoc(null);
                  setEditFile(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Document Title */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Owning Entity Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owning Entity Role *
                  </label>
                  <select
                    value={editFormData.companyRole}
                    onChange={(e) => {
                      const role = e.target.value as any;
                      setEditFormData({
                        ...editFormData,
                        companyRole: role,
                        companyName: role === 'LEAD_BIDDER' ? 'PrimeTech Ltd' : (editFormData.companyName === 'PrimeTech Ltd' ? '' : editFormData.companyName),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="LEAD_BIDDER">Lead Bidder (PrimeTech)</option>
                    <option value="JV_PARTNER">JV / Consortium Partner</option>
                    <option value="SUBCONTRACTOR">Nominated Subcontractor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Category & Clearance Scope */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clearance Scope *
                  </label>
                  <select
                    value={editFormData.accessLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, accessLevel: e.target.value as DocumentAccessLevel })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ALL_TEAM">Public Team (All Bid Members)</option>
                    <option value="RESTRICTED_TEAM">Restricted Team (Assigned Leads)</option>
                    <option value="CONFIDENTIAL_FINANCIAL">Confidential Financial (CFO/Estimators)</option>
                    <option value="CONFIDENTIAL_MANAGEMENT">Confidential Management (Directors Only)</option>
                  </select>
                </div>
              </div>

              {/* Validity Date */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Validity / Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={editFormData.expiryDate}
                  onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Compliance Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  placeholder="e.g. FY2023-24 Audited Balance sheet with Tax Clearances..."
                />
              </div>

              {/* File Replacement Dropzone */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Replace Master File (Optional)
                </label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsEditDragging(true);
                  }}
                  onDragLeave={() => setIsEditDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsEditDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setEditFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => editFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isEditDragging
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                      : editFile
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  {editFile ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {editFile.name}
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {(editFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to replace (Revision will increment)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditFile(null);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Remove replacement file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1">
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        Click to select or drag replacement file
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Current file: <span className="font-mono text-slate-600 dark:text-slate-400">{editingDoc.size}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setEditFile(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isEditSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                  Delete Master Document
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-slate-200">{docToDelete.name}</strong> (<code className="font-mono text-[11px]">{docToDelete.id}</code>)?
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                  Note: This removes the document from the Master Vault and local storage. Active tenders that already linked snapshot copies will keep their files.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Document Preview Modal (Clean View) */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc ? {
          ...previewDoc,
          previewUrl: `/api/reusable-documents/${previewDoc.id}/preview`,
          downloadUrl: `/api/reusable-documents/${previewDoc.id}/download`,
        } : null}
        tenderId="Master Library"
        onShare={() => {
          if (previewDoc) {
            setActiveDocForShare({ tenderId: 'Master Library', doc: previewDoc });
          }
        }}
      />
    </div>
  );
};
