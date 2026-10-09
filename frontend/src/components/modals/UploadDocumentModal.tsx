import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Folder, FileCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

export const UploadDocumentModal: React.FC = () => {
  const {
    uploadFolderTarget,
    setUploadFolderTarget,
    activeTenderIdForModal,
    setActiveTenderIdForModal,
    activeRequirementForModal,
    setActiveRequirementForModal,
    addDocument,
    tenders,
    showSuccessNotification,
  } = useTenders();

  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>(
    activeRequirementForModal?.id || ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeRequirementForModal) {
      setSelectedRequirementId(activeRequirementForModal.id);
      if (!fileName.trim()) {
        const safeTitle = activeRequirementForModal.title.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        setFileName(`${safeTitle}.pdf`);
      }
    }
  }, [activeRequirementForModal]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!fileName.trim()) {
        setFileName(file.name);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!fileName.trim()) {
        setFileName(file.name);
      }
    }
  };

  const tender = tenders.find((t) => t.id === activeTenderIdForModal);

  const isJvTender = Boolean(
    tender?.summary?.jv?.participation?.toLowerCase().includes('allow') ||
    tender?.summary?.jv?.leadMember ||
    tender?.summary?.jv?.localPartner
  );

  const jvPartnerName =
    tender?.summary?.jv?.localPartner ||
    'DataCore Systems Ltd';
  const leadCompanyName = 'PrimeTech Ltd';

  // Folders definition with JV folders prioritized if JV is allowed
  const standardFolders = [
    { name: '01_original_tender_documents', label: 'Original RFP Notices & Addenda' },
    { name: '02_company_statutory_documents', label: 'Company Statutory Credentials' },
    { name: '03_technical_proposal', label: 'Technical Proposal & Architecture' },
    { name: '04_financial_proposal', label: 'Financial Proposal & BOQ Tables' },
    { name: '05_final_submission_package', label: 'Compiled Sealed Submission Package' },
    { name: '06_submission_receipts', label: 'Official Portal Receipts & Confirmations' },
  ];

  const jvFolders = [
    { name: '02A_jv_partner_credentials', label: `⭐ JV Partner Credentials (${jvPartnerName})` },
    { name: '02B_lead_statutory_documents', label: `🏛️ Lead Bidder Statutory Credentials (${leadCompanyName})` },
    { name: '02C_jv_agreement_and_poa', label: '📜 JV Consortium Deed & Power of Attorney' },
    { name: '01_original_tender_documents', label: 'Original RFP Notices & Addenda' },
    { name: '03_technical_proposal', label: 'Technical Proposal & Architecture' },
    { name: '04_financial_proposal', label: 'Financial Proposal & BOQ Tables' },
    { name: '05_final_submission_package', label: 'Compiled Sealed Submission Package' },
    { name: '06_submission_receipts', label: 'Official Portal Receipts & Confirmations' },
  ];

  const allFolders = [
    ...(isJvTender ? jvFolders : standardFolders),
    ...(tender?.customFolders || []),
  ];

  const [companyRole, setCompanyRole] = useState<'LEAD_BIDDER' | 'JV_PARTNER' | 'SUBCONTRACTOR'>(
    uploadFolderTarget?.toLowerCase().includes('jv') || (isJvTender && !uploadFolderTarget?.toLowerCase().includes('lead'))
      ? 'JV_PARTNER'
      : 'LEAD_BIDDER'
  );
  const [companyName, setCompanyName] = useState<string>(
    uploadFolderTarget?.toLowerCase().includes('jv') || (isJvTender && !uploadFolderTarget?.toLowerCase().includes('lead'))
      ? jvPartnerName
      : leadCompanyName
  );

  if (!uploadFolderTarget && !activeTenderIdForModal) return null;

  const handleClose = () => {
    setUploadFolderTarget(null);
    setActiveTenderIdForModal(null);
    setActiveRequirementForModal(null);
    setSelectedRequirementId('');
    setSelectedFile(null);
    setFileName('');
  };

  const handleFolderChange = (folder: string) => {
    setUploadFolderTarget(folder);
    if (folder.toLowerCase().includes('jv')) {
      setCompanyRole('JV_PARTNER');
      setCompanyName(jvPartnerName);
    } else if (folder.toLowerCase().includes('lead')) {
      setCompanyRole('LEAD_BIDDER');
      setCompanyName(leadCompanyName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTenderIdForModal) {
      const selectedFolder = uploadFolderTarget || (isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents');
      const finalDocName = fileName.trim() || selectedFile?.name || 'Statutory_Compliance_Evidence_v1.pdf';
      const finalDocSize = selectedFile ? formatBytes(selectedFile.size) : '4.2 MB';

      setIsUploading(true);

      try {
        await addDocument(activeTenderIdForModal, {
          name: finalDocName,
          folder: selectedFolder,
          size: finalDocSize,
          companyName,
          companyRole,
          isJvPartner: companyRole === 'JV_PARTNER',
          file: selectedFile,
          requirementId: selectedRequirementId || undefined,
        });

        showSuccessNotification(
          `"${finalDocName}" has been cryptographically sealed and uploaded under ${companyName}.`,
          'Document Sealed & Uploaded'
        );
        handleClose();
      } catch (err) {
        console.error('Failed to upload document:', err);
        handleClose();
      } finally {
        setIsUploading(false);
      }
    }
  };

  const safeCompanySlug = companyName.replace(/[^a-zA-Z0-9_-]+/g, '_').trim() || 'PrimeTech_Ltd';
  const effectiveFolder = uploadFolderTarget || (isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents');

  return (
    <div className="tt-overlay items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] rounded-xl shadow-2xl border border-[var(--border-default)] overflow-hidden flex flex-col max-h-[92vh] my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] shrink-0">
          <div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>Upload Vault Document</span>
              {isJvTender && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-full">
                  ⭐ JV Workflow Active
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Secure upload to local SSD with entity namespace &amp; automatic SHA-256 stamp
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Target Folder with JV Prioritization */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-[var(--text-primary)]">
                Target Vault Directory *
              </label>
              {isJvTender && (
                <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                  JV Folders Suggested First
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={effectiveFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg font-medium text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
              >
                {allFolders.map((f) => (
                  <option key={f.name} value={f.name} className="">
                    📁 {f.label} (/{f.name}/)
                  </option>
                ))}
              </select>
              <Folder className="w-4 h-4 text-[var(--accent)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Owning Company & Entity Disambiguation */}
          <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Owning Company / Entity Disambiguation
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                Prevents identical name collision
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Entity Role
                </label>
                <select
                  value={companyRole}
                  onChange={(e) => {
                    const role = e.target.value as any;
                    setCompanyRole(role);
                    if (role === 'JV_PARTNER') setCompanyName(jvPartnerName);
                    else if (role === 'LEAD_BIDDER') setCompanyName(leadCompanyName);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg font-bold text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="JV_PARTNER" className="">⭐ JV Partner</option>
                  <option value="LEAD_BIDDER" className="">🏛️ Lead Bidder (Self)</option>
                  <option value="SUBCONTRACTOR" className="">🔧 Subcontractor / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. DataCore Systems Ltd"
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg font-medium text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            <div className="text-[10px] text-[var(--text-secondary)] font-mono pt-1 border-t border-[var(--border-default)]">
              Physical HDD Path: storage/tenders/{tender?.id || '{TDR-ID}'}/{effectiveFolder}/<span className="text-[var(--accent)] font-bold">[{safeCompanySlug}]</span>/
            </div>
          </div>

          {/* Compliance Requirement Association */}
          {tender?.requirements && tender.requirements.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[var(--text-primary)]">
                  Link to Compliance Requirement
                </label>
                {selectedRequirementId && (
                  <span className="text-[10px] font-bold text-[var(--ok)]">
                    ✓ Clears requirement on upload
                  </span>
                )}
              </div>
              <select
                value={selectedRequirementId}
                onChange={(e) => {
                  setSelectedRequirementId(e.target.value);
                  const matchedReq = tender.requirements.find((r) => r.id === e.target.value);
                  if (matchedReq && (!fileName.trim() || tender.requirements.some(r => fileName.startsWith(r.title)))) {
                    setFileName(`${matchedReq.title.replace(/[^a-zA-Z0-9_\-\.]/g, '_')}.pdf`);
                  }
                }}
                className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
              >
                <option value="">None (General Vault Document)</option>
                {tender.requirements.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.status === 'VERIFIED' ? '✓' : '!'} {r.title} ({r.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Document / File Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trade_License_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Hidden Native File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.xlsx,.xls,.zip,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
          />

          {/* Interactive Drag & Drop File Picker Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
 isDragging
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/30'
                : selectedFile
                ? 'border-[var(--ok-line)] bg-[var(--ok-soft)]'
                : 'border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--bg-subtle)]'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
                <div className="w-10 h-10 rounded-full bg-[var(--ok-soft)] text-[var(--ok)] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-[var(--text-primary)] block max-w-full truncate px-4">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-[var(--ok)] font-mono font-medium">
                  {formatBytes(selectedFile.size)} • Click or drop another file to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-7 h-7 text-[var(--accent)] mb-1.5" />
                <span className="font-semibold text-[var(--text-primary)] block">
                  Drag file here or click to browse
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                  PDF, DOCX, XLSX, or ZIP up to 100MB
                </span>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-[var(--ok-soft)] rounded-lg border border-[var(--ok-line)] flex items-center gap-2 text-[var(--ok)]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-tight">
              Cryptographic SHA-256 checksum will be stamped immediately under company folder.
            </span>
          </div>

          </div>

          {/* Sticky/pinned footer for buttons */}
          <div className="shrink-0 px-6 py-3.5 bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] disabled:opacity-60 text-[var(--accent-on)] rounded-lg font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Sealing & Uploading...' : 'Seal & Upload'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
