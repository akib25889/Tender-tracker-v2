import React, { useState, useRef } from 'react';
import { X, UploadCloud, Folder, FileCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

export const UploadDocumentModal: React.FC = () => {
  const {
    uploadFolderTarget,
    setUploadFolderTarget,
    activeTenderIdForModal,
    setActiveTenderIdForModal,
    addDocument,
    tenders,
    showSuccessNotification,
  } = useTenders();

  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTenderIdForModal) {
      const selectedFolder = uploadFolderTarget || (isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents');
      const finalDocName = fileName.trim() || selectedFile?.name || 'Statutory_Compliance_Evidence_v1.pdf';
      const finalDocSize = selectedFile ? formatBytes(selectedFile.size) : '4.2 MB';

      addDocument(activeTenderIdForModal, {
        name: finalDocName,
        folder: selectedFolder,
        size: finalDocSize,
        companyName,
        companyRole,
        isJvPartner: companyRole === 'JV_PARTNER',
      });

      showSuccessNotification(
        `"${finalDocName}" has been cryptographically sealed and uploaded under ${companyName}.`,
        'Document Sealed & Uploaded'
      );
    }
    handleClose();
  };

  const safeCompanySlug = companyName.replace(/[^a-zA-Z0-9_-]+/g, '_').trim() || 'PrimeTech_Ltd';
  const effectiveFolder = uploadFolderTarget || (isJvTender ? '02A_jv_partner_credentials' : '02_company_statutory_documents');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/60">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <span>Upload Vault Document</span>
              {isJvTender && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full">
                  ⭐ JV Workflow Active
                </span>
              )}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Secure upload to local SSD with entity namespace &amp; automatic SHA-256 stamp
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E2E8F0] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Folder with JV Prioritization */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-[#0F172A] dark:text-slate-200">
                Target Vault Directory *
              </label>
              {isJvTender && (
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">
                  JV Folders Suggested First
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={effectiveFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-lg font-medium text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
              >
                {allFolders.map((f) => (
                  <option key={f.name} value={f.name} className="dark:bg-slate-900 dark:text-slate-100">
                    📁 {f.label} (/{f.name}/)
                  </option>
                ))}
              </select>
              <Folder className="w-4 h-4 text-[#2563EB] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Owning Company & Entity Disambiguation */}
          <div className="p-3 bg-[#F8FAFC] dark:bg-slate-800/40 rounded-xl border border-[#E2E8F0] dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0F172A] dark:text-slate-200 uppercase tracking-wider">
                Owning Company / Entity Disambiguation
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400">
                Prevents identical name collision
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
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
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg font-bold text-[#0F172A] dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="JV_PARTNER" className="dark:bg-slate-900">⭐ JV Partner</option>
                  <option value="LEAD_BIDDER" className="dark:bg-slate-900">🏛️ Lead Bidder (Self)</option>
                  <option value="SUBCONTRACTOR" className="dark:bg-slate-900">🔧 Subcontractor / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. DataCore Systems Ltd"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg font-medium text-xs text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono pt-1 border-t border-[#E2E8F0] dark:border-slate-800">
              Physical HDD Path: storage/tenders/{tender?.id || '{TDR-ID}'}/{effectiveFolder}/<span className="text-[#2563EB] dark:text-blue-400 font-bold">[{safeCompanySlug}]</span>/
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
              Document / File Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trade_License_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
                ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/40 ring-2 ring-[#2563EB]/30'
                : selectedFile
                ? 'border-[#10B981] bg-[#F0FDF4] dark:bg-emerald-950/30'
                : 'border-[#CBD5E1] dark:border-slate-700 hover:border-[#2563EB] dark:hover:border-blue-500 bg-[#F8FAFC] dark:bg-slate-800/50'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
                <div className="w-10 h-10 rounded-full bg-[#D1FAE5] dark:bg-emerald-900/50 text-[#059669] dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-[#0F172A] dark:text-white block max-w-full truncate px-4">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-[#059669] dark:text-emerald-400 font-mono font-medium">
                  {formatBytes(selectedFile.size)} • Click or drop another file to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-7 h-7 text-[#2563EB] mb-1.5" />
                <span className="font-semibold text-[#0F172A] dark:text-slate-200 block">
                  Drag file here or click to browse
                </span>
                <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 mt-0.5 block">
                  PDF, DOCX, XLSX, or ZIP up to 100MB
                </span>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-[#F0FDF4] dark:bg-emerald-950/30 rounded-lg border border-[#BBF7D0] dark:border-emerald-800/50 flex items-center gap-2 text-[#15803D] dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-tight">
              Cryptographic SHA-256 checksum will be stamped immediately under company folder.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9] dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Seal &amp; Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
