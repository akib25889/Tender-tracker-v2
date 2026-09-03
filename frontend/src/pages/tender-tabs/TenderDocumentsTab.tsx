import React from 'react';
import { Card } from '../../components/ui/Card';
import { Folder, FileText, Download, Upload } from 'lucide-react';

export const TenderDocumentsTab: React.FC = () => {
  const folders = [
    {
      name: '01_original_tender_documents',
      label: 'Original RFP Notices & Addenda',
      filesCount: 3,
      size: '14.2 MB',
    },
    {
      name: '02_company_statutory_documents',
      label: 'Company Statutory Credentials',
      filesCount: 6,
      size: '8.5 MB',
    },
    {
      name: '03_technical_proposal',
      label: 'Technical Proposal & Architecture',
      filesCount: 8,
      size: '42.1 MB',
    },
    {
      name: '04_financial_proposal',
      label: 'Financial Proposal & BOQ Tables',
      filesCount: 2,
      size: '4.8 MB',
    },
    {
      name: '05_final_submission_package',
      label: 'Compiled Sealed Submission Package',
      filesCount: 1,
      size: '68.0 MB',
    },
    {
      name: '06_submission_receipts',
      label: 'Official Portal Receipts & Confirmations',
      filesCount: 0,
      size: '0 KB',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Tender Document Vault &amp; Statutory Repository
          </h2>
          <p className="text-xs text-[#64748B]">
            Local SSD storage vault with immutable SHA-256 cryptographic revision tracking
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8] shadow-sm">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((f) => (
          <Card key={f.name} className="hover:border-[#CBD5E1] transition-colors cursor-pointer group">
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
              <span>{f.filesCount} files</span>
              <span className="font-mono">{f.size}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Files Table with SHA-256 */}
      <Card title="Recent Vault Uploads &amp; Cryptographic Checksums" subtitle="Real-time checksum audit trail logged for statutory review">
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
              <tr className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-3 font-medium text-[#0F172A] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Technical_Methodology_SOW_v3.pdf</span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">03_technical_proposal/</td>
                <td className="py-3 px-3 font-mono font-semibold">v3.0</td>
                <td className="py-3 px-3 font-mono text-[10px] text-[#475569] truncate max-w-xs">
                  8f4c2b9a7d1e3f5c...93d182a
                </td>
                <td className="py-3 px-3 text-[#64748B]">2 hours ago</td>
                <td className="py-3 px-3 text-right">
                  <button className="text-[#2563EB] hover:text-[#1D4ED8] p-1">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

