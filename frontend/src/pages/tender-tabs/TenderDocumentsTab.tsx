import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { Folder, FileText, Download, Upload, FolderPlus, X, Check } from 'lucide-react';

export const TenderDocumentsTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    tenders,
    setActiveTenderIdForModal,
    setUploadFolderTarget,
    addFolder,
    moveDocumentFolder,
  } = useTenders();

  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('ALL');
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderLabel, setNewFolderLabel] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const defaultFolders = [
    {
      name: '01_original_tender_documents',
      label: 'Original RFP Notices & Addenda',
    },
    {
      name: '02_company_statutory_documents',
      label: 'Company Statutory Credentials',
    },
    {
      name: '03_technical_proposal',
      label: 'Technical Proposal & Architecture',
    },
    {
      name: '04_financial_proposal',
      label: 'Financial Proposal & BOQ Tables',
    },
    {
      name: '05_final_submission_package',
      label: 'Compiled Sealed Submission Package',
    },
    {
      name: '06_submission_receipts',
      label: 'Official Portal Receipts & Confirmations',
    },
  ];

  const folders = [...defaultFolders, ...(tender.customFolders || [])];

  const handleOpenUpload = (folderName: string) => {
    setActiveTenderIdForModal(tender.id);
    setUploadFolderTarget(folderName);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderLabel.trim()) return;

    const folderIndex = folders.length + 1;
    const prefix = folderIndex < 10 ? `0${folderIndex}` : `${folderIndex}`;
    const autoSlug = `${prefix}_${newFolderLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    const finalName = newFolderName.trim() || autoSlug;

    addFolder(tender.id, {
      name: finalName,
      label: newFolderLabel.trim(),
    });

    setNewFolderLabel('');
    setNewFolderName('');
    setIsCreateFolderModalOpen(false);
  };

  const displayedDocs = tender.documents.filter(
    (d) => activeFolderFilter === 'ALL' || d.folder === activeFolderFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Tender Document Vault
          </h2>
          <p className="text-xs text-[#64748B]">
            Organize RFP notices, statutory credentials, and technical/financial proposals into dedicated folders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] shadow-xs transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Create Folder</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenUpload(folders[0]?.name || '03_technical_proposal')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8] shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Folder Hierarchy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((f) => {
          const folderFiles = tender.documents.filter((d) => d.folder === f.name);
          const isSelected = activeFolderFilter === f.name;

          return (
            <Card
              key={f.name}
              className={`hover:border-[#CBD5E1] transition-all cursor-pointer group relative ${
                isSelected
                  ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-[#F8FAFC]'
                  : ''
              }`}
            >
              <div
                onClick={() =>
                  setActiveFolderFilter((prev) => (prev === f.name ? 'ALL' : f.name))
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white'
                      }`}
                    >
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                        {f.label}
                      </h4>
                      <span className="text-[10px] text-[#64748B] font-mono block mt-0.5 truncate">
                        /{f.name}/
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-3 mt-3 border-t border-[#F1F5F9]">
                  <span className="font-semibold">
                    {folderFiles.length} file{folderFiles.length === 1 ? '' : 's'} inside
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUpload(f.name);
                    }}
                    className="text-[#2563EB] hover:underline font-semibold"
                  >
                    + Upload here
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Document Vault Table */}
      <Card
        title="Document Vault Files"
        subtitle={`Showing ${displayedDocs.length} document(s) ${
          activeFolderFilter !== 'ALL'
            ? `in folder: "${folders.find((f) => f.name === activeFolderFilter)?.label || activeFolderFilter}"`
            : 'across all folders'
        }`}
        headerAction={
          activeFolderFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveFolderFilter('ALL')}
              className="text-xs text-[#2563EB] font-semibold hover:underline bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#BFDBFE]"
            >
              Show All Folders
            </button>
          )
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3 w-64">Target Folder (Move / Assign)</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Revision</th>
                <th className="py-2.5 px-3">Uploaded</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {displayedDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#94A3B8]">
                    No files found in this folder. Click <strong>"+ Upload here"</strong> on the folder card above to add files.
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span className="font-semibold">{doc.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {/* Interactive Folder Reassignment Dropdown */}
                      <select
                        value={doc.folder}
                        onChange={(e) =>
                          moveDocumentFolder(tender.id, doc.id, e.target.value)
                        }
                        className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs font-medium text-[#0F172A] hover:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                        title="Click to reassign/move this document to another folder"
                      >
                        {folders.map((f) => (
                          <option key={f.name} value={f.name}>
                            📁 {f.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">
                      {doc.size || '1.8 MB'}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#0F172A]">
                      {doc.revision}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">{doc.uploadedAt}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          alert(`Simulating secure download for ${doc.name}`)
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors shadow-2xs"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Create New Folder */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-base font-bold text-[#0F172A]">
                  Create Vault Folder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Folder Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Clarifications & Addenda"
                  value={newFolderLabel}
                  onChange={(e) => {
                    setNewFolderLabel(e.target.value);
                    const folderIndex = folders.length + 1;
                    const prefix = folderIndex < 10 ? `0${folderIndex}` : `${folderIndex}`;
                    setNewFolderName(
                      `${prefix}_${e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Directory Path / Folder Slug (Local SSD storage)
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A]">
                  <Folder className="w-4 h-4 text-[#2563EB]" />
                  <span>/{newFolderName || '07_custom_folder'}/</span>
                </div>
                <span className="text-[10px] text-[#64748B] mt-1 block font-mono">
                  Location: storage/tenders/{tender.id}/{newFolderName || '07_custom_folder'}/
                </span>
              </div>

              <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] text-[11px] text-[#1D4ED8]">
                <strong>Folder Routing Note:</strong> Once created, you can immediately upload documents into this folder, or reassign existing documents from the table below.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Vault Folder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
