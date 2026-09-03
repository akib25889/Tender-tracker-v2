import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { Folder, FileText, Download, Upload, Copy, Check, Share2 } from 'lucide-react';

export const TenderDocumentsTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders, setActiveTenderIdForModal, setUploadFolderTarget, setActiveDocForShare } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const folders = [
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

  const handleOpenUpload = (folderName: string) => {
    setActiveTenderIdForModal(tender.id);
    setUploadFolderTarget(folderName);
  };

  const handleCopyChecksum = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedHash(sha);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const displayedDocs = tender.documents.filter(
    (d) => activeFolderFilter === 'ALL' || d.folder === activeFolderFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Tender Document Vault &amp; Statutory Repository
          </h2>
          <p className="text-xs text-[#64748B]">
            Local SSD storage vault with immutable SHA-256 cryptographic revision tracking
          </p>
        </div>
        <button
          onClick={() => handleOpenUpload('03_technical_proposal')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8] shadow-sm transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 6-Folder Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((f) => {
          const folderFiles = tender.documents.filter((d) => d.folder === f.name);
          const isSelected = activeFolderFilter === f.name;

          return (
            <Card
              key={f.name}
              className={`hover:border-[#CBD5E1] transition-all cursor-pointer group ${
                isSelected ? 'border-[#2563EB] ring-1 ring-[#2563EB]' : ''
              }`}
            >
              <div
                onClick={() =>
                  setActiveFolderFilter((prev) => (prev === f.name ? 'ALL' : f.name))
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight">
                        {f.label}
                      </h4>
                      <span className="font-mono text-[10px] text-[#94A3B8] block mt-0.5">
                        /{f.name}/
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-4 mt-4 border-t border-[#F1F5F9]">
                  <span>{folderFiles.length} file(s)</span>
                  <button
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

      {/* Recent Files Table with SHA-256 */}
      <Card
        title="Vault Uploads &amp; Cryptographic Checksums"
        subtitle={`Showing ${displayedDocs.length} file(s) ${activeFolderFilter !== 'ALL' ? `in /${activeFolderFilter}/` : 'across all folders'}`}
        headerAction={
          activeFolderFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFolderFilter('ALL')}
              className="text-xs text-[#2563EB] font-semibold hover:underline"
            >
              Clear Folder Filter
            </button>
          )
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Folder Path</th>
                <th className="py-2.5 px-3">Revision</th>
                <th className="py-2.5 px-3">SHA-256 Checksum</th>
                <th className="py-2.5 px-3">Uploaded</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {displayedDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[#94A3B8]">
                    No files found in this directory. Click "Upload Document" to add files.
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-3 font-medium text-[#0F172A] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">
                      /{doc.folder}/
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      {doc.revision}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-[#475569] max-w-xs truncate">
                      <button
                        onClick={() => handleCopyChecksum(doc.sha256)}
                        className="flex items-center gap-1 hover:text-[#2563EB] group text-left truncate"
                        title="Click to copy full SHA-256"
                      >
                        <span className="truncate">{doc.sha256}</span>
                        {copiedHash === doc.sha256 ? (
                          <Check className="w-3 h-3 text-[#16A34A] shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">{doc.uploadedAt}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            setActiveDocForShare({ tenderId: tender.id, doc })
                          }
                          className="text-[#2563EB] hover:bg-[#EFF6FF] p-1.5 rounded transition-colors"
                          title="Share document link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            alert(`Simulating secure download for ${doc.name}`)
                          }
                          className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] p-1.5 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
