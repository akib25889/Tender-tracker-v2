import React from 'react';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export const TenderRequirementsTab: React.FC = () => {
  const requirements = [
    {
      id: 'REQ-01',
      title: 'Valid Corporate Trade License & Registration',
      category: 'Statutory Legal',
      status: 'VERIFIED',
      evidenceFile: '02_company_statutory_documents/trade_license_2026.pdf',
      owner: 'Tariq Al-Mansoor',
    },
    {
      id: 'REQ-02',
      title: 'Tax Clearance Certificate (Current Fiscal Year)',
      category: 'Financial Compliance',
      status: 'VERIFIED',
      evidenceFile: '02_company_statutory_documents/tax_clearance_cert_2026.pdf',
      owner: 'Tariq Al-Mansoor',
    },
    {
      id: 'REQ-03',
      title: 'Bid Bond / Security Guarantee ($284,000 USD)',
      category: 'Banking Guarantee',
      status: 'PENDING_SOLVENCY',
      evidenceFile: '04_financial_proposal/draft_bank_guarantee_v2.pdf',
      owner: 'Sarah Jenkins',
    },
    {
      id: 'REQ-04',
      title: 'ISO 27001:2022 Security Management Certification',
      category: 'Technical Quality',
      status: 'VERIFIED',
      evidenceFile: '03_technical_proposal/iso_27001_certificate_audit.pdf',
      owner: 'Dr. Marcus Vance',
    },
    {
      id: 'REQ-05',
      title: 'Three Reference Project Letters (> $5M USD each)',
      category: 'Past Performance',
      status: 'VERIFIED',
      evidenceFile: '03_technical_proposal/past_credentials_bundle.pdf',
      owner: 'Elena Rostova',
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Tender Requirements &amp; Compliance Matrix"
        subtitle="Clause-by-clause statutory checklist mapped to evidence documents in the vault"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Requirement Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-3">Vault Evidence Document</th>
                <th className="py-2.5 px-3">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                    {req.id}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#0F172A]">
                    {req.title}
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">{req.category}</td>
                  <td className="py-3 px-3">
                    {req.status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#DC2626] font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                        <span>Solvency Seal Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#2563EB] flex items-center gap-1.5 truncate max-w-xs">
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">{req.evidenceFile}</span>
                  </td>
                  <td className="py-3 px-3 text-[#475569]">{req.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

