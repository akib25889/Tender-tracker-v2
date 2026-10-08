import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { DocumentAccessLevel, ReusableDocument, CompanyProfile } from '../types/tender';
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
  Upload,
  UploadCloud,
  Loader2,
  Edit2,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { DocumentPreviewModal } from '../components/modals/DocumentPreviewModal';

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; label: string }
> = {
  'Company Statutory': {
    icon: Building2,
    color: 'text-[var(--accent)]',
    bg: 'bg-[var(--accent-soft)]',
    border: 'border-[var(--accent-line)]',
    label: 'Statutory & Corporate',
  },
  'Financial & Tax': {
    icon: DollarSign,
    color: 'text-[var(--ok)]',
    bg: 'bg-[var(--ok-soft)]',
    border: 'border-[var(--ok-line)]',
    label: 'Financial Audits & Tax',
  },
  'Certifications & ISO': {
    icon: Award,
    color: 'text-[var(--text-secondary)]',
    bg: 'bg-[var(--bg-subtle)]',
    border: 'border-[var(--border-default)]',
    label: 'Certifications & ISO',
  },
  'Key Personnel CV': {
    icon: Users,
    color: 'text-[var(--accent)]',
    bg: 'bg-[var(--accent-soft)]',
    border: 'border-[var(--accent-line)]',
    label: 'Personnel & CVs',
  },
  'Past Credentials': {
    icon: CheckCircle2,
    color: 'text-[var(--text-secondary)]',
    bg: 'bg-[var(--bg-subtle)]',
    border: 'border-[var(--border-default)]',
    label: 'Past Experience & CC',
  },
  'Legal & Governance': {
    icon: Scale,
    color: 'text-[var(--warn)]',
    bg: 'bg-[var(--warn-soft)]',
    border: 'border-[var(--warn-line)]',
    label: 'Legal & Governance',
  },
};

const ACCESS_CONFIG: Record<
  DocumentAccessLevel,
  { label: string; bg: string; text: string; border: string; dot: string; desc: string }
> = {
  ALL_TEAM: {
    label: 'All Team Members',
    bg: 'bg-[var(--ok-soft)]',
    text: 'text-[var(--ok)]',
    border: 'border-[var(--ok-line)]',
    dot: 'bg-[var(--ok)]',
    desc: 'Accessible by all staff and analysts',
  },
  MANAGEMENT_ONLY: {
    label: 'Management Only',
    bg: 'bg-[var(--accent-soft)]',
    text: 'text-[var(--accent)]',
    border: 'border-[var(--accent-line)]',
    dot: 'bg-[var(--accent)]',
    desc: 'Directors and Managers only',
  },
  RESTRICTED_FINANCE: {
    label: 'Finance & Legal Only',
    bg: 'bg-[var(--warn-soft)]',
    text: 'text-[var(--warn)]',
    border: 'border-[var(--warn-line)]',
    dot: 'bg-[var(--warn)]',
    desc: 'Commercial Finance and Executive Board',
  },
  EXECUTIVE_ONLY: {
    label: 'Executive Board Only',
    bg: 'bg-[var(--crit-soft)]',
    text: 'text-[var(--crit)]',
    border: 'border-[var(--crit-line)]',
    dot: 'bg-[var(--crit)]',
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
    addCompanyProfile,
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

  // Company Profile selection & manual mode states for Upload Modal
  const [selectedCompanyProfileId, setSelectedCompanyProfileId] = useState<string>('COMP-PRIMETECH');
  const [isManualCompany, setIsManualCompany] = useState<boolean>(false);
  const [isQuickCreatingCompany, setIsQuickCreatingCompany] = useState<boolean>(false);
  const [quickLegalName, setQuickLegalName] = useState<string>('');
  const [quickRole, setQuickRole] = useState<'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR'>('JV_PARTNER');
  const [isQuickSavingCompany, setIsQuickSavingCompany] = useState<boolean>(false);

  // Company Profile selection & manual mode states for Edit Modal
  const [editSelectedProfileId, setEditSelectedProfileId] = useState<string>('COMP-PRIMETECH');
  const [editIsManualCompany, setEditIsManualCompany] = useState<boolean>(false);
  const [isEditQuickCreating, setIsEditQuickCreating] = useState<boolean>(false);
  const [editQuickLegalName, setEditQuickLegalName] = useState<string>('');
  const [editQuickRole, setEditQuickRole] = useState<'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR'>('JV_PARTNER');
  const [isEditQuickSaving, setIsEditQuickSaving] = useState<boolean>(false);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setIsManualCompany(false);
    setIsQuickCreatingCompany(false);
    const lead = companyProfiles.find((p) => p.company_role === 'LEAD_BIDDER') || companyProfiles[0];
    if (lead) {
      setSelectedCompanyProfileId(lead.id);
      setNewCompanyName(lead.trade_name || lead.legal_name);
      setNewCompanyRole(
        lead.company_role === 'LEAD_BIDDER' || lead.company_role === 'JV_PARTNER' || lead.company_role === 'SUBCONTRACTOR'
          ? (lead.company_role as any)
          : 'LEAD_BIDDER'
      );
    } else {
      setSelectedCompanyProfileId('__MANUAL__');
      setIsManualCompany(true);
    }
  };

  const handleQuickCreateCompany = async (target: 'UPLOAD' | 'EDIT') => {
    const legalName = (target === 'UPLOAD' ? quickLegalName : editQuickLegalName).trim();
    const role = target === 'UPLOAD' ? quickRole : editQuickRole;
    if (!legalName) return;

    if (target === 'UPLOAD') setIsQuickSavingCompany(true);
    else setIsEditQuickSaving(true);

    try {
      const id = `COMP-${legalName.toUpperCase().replace(/[^A-Z0-9]/g, '') || Date.now()}`;
      const payload: Partial<CompanyProfile> = {
        id,
        legal_name: legalName,
        trade_name: legalName,
        company_role: role,
        entity_type: 'Private Limited Company',
        country: 'Bangladesh',
        status: 'ACTIVE',
      };
      const created = await addCompanyProfile(payload);
      if (created) {
        if (target === 'UPLOAD') {
          setSelectedCompanyProfileId(created.id);
          setNewCompanyName(created.trade_name || created.legal_name);
          setNewCompanyRole(role);
          setIsManualCompany(false);
          setIsQuickCreatingCompany(false);
          setQuickLegalName('');
        } else {
          setEditSelectedProfileId(created.id);
          setEditFormData((prev) => ({
            ...prev,
            companyName: created.trade_name || created.legal_name,
            companyRole: role,
          }));
          setEditIsManualCompany(false);
          setIsEditQuickCreating(false);
          setEditQuickLegalName('');
        }
      }
    } catch (err) {
      console.error('Failed to quick create company profile:', err);
    } finally {
      if (target === 'UPLOAD') setIsQuickSavingCompany(false);
      else setIsEditQuickSaving(false);
    }
  };

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
    setIsEditQuickCreating(false);

    const docCo = (doc.companyName || '').trim().toLowerCase();
    const matchingProfile = companyProfiles.find(
      (p) =>
        (p.trade_name && p.trade_name.trim().toLowerCase() === docCo) ||
        (p.legal_name && p.legal_name.trim().toLowerCase() === docCo)
    );

    if (matchingProfile) {
      setEditSelectedProfileId(matchingProfile.id);
      setEditIsManualCompany(false);
    } else {
      setEditSelectedProfileId('__MANUAL__');
      setEditIsManualCompany(true);
    }

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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)] whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)]" />
          <span>Perpetual</span>
        </span>
      );
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--crit-soft)] text-[var(--crit)] border border-[var(--crit-line)] whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--crit)]" />
          <span>Expired ({expiryDate})</span>
        </span>
      );
    }

    if (diffDays <= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn-line)] whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-[var(--warn)]" />
          <span>Expires in {diffDays}d</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span>Valid to {expiryDate}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
            <span>Corporate Repository</span>
            <span>•</span>
            <span className="font-semibold text-[var(--accent)]">Master Reusable Vault</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Reusable Master Document Library
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-2xl">
            Central repository of statutory credentials, audited balance sheets, ISO certifications, and CVs. Reference into any tender with 1 click.
          </p>
        </div>

        {activeLibraryTab === 'DOCUMENTS' && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--accent-on)] rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md active:scale-98 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Reusable Master File</span>
          </button>
        )}
      </div>

      {/* Primary Vault Mode Switcher: Reusable Documents vs Company Past Projects & Credentials */}
      <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] p-1.5 rounded-2xl w-fit border border-[var(--border-default)] shadow-2xs overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => handleSwitchTab('DOCUMENTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 activeLibraryTab === 'DOCUMENTS'
 ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[var(--accent)]" />
          <span>Statutory &amp; Master Documents</span>
          <span className="text-[10px] font-mono bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-full font-bold border border-[var(--accent-line)]">
            {reusableDocuments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab('PROJECT_CREDENTIALS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 activeLibraryTab === 'PROJECT_CREDENTIALS'
 ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[var(--ok)]" />
          <span>Past Projects &amp; Work Orders (WO &amp; CC)</span>
          <span className="text-[10px] font-mono bg-[var(--ok-soft)] text-[var(--ok)] px-2 py-0.5 rounded-full font-bold border border-[var(--ok-line)]">
            {companyProjects.length}
          </span>
        </button>

        <Link
          to="/tools/company-profiles"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60"
        >
          <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>Corporate Profiles &amp; Financials</span>
          <span className="text-[10px] font-mono bg-[var(--bg-subtle)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full font-bold border border-[var(--border-default)]">
            {companyProfiles.length}
          </span>
        </Link>
      </div>

      {activeLibraryTab === 'PROJECT_CREDENTIALS' ? (
        <CompanyProjectCredentialsManager />
      ) : (
        <>
          {/* KPI Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Master Files */}
            <Card className="p-4 relative overflow-hidden border-[var(--accent-line)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--accent-soft)]/20 shadow-xs hover:border-[var(--accent-line)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Total Master Files
                  </span>
                  <div className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {reusableDocuments.length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent-line)]/50">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--border-default)] text-[11px] text-[var(--ok)] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Ready for Tender Proposals</span>
              </div>
            </Card>

            {/* Card 2: Company Credentials */}
            <Card className="p-4 relative overflow-hidden border-[var(--ok-line)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--ok-soft)]/20 shadow-xs hover:border-[var(--ok-line)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Company Credentials
                  </span>
                  <div className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {reusableDocuments.filter((d) => d.category === 'Company Statutory' || d.category === 'Certifications & ISO').length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[var(--ok)]/10 text-[var(--ok)] flex items-center justify-center shrink-0 border border-[var(--ok-line)]/50">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--border-default)] text-[11px] text-[var(--text-secondary)]">
                <span>Trade Licenses &amp; ISO Standards</span>
              </div>
            </Card>

            {/* Card 3: Financial & Legal */}
            <Card className="p-4 relative overflow-hidden border-[var(--warn-line)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--warn-soft)]/20 shadow-xs hover:border-[var(--warn-line)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Financial &amp; Legal
                  </span>
                  <div className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {reusableDocuments.filter((d) => d.category === 'Financial & Tax' || d.category === 'Legal & Governance').length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[var(--warn)]/10 text-[var(--warn)] flex items-center justify-center shrink-0 border border-[var(--warn-line)]/50">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--border-default)] text-[11px] text-[var(--text-secondary)]">
                <span>Audited Statements, Solvency &amp; POA</span>
              </div>
            </Card>
          </div>

          {/* Unified Command & Filter Toolbar */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by file name, category, SHA-256, or entity..."
                  className="w-full pl-10 pr-9 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Entity & Access Level Dropdowns */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Owning Entity Selector */}
                <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)] font-medium">Entity:</span>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--text-primary)] border-none focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="ALL">All Entities</option>
                    <option value="LEAD">Lead Bidder (PrimeTech)</option>
                    <option value="JV">JV Consortium Partners</option>
                  </select>
                </div>

                {/* Access Level Selector */}
                <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)] font-medium">Access:</span>
                  <select
                    value={selectedAccess}
                    onChange={(e) => setSelectedAccess(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--text-primary)] border-none focus:outline-none cursor-pointer pr-1"
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[var(--crit)] hover:bg-[var(--crit-soft)] rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills Row */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2.5 border-t border-[var(--border-subtle)] scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
 selectedCategory === 'ALL'
 ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <span>All Categories</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
 selectedCategory === 'ALL' ? 'bg-[var(--bg-surface)]/20 text-[var(--accent-on)]' : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
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
 ? 'bg-[var(--accent)] text-[var(--accent-on)] font-bold shadow-xs'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent-on)]' : cfg?.color || 'text-[var(--text-secondary)]'}`} />
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
 isSelected ? 'bg-[var(--bg-surface)]/20 text-[var(--accent-on)]' : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
 }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Documents Table */}
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Reusable Master Files Dossier
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Showing <span className="font-semibold text-[var(--accent)]">{filteredDocs.length}</span> of {reusableDocuments.length} master credential(s) available for cross-tender referencing
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="py-3 px-3.5 min-w-[240px] max-w-[320px]">Master Document</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Owning Entity</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Clearance Scope</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Validity / Expiry</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[var(--bg-subtle)] shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] z-10 w-[210px] min-w-[210px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                            <Search className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            No matching master documents found
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                            Try adjusting your search terms, changing the category, or clearing the active filters.
                          </p>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-soft)] text-[var(--accent)] rounded-lg text-xs font-semibold hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
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
                        color: 'text-[var(--accent)]',
                        bg: 'bg-[var(--accent-soft)]',
                        border: 'border-[var(--accent-line)]',
                      };
                      const Icon = catConfig.icon;
                      const accessBadge = ACCESS_CONFIG[doc.accessLevel] || ACCESS_CONFIG.ALL_TEAM;
                      const isJv = doc.isJvPartner || doc.companyRole === 'JV_PARTNER';

                      return (
                        <tr key={doc.id} className="hover:bg-[var(--bg-subtle)]/70 transition-colors group">
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
                                  className="font-semibold text-xs text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline text-left cursor-pointer leading-snug block truncate"
                                  title={`Click to preview: ${doc.name}`}
                                >
                                  {doc.name}
                                </button>
                                {doc.description && (
                                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed truncate" title={doc.description}>
                                    {doc.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-mono font-medium">
                                    {doc.size || '2.8 MB'}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-mono font-medium">
                                    {doc.revision || 'v1.0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Owning Entity Column */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isJv ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs">
                                <Users className="w-3 h-3 text-[var(--text-secondary)]" />
                                <span>{doc.companyName || 'JV Partner'}</span>
                                <span className="text-[9px] font-semibold opacity-75">(JV)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] shadow-2xs">
                                <Building2 className="w-3 h-3 text-[var(--accent)]" />
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
                          <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[var(--bg-surface)] group-hover:bg-[var(--bg-subtle)]/90 transition-colors shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] z-10 w-[210px] min-w-[210px]">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Preview Document */}
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)]/80 rounded-lg transition-colors cursor-pointer shrink-0"
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
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)]/80 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Generate secure shareable link"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* 3. Download or Lock Indicator (Exact same 28px button footprint!) */}
                              {hasAccess ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(`/api/reusable-documents/${doc.id}/download`, '_blank')}
                                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--ok)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)]/80 rounded-lg transition-colors cursor-pointer shrink-0"
                                  title="Download original file"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div
                                  className="p-1.5 text-[var(--crit)] bg-[var(--crit-soft)]/70 border border-[var(--crit-line)]/80 rounded-lg cursor-not-allowed shrink-0"
                                  title={`Restricted: Requires ${accessBadge.label} clearance`}
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              )}

                              {/* 4. Primary Action: Reference into Active Tender (Icon Only) */}
                              <button
                                type="button"
                                onClick={() => setDocToLink(doc)}
                                className="p-1.5 text-[var(--accent-on)] bg-[var(--accent)] hover:bg-[var(--accent)] active:scale-95 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                                title="Use in Tender (Reference into active tender)"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* 5. Edit Master Document */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(doc)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--warn)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)]/80 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Edit document metadata or replace file"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* 6. Delete Master Document */}
                              <button
                                type="button"
                                onClick={() => setDocToDelete(doc)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--crit)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)]/80 rounded-lg transition-colors cursor-pointer shrink-0"
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
        <div className="tt-overlay items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                  Upload Reusable Master File
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedFile(null);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs">
              {/* Interactive File Dropzone */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[var(--text-primary)]">
                  Select Master Document File <span className="text-[var(--crit)]">*</span>
                </label>

                {selectedFile ? (
                  <div className="p-3 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-[var(--ok)] font-mono">
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
                        className="px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-md transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--crit)] rounded-md hover:bg-[var(--crit-soft)] transition-colors"
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
 ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[var(--border-strong)] bg-[var(--bg-subtle)] hover:border-[var(--accent)] hover:bg-[var(--bg-subtle)]'
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
                      <div className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-[var(--text-primary)]">
                        <span className="font-bold text-[var(--accent)] hover:underline">
                          Click to browse
                        </span>{' '}
                        or drag and drop document file
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        PDF, Word, Excel, Images, or ZIP archives (max 50 MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO_27001_Global_Security_Accreditation_2026.pdf"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              {/* Owning Entity & Profile Selection */}
              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Company / Owning Entity *</span>
                  </span>

                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const nextManual = !isManualCompany;
                        setIsManualCompany(nextManual);
                        if (!nextManual) {
                          const profile = companyProfiles.find((p) => p.id === selectedCompanyProfileId) || companyProfiles[0];
                          if (profile) {
                            setNewCompanyName(profile.trade_name || profile.legal_name);
                            if (profile.company_role === 'LEAD_BIDDER' || profile.company_role === 'JV_PARTNER' || profile.company_role === 'SUBCONTRACTOR') {
                              setNewCompanyRole(profile.company_role as any);
                            }
                          }
                        }
                      }}
                      className="text-[var(--accent)] hover:underline font-semibold cursor-pointer"
                    >
                      {isManualCompany ? '🏢 Select from Profiles' : '✏️ Add Manually'}
                    </button>
                    <span className="text-[var(--text-muted)]">•</span>
                    <button
                      type="button"
                      onClick={() => setIsQuickCreatingCompany(!isQuickCreatingCompany)}
                      className="text-[var(--ok)] hover:underline font-semibold cursor-pointer"
                    >
                      {isQuickCreatingCompany ? 'Close Creator' : '➕ New Profile'}
                    </button>
                  </div>
                </div>

                {/* Quick Add Company Profile Form (Inline Expander) */}
                {isQuickCreatingCompany && (
                  <div className="p-3 bg-[var(--ok-soft)]/70 border border-[var(--ok-line)] rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ok)] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Company Profile</span>
                      </span>
                      <a
                        href="/tools/company-profiles"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[var(--ok)] hover:underline font-medium"
                      >
                        Open Full Profile Manager ↗
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-[var(--text-primary)] mb-0.5">
                          Company Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Joint Venture Ltd"
                          value={quickLegalName}
                          onChange={(e) => setQuickLegalName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--ok-line)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ok)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[var(--text-primary)] mb-0.5">
                          Entity Role *
                        </label>
                        <select
                          value={quickRole}
                          onChange={(e) => setQuickRole(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--ok-line)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ok)]"
                        >
                          <option value="LEAD_BIDDER">🏛️ Lead Bidder</option>
                          <option value="JV_PARTNER">⭐ JV Partner</option>
                          <option value="SUBCONTRACTOR">🤝 Subcontractor</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--ok-line)]/60">
                      <button
                        type="button"
                        onClick={() => setIsQuickCreatingCompany(false)}
                        className="px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isQuickSavingCompany || !quickLegalName.trim()}
                        onClick={() => handleQuickCreateCompany('UPLOAD')}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[var(--ok)] hover:bg-[var(--ok)] text-[var(--accent-on)] rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isQuickSavingCompany ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Save &amp; Select Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Company Selection: Either Dropdown or Manual Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Owning Entity Role *
                    </label>
                    <select
                      value={newCompanyRole}
                      onChange={(e) => {
                        const role = e.target.value as 'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR';
                        setNewCompanyRole(role);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    >
                      <option value="LEAD_BIDDER">🏛️ Lead Bidder</option>
                      <option value="JV_PARTNER">⭐ JV Partner</option>
                      <option value="SUBCONTRACTOR">🤝 Subcontractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      {isManualCompany ? 'Company / Entity Name (Manual) *' : 'Select Company Profile *'}
                    </label>
                    {isManualCompany ? (
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Joint Venture Ltd"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    ) : (
                      <select
                        value={selectedCompanyProfileId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__MANUAL__') {
                            setIsManualCompany(true);
                          } else if (val === '__NEW__') {
                            setIsQuickCreatingCompany(true);
                          } else {
                            setSelectedCompanyProfileId(val);
                            const found = companyProfiles.find((p) => p.id === val);
                            if (found) {
                              setNewCompanyName(found.trade_name || found.legal_name);
                              if (found.company_role === 'LEAD_BIDDER' || found.company_role === 'JV_PARTNER' || found.company_role === 'SUBCONTRACTOR') {
                                setNewCompanyRole(found.company_role as any);
                              }
                            }
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      >
                        <optgroup label="🏢 Registered Company Profiles">
                          {companyProfiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.company_role === 'LEAD_BIDDER' ? '🏛️' : p.company_role === 'JV_PARTNER' ? '⭐' : '🤝'} {p.trade_name || p.legal_name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="⚙️ Custom &amp; Manual Options">
                          <option value="__MANUAL__">✏️ Enter Custom Name Manually...</option>
                          <option value="__NEW__">➕ Create New Company Profile...</option>
                        </optgroup>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Document Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Validity / Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Access &amp; Security Permission Scope *
                </label>
                <select
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value as DocumentAccessLevel)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="ALL_TEAM">🌐 All Team Members (Public to organization)</option>
                  <option value="MANAGEMENT_ONLY">🛡️ Management Only (Directors &amp; Managers)</option>
                  <option value="RESTRICTED_FINANCE">🔒 Finance &amp; Legal Only (Confidential Financials)</option>
                  <option value="EXECUTIVE_ONLY">👑 Executive Board Only (C-Level Clearance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Brief Description / Scope of Use
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Certified copy of ISO audit report valid across EMEA and Asia..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="p-3 bg-[var(--accent-soft)] border border-[var(--accent-line)] rounded-lg text-[11px] text-[var(--accent)]">
                <strong>Multi-Company Storage Isolation:</strong> Files are cataloged with their owning company entity ({newCompanyName || 'Entity'}) to prevent name collisions and allow instant reuse across JV proposals.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-on)] font-semibold hover:bg-[var(--accent-hover)] shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
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
        <div className="tt-overlay items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                  Reference Document in Tender Project
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDocToLink(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {linkSuccessMsg ? (
              <div className="p-4 bg-[var(--ok-soft)] border border-[var(--ok-line)] rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[var(--ok)] mx-auto" />
                <p className="text-xs font-bold text-[var(--ok)]">{linkSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleLinkToTender} className="space-y-3.5 text-xs">
                <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider block">
                    Referencing Master Document:
                  </span>
                  <span className="font-semibold text-xs text-[var(--text-primary)] block mt-0.5">
                    {docToLink.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)]">
                    <span>Category: {docToLink.category}</span>
                    <span>•</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {docToLink.companyName || 'PrimeTech Ltd'} ({docToLink.companyRole || 'LEAD_BIDDER'})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
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
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title} ({t.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Destination Vault Folder in Proposal *
                  </label>
                  <select
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    {/* JV Partner Folder prioritized at top when JV is detected */}
                    <option value="02A_jv_partner_credentials" className="font-bold text-[var(--warn)] bg-[var(--warn-soft)]">
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

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setDocToLink(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-on)] font-semibold hover:bg-[var(--accent-hover)] shadow-sm transition-colors"
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
        <div className="tt-overlay items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[var(--warn)]" />
                <div>
                  <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                    Edit Master Document Details
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] mt-0.5">
                    <span>ID: <code className="font-mono text-[var(--text-primary)]">{editingDoc.id}</code></span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 bg-[var(--bg-subtle)] rounded font-semibold text-[var(--text-secondary)]">{editingDoc.revision || 'v1.0'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingDoc(null);
                  setEditFile(null);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Document Title */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Document Title / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
                />
              </div>

              {/* Owning Entity & Profile Selection */}
              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[var(--warn)]" />
                    <span>Company / Owning Entity *</span>
                  </span>

                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const nextManual = !editIsManualCompany;
                        setEditIsManualCompany(nextManual);
                        if (!nextManual) {
                          const profile = companyProfiles.find((p) => p.id === editSelectedProfileId) || companyProfiles[0];
                          if (profile) {
                            setEditFormData((prev) => ({
                              ...prev,
                              companyName: profile.trade_name || profile.legal_name,
                              companyRole: (profile.company_role === 'LEAD_BIDDER' || profile.company_role === 'JV_PARTNER' || profile.company_role === 'SUBCONTRACTOR')
                                ? (profile.company_role as any)
                                : prev.companyRole,
                            }));
                          }
                        }
                      }}
                      className="text-[var(--warn)] hover:underline font-semibold cursor-pointer"
                    >
                      {editIsManualCompany ? '🏢 Select from Profiles' : '✏️ Add Manually'}
                    </button>
                    <span className="text-[var(--text-muted)]">•</span>
                    <button
                      type="button"
                      onClick={() => setIsEditQuickCreating(!isEditQuickCreating)}
                      className="text-[var(--ok)] hover:underline font-semibold cursor-pointer"
                    >
                      {isEditQuickCreating ? 'Close Creator' : '➕ New Profile'}
                    </button>
                  </div>
                </div>

                {/* Quick Add Company Profile Form (Inline Expander in Edit Modal) */}
                {isEditQuickCreating && (
                  <div className="p-3 bg-[var(--ok-soft)]/70 border border-[var(--ok-line)] rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ok)] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Company Profile</span>
                      </span>
                      <a
                        href="/tools/company-profiles"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[var(--ok)] hover:underline font-medium"
                      >
                        Open Full Profile Manager ↗
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-[var(--text-primary)] mb-0.5">
                          Company Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Joint Venture Ltd"
                          value={editQuickLegalName}
                          onChange={(e) => setEditQuickLegalName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--ok-line)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ok)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[var(--text-primary)] mb-0.5">
                          Entity Role *
                        </label>
                        <select
                          value={editQuickRole}
                          onChange={(e) => setEditQuickRole(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--ok-line)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ok)]"
                        >
                          <option value="LEAD_BIDDER">🏛️ Lead Bidder</option>
                          <option value="JV_PARTNER">⭐ JV Partner</option>
                          <option value="SUBCONTRACTOR">🤝 Subcontractor</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--ok-line)]/60">
                      <button
                        type="button"
                        onClick={() => setIsEditQuickCreating(false)}
                        className="px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isEditQuickSaving || !editQuickLegalName.trim()}
                        onClick={() => handleQuickCreateCompany('EDIT')}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[var(--ok)] hover:bg-[var(--ok)] text-[var(--accent-on)] rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isEditQuickSaving ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Save &amp; Select Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Company Selection: Either Dropdown or Manual Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Owning Entity Role *
                    </label>
                    <select
                      value={editFormData.companyRole}
                      onChange={(e) => {
                        const role = e.target.value as any;
                        setEditFormData({
                          ...editFormData,
                          companyRole: role,
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
                    >
                      <option value="LEAD_BIDDER">🏛️ Lead Bidder</option>
                      <option value="JV_PARTNER">⭐ JV Partner</option>
                      <option value="SUBCONTRACTOR">🤝 Subcontractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      {editIsManualCompany ? 'Company / Entity Name (Manual) *' : 'Select Company Profile *'}
                    </label>
                    {editIsManualCompany ? (
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Joint Venture Ltd"
                        value={editFormData.companyName}
                        onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
                      />
                    ) : (
                      <select
                        value={editSelectedProfileId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__MANUAL__') {
                            setEditIsManualCompany(true);
                          } else if (val === '__NEW__') {
                            setIsEditQuickCreating(true);
                          } else {
                            setEditSelectedProfileId(val);
                            const found = companyProfiles.find((p) => p.id === val);
                            if (found) {
                              setEditFormData((prev) => ({
                                ...prev,
                                companyName: found.trade_name || found.legal_name,
                                companyRole: (found.company_role === 'LEAD_BIDDER' || found.company_role === 'JV_PARTNER' || found.company_role === 'SUBCONTRACTOR')
                                  ? (found.company_role as any)
                                  : prev.companyRole,
                              }));
                            }
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
                      >
                        <optgroup label="🏢 Registered Company Profiles">
                          {companyProfiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.company_role === 'LEAD_BIDDER' ? '🏛️' : p.company_role === 'JV_PARTNER' ? '⭐' : '🤝'} {p.trade_name || p.legal_name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="⚙️ Custom &amp; Manual Options">
                          <option value="__MANUAL__">✏️ Enter Custom Name Manually...</option>
                          <option value="__NEW__">➕ Create New Company Profile...</option>
                        </optgroup>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Category & Clearance Scope */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Document Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Clearance Scope *
                  </label>
                  <select
                    value={editFormData.accessLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, accessLevel: e.target.value as DocumentAccessLevel })}
                    className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
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
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Validity / Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={editFormData.expiryDate}
                  onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Description / Compliance Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--warn)] resize-none"
                  placeholder="e.g. FY2023-24 Audited Balance sheet with Tax Clearances..."
                />
              </div>

              {/* File Replacement Dropzone */}
              <div className="pt-2 border-t border-[var(--border-default)]">
                <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
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
 ? 'border-[var(--warn)] bg-[var(--warn-soft)]/50'
                      : editFile
                      ? 'border-[var(--ok)] bg-[var(--ok-soft)]/40'
                      : 'border-[var(--border-strong)] hover:border-[var(--warn-line)] bg-[var(--bg-subtle)]/50'
                  }`}
                >
                  {editFile ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--ok-soft)] flex items-center justify-center text-[var(--ok)] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-[var(--text-primary)] truncate">
                            {editFile.name}
                          </p>
                          <p className="text-[11px] text-[var(--ok)] font-medium">
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
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--crit)]"
                        title="Remove replacement file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1">
                      <UploadCloud className="w-6 h-6 text-[var(--text-muted)] mb-1" />
                      <p className="font-semibold text-[var(--text-primary)] text-xs">
                        Click to select or drag replacement file
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        Current file: <span className="font-mono text-[var(--text-secondary)]">{editingDoc.size}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setEditFile(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--warn)] text-[var(--accent-on)] font-semibold hover:bg-[var(--warn)] shadow-sm transition-colors disabled:opacity-50"
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
        <div className="tt-overlay items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--crit-soft)] text-[var(--crit)] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                  Delete Master Document
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[var(--text-primary)]">{docToDelete.name}</strong> (<code className="font-mono text-[11px]">{docToDelete.id}</code>)?
                </p>
                <p className="text-[11px] text-[var(--warn)] mt-2 bg-[var(--warn-soft)] p-2 rounded-lg border border-[var(--warn-line)]/60">
                  Note: This removes the document from the Master Vault and local storage. Active tenders that already linked snapshot copies will keep their files.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-default)] text-xs">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--crit)] text-[var(--accent-on)] font-semibold hover:bg-[var(--crit)] shadow-sm transition-colors disabled:opacity-50"
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
