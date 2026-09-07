import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import { CompanyProfile, CustomCompanyField } from '../types/tender';
import { fuzzyMatch } from '../utils/fuzzySearch';
import {
  Building2,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  Search,
  Award,
  Briefcase,
  Globe,
  Phone,
  Landmark,
  Users,
  DollarSign,
  Scale,
  Sparkles,
  Layers,
  FileCheck2,
  X,
} from 'lucide-react';

interface ProfileFieldProps {
  id: string;
  name: string;
  value: string | number | undefined | null;
  isCustom?: boolean;
  onCopy: (val: string) => void;
  onEdit: (id: string, newName: string, newVal: string) => void;
  onDelete: (id: string) => void;
  copiedId: string | null;
  badge?: string;
  badgeColor?: string;
  prefix?: string;
  isMultiline?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  id,
  name,
  value,
  isCustom = false,
  onCopy,
  onEdit,
  onDelete,
  copiedId,
  badge,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200',
  prefix,
  isMultiline = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editVal, setEditVal] = useState(value != null ? String(value) : '');

  const displayVal = value != null && value !== '' ? String(value) : '';
  const isCopied = copiedId === id;

  const handleSave = () => {
    onEdit(id, editName.trim(), editVal.trim());
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-[#F8FAFC] hover:bg-[#F1F5F9]/80 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg p-3 transition-all">
      {/* Top Header on top of field with Copy, Edit, Delete toolbar */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-[#E2E8F0]/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wide truncate">
            {isEditing && isCustom ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white border border-[#2563EB] rounded px-1.5 py-0.5 text-xs text-[#0F172A] font-bold outline-none"
                placeholder="Field Name"
              />
            ) : (
              name
            )}
          </span>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor} shrink-0`}>
              {badge}
            </span>
          )}
          {isCustom && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded shrink-0">
              Custom
            </span>
          )}
        </div>

        {/* Action Toolbar on Top of Field: Copy, Edit, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Copy Icon Button */}
          <button
            type="button"
            onClick={() => onCopy(displayVal)}
            className={`p-1 rounded transition-colors ${
              isCopied
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
            title="Copy field value to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Edit Icon Button */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) handleSave();
              else {
                setEditVal(displayVal);
                setIsEditing(true);
              }
            }}
            className={`p-1 rounded transition-colors ${
              isEditing
                ? 'bg-blue-600 text-white'
                : 'text-[#64748B] hover:text-[#2563EB] hover:bg-white'
            }`}
            title={isEditing ? 'Save changes' : 'Edit field value'}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Icon Button */}
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1 rounded text-[#64748B] hover:text-red-600 hover:bg-white transition-colors"
            title={isCustom ? 'Delete custom field' : 'Clear field value'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Field Value */}
      {isEditing ? (
        <div className="space-y-2 mt-1">
          {isMultiline ? (
            <textarea
              rows={3}
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              className="w-full bg-white border border-[#2563EB] rounded px-2.5 py-1.5 text-xs text-[#0F172A] font-medium outline-none focus:ring-1 focus:ring-[#2563EB]"
              placeholder="Field value"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1.5">
              {prefix && <span className="text-xs text-[#64748B] font-semibold">{prefix}</span>}
              <input
                type="text"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="w-full bg-white border border-[#2563EB] rounded px-2.5 py-1 text-xs text-[#0F172A] font-medium outline-none focus:ring-1 focus:ring-[#2563EB]"
                placeholder="Field value"
                autoFocus
              />
            </div>
          )}
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2 py-0.5 text-[10px] text-[#64748B] hover:text-[#0F172A] font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-2.5 py-1 bg-[#2563EB] text-white rounded text-[11px] font-bold hover:bg-[#1D4ED8]"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="font-medium text-xs text-[#0F172A] break-words">
          {displayVal ? (
            <span>
              {prefix && <span className="text-[#64748B] font-normal mr-1">{prefix}</span>}
              {displayVal}
            </span>
          ) : (
            <span className="text-[#94A3B8] italic font-normal">Not specified</span>
          )}
        </div>
      )}

      {isCopied && (
        <span className="absolute right-2 -bottom-2 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold shadow-xs animate-fadeIn">
          Copied!
        </span>
      )}
    </div>
  );
};

export const CompanyProfilesPage: React.FC = () => {
  const {
    companyProfiles,
    addCompanyProfile,
    updateCompanyProfile,
    deleteCompanyProfile,
    companyProjects,
    reusableDocuments,
  } = useTenders();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('COMP-PRIMETECH');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'identity' | 'statutory' | 'banking' | 'capacity' | 'custom' | 'linked_assets'
  >('identity');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Field input state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  // Add Company Profile Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLegalName, setNewLegalName] = useState('');
  const [newTradeName, setNewTradeName] = useState('');
  const [newRole, setNewRole] = useState('JV_PARTNER');
  const [newEntityType, setNewEntityType] = useState('Private Limited Company');
  const [newCountry, setNewCountry] = useState('Bangladesh');
  const [newRegNo, setNewRegNo] = useState('');
  const [newTin, setNewTin] = useState('');
  const [newBin, setNewBin] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newTurnoverBDT, setNewTurnoverBDT] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, label: string = 'Field') => {
    if (!text) {
      showToast('⚠️ No value to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    showToast(`✓ Copied: ${text.length > 35 ? text.slice(0, 35) + '...' : text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered companies
  const filteredProfiles = useMemo(() => {
    return companyProfiles.filter((c) => {
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'LEAD' && c.company_role === 'LEAD_BIDDER') ||
        (roleFilter === 'JV' && c.company_role === 'JV_PARTNER');

      const matchSearch = fuzzyMatch(
        [c.legal_name, c.trade_name, c.registration_no, c.tin_number, c.country],
        searchQuery
      );

      return matchRole && matchSearch;
    });
  }, [companyProfiles, roleFilter, searchQuery]);

  // Selected profile
  const currentProfile = useMemo(() => {
    return (
      companyProfiles.find((p) => p.id === selectedCompanyId) ||
      companyProfiles[0] ||
      null
    );
  }, [companyProfiles, selectedCompanyId]);

  // Projects associated with this company
  const associatedProjects = useMemo(() => {
    if (!currentProfile) return [];
    return companyProjects.filter(
      (p) =>
        p.companyName?.toLowerCase() === currentProfile.legal_name.toLowerCase() ||
        p.companyName?.toLowerCase() === currentProfile.trade_name.toLowerCase()
    );
  }, [companyProjects, currentProfile]);

  // Master documents in vault associated with this company
  const associatedDocuments = useMemo(() => {
    if (!currentProfile) return [];
    return reusableDocuments.filter(
      (d) =>
        d.companyName?.toLowerCase() === currentProfile.legal_name.toLowerCase() ||
        d.companyName?.toLowerCase() === currentProfile.trade_name.toLowerCase()
    );
  }, [reusableDocuments, currentProfile]);

  const handleDeleteCurrentProfile = async () => {
    if (!currentProfile) return;
    if (currentProfile.company_role === 'LEAD_BIDDER') {
      showToast('⚠️ Cannot delete primary Lead Bidder profile');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${currentProfile.trade_name}"?`)) {
      const success = await deleteCompanyProfile(currentProfile.id);
      if (success) {
        showToast('✓ Company profile deleted');
        setSelectedCompanyId('COMP-PRIMETECH');
      }
    }
  };

  // Handler for standard field edit
  const handleStandardFieldEdit = async (fieldKey: string, newVal: string) => {
    if (!currentProfile) return;
    const numFields = [
      'audited_turnover_bdt',
      'audited_turnover_usd',
      'bank_solvency_limit_bdt',
      'paid_up_capital_bdt',
      'authorized_capital_bdt',
      'total_employees',
      'certified_engineers',
    ];
    const parsedVal = numFields.includes(fieldKey) ? parseFloat(newVal) || 0 : newVal;

    const res = await updateCompanyProfile(currentProfile.id, {
      [fieldKey]: parsedVal,
    });
    if (res) {
      showToast('✓ Profile field updated successfully');
    }
  };

  // Handler for clearing standard field
  const handleStandardFieldDelete = async (fieldKey: string) => {
    if (!currentProfile) return;
    const numFields = [
      'audited_turnover_bdt',
      'audited_turnover_usd',
      'bank_solvency_limit_bdt',
      'paid_up_capital_bdt',
      'authorized_capital_bdt',
      'total_employees',
      'certified_engineers',
    ];
    const defaultVal = numFields.includes(fieldKey) ? 0 : '';
    await updateCompanyProfile(currentProfile.id, { [fieldKey]: defaultVal });
    showToast('Field cleared');
  };

  // Handler for custom fields
  const handleCustomFieldEdit = async (id: string, newName: string, newVal: string) => {
    if (!currentProfile) return;
    const updatedFields = (currentProfile.custom_fields || []).map((f) =>
      f.id === id ? { ...f, name: newName, value: newVal } : f
    );
    await updateCompanyProfile(currentProfile.id, { custom_fields: updatedFields });
    showToast('✓ Custom field saved');
  };

  const handleCustomFieldDelete = async (id: string) => {
    if (!currentProfile) return;
    const updatedFields = (currentProfile.custom_fields || []).filter((f) => f.id !== id);
    await updateCompanyProfile(currentProfile.id, { custom_fields: updatedFields });
    showToast('Custom field removed');
  };

  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile || !newFieldName.trim() || !newFieldValue.trim()) return;

    const newField: CustomCompanyField = {
      id: `cf-${Date.now()}`,
      name: newFieldName.trim(),
      value: newFieldValue.trim(),
    };

    const updatedFields = [...(currentProfile.custom_fields || []), newField];
    await updateCompanyProfile(currentProfile.id, { custom_fields: updatedFields });

    setNewFieldName('');
    setNewFieldValue('');
    setIsAddingField(false);
    showToast('✓ Custom field added successfully');
  };

  // Create Company Profile Form
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLegalName.trim()) return;

    const id = `COMP-${newTradeName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || Date.now()}`;
    const payload: Partial<CompanyProfile> = {
      id,
      legal_name: newLegalName.trim(),
      trade_name: newTradeName.trim() || newLegalName.trim(),
      company_role: newRole,
      entity_type: newEntityType,
      country: newCountry,
      registration_no: newRegNo.trim() || undefined,
      tin_number: newTin.trim() || undefined,
      bin_vat_number: newBin.trim() || undefined,
      bank_name: newBankName.trim() || undefined,
      audited_turnover_bdt: parseFloat(newTurnoverBDT) || 0.0,
      audited_turnover_usd: (parseFloat(newTurnoverBDT) || 0.0) / 122.0,
      status: 'ACTIVE',
      custom_fields: [],
    };

    const created = await addCompanyProfile(payload);
    if (created) {
      setSelectedCompanyId(created.id);
      setIsAddModalOpen(false);
      setNewLegalName('');
      setNewTradeName('');
      setNewRegNo('');
      setNewTin('');
      setNewBin('');
      setNewBankName('');
      setNewTurnoverBDT('');
      showToast('✓ Company Profile created successfully');
    }
  };

  // Copy full profile summary for tender submissions
  const handleCopyProfileSummary = () => {
    if (!currentProfile) return;

    const summaryText = `===================================================================
COMPANY PROFILE SUMMARY FOR TENDER SUBMISSION
===================================================================
1. CORPORATE IDENTITY
• Full Registered Legal Name: ${currentProfile.legal_name}
• Trade / Business Name: ${currentProfile.trade_name}
• Entity Type: ${currentProfile.entity_type}
• Role in Bid: ${currentProfile.company_role === 'LEAD_BIDDER' ? 'Lead Bidder / Consortium Leader' : 'Joint Venture Partner'}
• Incorporation No: ${currentProfile.registration_no || 'N/A'} (Date: ${currentProfile.incorporation_date || 'N/A'})
• Country of Origin: ${currentProfile.country}
• Corporate Status: ${currentProfile.status}

2. STATUTORY & TAX CREDENTIALS
• Taxpayer Identification No (e-TIN): ${currentProfile.tin_number || 'N/A'}
• VAT / Business Identification No (BIN): ${currentProfile.bin_vat_number || 'N/A'}
• Municipal Trade License No: ${currentProfile.trade_license_no || 'N/A'} (Expiry: ${currentProfile.trade_license_expiry || 'N/A'})
• Trade License Issuing Authority: ${currentProfile.trade_license_issuer || 'N/A'}
• Taxes Circle & Zone: ${currentProfile.tax_circle_zone || 'N/A'}
• RJSC Return Year: ${currentProfile.rjsc_return_year || 'N/A'}

3. PRINCIPAL BANKING & FINANCIAL STANDING
• Principal Bank & Branch: ${currentProfile.bank_name || 'N/A'}, ${currentProfile.bank_branch || 'N/A'}
• Bank Account No: ${currentProfile.bank_account_no || 'N/A'}
• Routing No: ${currentProfile.routing_no || 'N/A'} | SWIFT: ${currentProfile.swift_code || 'N/A'}
• Audited Average Annual Turnover (3 Yrs): BDT ${(currentProfile.audited_turnover_bdt || 0).toLocaleString()} (approx. USD ${(currentProfile.audited_turnover_usd || 0).toLocaleString()})
• Available Credit Line / Solvency Facility: BDT ${(currentProfile.bank_solvency_limit_bdt || 0).toLocaleString()}
• Paid-up Capital: BDT ${(currentProfile.paid_up_capital_bdt || 0).toLocaleString()}
• Credit Rating: ${currentProfile.credit_rating || 'N/A'} (Valid until: ${currentProfile.credit_rating_validity || 'N/A'})

4. REGISTERED OFFICE & CONTACT DETAILS
• Registered Address: ${currentProfile.registered_address || 'N/A'}
• Official Contact Email: ${currentProfile.official_email || 'N/A'}
• Telephone / Hotline: ${currentProfile.phone || 'N/A'}
• Website: ${currentProfile.website || 'N/A'}
• Focal Liaison Person: ${currentProfile.contact_person_name || 'N/A'} (${currentProfile.contact_person_title || 'N/A'}, ${currentProfile.contact_person_phone || 'N/A'}, ${currentProfile.contact_person_email || 'N/A'})
• Authorized Signatory: ${currentProfile.signatory_name || 'N/A'} (${currentProfile.signatory_title || 'N/A'}, NID: ${currentProfile.signatory_nid || 'N/A'}, Ref: ${currentProfile.power_of_attorney_ref || 'N/A'})

5. ACCREDITATIONS & CAPACITY
• Total Employees: ${currentProfile.total_employees} (Certified Engineers: ${currentProfile.certified_engineers})
• Certifications: ${(currentProfile.certifications || []).join(', ') || 'None'}
• Core Capabilities: ${(currentProfile.core_competencies || []).join('; ') || 'None'}
===================================================================`;

    navigator.clipboard.writeText(summaryText);
    showToast('✓ Full Tender Profile Summary copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
                Corporate Entities & Company Profiles
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Central command repository for corporate identities, statutory tax credentials, banking solvency, and dynamic bidding metadata.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyProfileSummary}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Copy formatted summary of current profile for pasting into tender submission forms"
          >
            <Copy className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Copy Tender Profile Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company Profile</span>
          </button>
        </div>
      </div>

      {/* Company Selector Ribbon & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, TIN, reg no..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-[#64748B] font-medium mr-1 shrink-0">Filter:</span>
            {[
              { id: 'ALL', label: `All Entities (${companyProfiles.length})` },
              {
                id: 'LEAD',
                label: `🏛️ Lead Bidders (${companyProfiles.filter((p) => p.company_role === 'LEAD_BIDDER').length})`,
              },
              {
                id: 'JV',
                label: `⭐ JV Partners (${companyProfiles.filter((p) => p.company_role === 'JV_PARTNER').length})`,
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRoleFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  roleFilter === f.id
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Company Profile Cards Slider */}
        <div className="flex items-center gap-2.5 overflow-x-auto pt-2 border-t border-[#F1F5F9] pb-1">
          {filteredProfiles.map((company) => {
            const isSelected = currentProfile?.id === company.id;
            const isLead = company.company_role === 'LEAD_BIDDER';

            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelectedCompanyId(company.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left border transition-all shrink-0 ${
                  isSelected
                    ? isLead
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isLead
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-purple-600 text-white shadow-xs'
                  }`}
                >
                  {company.trade_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0F172A] truncate max-w-[160px]">
                      {company.trade_name}
                    </span>
                    {isLead ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">
                        LEAD
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded">
                        JV
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#64748B] truncate max-w-[170px]">
                    {company.tin_number ? `TIN: ${company.tin_number}` : company.country}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentProfile ? (
        <>
          {/* Selected Company Hero Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs shrink-0 ${
                    currentProfile.company_role === 'LEAD_BIDDER'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white'
                  }`}
                >
                  {currentProfile.trade_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      {currentProfile.legal_name}
                    </h2>
                    {currentProfile.company_role === 'LEAD_BIDDER' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        🏛️ Principal Lead Bidder
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        ⭐ Joint Venture Partner
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {currentProfile.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] mt-1 flex items-center gap-3 flex-wrap">
                    <span>
                      <strong className="text-[#0F172A] font-semibold">Trade:</strong>{' '}
                      {currentProfile.trade_name}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#0F172A] font-semibold">Reg No:</strong>{' '}
                      {currentProfile.registration_no || 'Not registered'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#0F172A] font-semibold">Incorporated:</strong>{' '}
                      {currentProfile.incorporation_date || 'N/A'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#0F172A] font-semibold">Country:</strong>{' '}
                      {currentProfile.country}
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Metrics Header */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-right">
                  <div className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">
                    Audited Turnover (3-Yr)
                  </div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    BDT {(currentProfile.audited_turnover_bdt / 10000000).toFixed(2)} Cr
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-right">
                  <div className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">
                    Solvency / Credit Line
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    BDT {(currentProfile.bank_solvency_limit_bdt / 10000000).toFixed(2)} Cr
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-right">
                  <div className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">
                    Linked Past Projects
                  </div>
                  <div className="text-xs font-bold text-blue-700">
                    {associatedProjects.length} Verified
                  </div>
                </div>

                {currentProfile.company_role !== 'LEAD_BIDDER' && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentProfile}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    title="Delete this company profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pt-2 overflow-x-auto">
              {[
                { id: 'identity', label: 'Overview & Identity', icon: Building2 },
                { id: 'statutory', label: 'Statutory & Tax', icon: FileCheck2 },
                { id: 'banking', label: 'Banking & Financials', icon: Landmark },
                { id: 'capacity', label: 'Accreditations & Workforce', icon: Award },
                {
                  id: 'custom',
                  label: `Custom Fields (${(currentProfile.custom_fields || []).length})`,
                  icon: Sparkles,
                },
                {
                  id: 'linked_assets',
                  label: `Linked Credentials & Vault Docs (${associatedProjects.length + associatedDocuments.length})`,
                  icon: Layers,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: OVERVIEW & IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Corporate Registration & Legal Character
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    Top-of-field toolbar: [📋 Copy] [✏️ Edit] [🗑️ Delete]
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <ProfileField
                    id="legal_name"
                    name="Full Legal Registered Name"
                    value={currentProfile.legal_name}
                    onCopy={(val) => handleCopy(val, 'Legal Name')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('legal_name', val)}
                    onDelete={() => handleStandardFieldDelete('legal_name')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="trade_name"
                    name="Trade / Short Name"
                    value={currentProfile.trade_name}
                    onCopy={(val) => handleCopy(val, 'Trade Name')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('trade_name', val)}
                    onDelete={() => handleStandardFieldDelete('trade_name')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="entity_type"
                    name="Legal Entity Type"
                    value={currentProfile.entity_type}
                    onCopy={(val) => handleCopy(val, 'Entity Type')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('entity_type', val)}
                    onDelete={() => handleStandardFieldDelete('entity_type')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="registration_no"
                    name="Incorporation / Reg Number"
                    value={currentProfile.registration_no}
                    onCopy={(val) => handleCopy(val, 'Registration No')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('registration_no', val)}
                    onDelete={() => handleStandardFieldDelete('registration_no')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="incorporation_date"
                    name="Date of Incorporation"
                    value={currentProfile.incorporation_date}
                    onCopy={(val) => handleCopy(val, 'Incorporation Date')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('incorporation_date', val)}
                    onDelete={() => handleStandardFieldDelete('incorporation_date')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="country"
                    name="Country of Origin"
                    value={currentProfile.country}
                    onCopy={(val) => handleCopy(val, 'Country')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('country', val)}
                    onDelete={() => handleStandardFieldDelete('country')}
                    copiedId={copiedId}
                  />
                </div>

                <div className="mt-3.5">
                  <ProfileField
                    id="business_nature"
                    name="Nature of Business & Technical Scope of Operations"
                    value={currentProfile.business_nature}
                    onCopy={(val) => handleCopy(val, 'Business Nature')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('business_nature', val)}
                    onDelete={() => handleStandardFieldDelete('business_nature')}
                    copiedId={copiedId}
                    isMultiline={true}
                  />
                </div>
              </Card>

              {/* Registered Office & Contact Details */}
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Office Addresses & Communication Channels
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <ProfileField
                    id="registered_address"
                    name="Registered Corporate Address (Legal)"
                    value={currentProfile.registered_address}
                    onCopy={(val) => handleCopy(val, 'Registered Address')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('registered_address', val)}
                    onDelete={() => handleStandardFieldDelete('registered_address')}
                    copiedId={copiedId}
                    isMultiline={true}
                  />

                  <ProfileField
                    id="operational_address"
                    name="Operational / Engineering Center Address"
                    value={currentProfile.operational_address}
                    onCopy={(val) => handleCopy(val, 'Operational Address')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('operational_address', val)}
                    onDelete={() => handleStandardFieldDelete('operational_address')}
                    copiedId={copiedId}
                    isMultiline={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 mt-3.5">
                  <ProfileField
                    id="official_email"
                    name="Official Tender / Bids Email"
                    value={currentProfile.official_email}
                    onCopy={(val) => handleCopy(val, 'Official Email')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('official_email', val)}
                    onDelete={() => handleStandardFieldDelete('official_email')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="billing_email"
                    name="Finance & Billing Email"
                    value={currentProfile.billing_email}
                    onCopy={(val) => handleCopy(val, 'Billing Email')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('billing_email', val)}
                    onDelete={() => handleStandardFieldDelete('billing_email')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="phone"
                    name="Telephone / Hotline"
                    value={currentProfile.phone}
                    onCopy={(val) => handleCopy(val, 'Phone')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('phone', val)}
                    onDelete={() => handleStandardFieldDelete('phone')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="website"
                    name="Official Website"
                    value={currentProfile.website}
                    onCopy={(val) => handleCopy(val, 'Website')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('website', val)}
                    onDelete={() => handleStandardFieldDelete('website')}
                    copiedId={copiedId}
                  />
                </div>
              </Card>

              {/* Key Liaison & Authorized Signatory */}
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Focal Liaison Officer & Authorized Power of Attorney Signatory
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Focal Contact */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      Focal Tender Point of Contact
                    </div>

                    <ProfileField
                      id="contact_person_name"
                      name="Contact Person Name"
                      value={currentProfile.contact_person_name}
                      onCopy={(val) => handleCopy(val, 'Focal Name')}
                      onEdit={(_, __, val) => handleStandardFieldEdit('contact_person_name', val)}
                      onDelete={() => handleStandardFieldDelete('contact_person_name')}
                      copiedId={copiedId}
                    />

                    <ProfileField
                      id="contact_person_title"
                      name="Designation / Official Title"
                      value={currentProfile.contact_person_title}
                      onCopy={(val) => handleCopy(val, 'Focal Title')}
                      onEdit={(_, __, val) => handleStandardFieldEdit('contact_person_title', val)}
                      onDelete={() => handleStandardFieldDelete('contact_person_title')}
                      copiedId={copiedId}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <ProfileField
                        id="contact_person_phone"
                        name="Direct Phone"
                        value={currentProfile.contact_person_phone}
                        onCopy={(val) => handleCopy(val, 'Focal Phone')}
                        onEdit={(_, __, val) => handleStandardFieldEdit('contact_person_phone', val)}
                        onDelete={() => handleStandardFieldDelete('contact_person_phone')}
                        copiedId={copiedId}
                      />
                      <ProfileField
                        id="contact_person_email"
                        name="Direct Email"
                        value={currentProfile.contact_person_email}
                        onCopy={(val) => handleCopy(val, 'Focal Email')}
                        onEdit={(_, __, val) => handleStandardFieldEdit('contact_person_email', val)}
                        onDelete={() => handleStandardFieldDelete('contact_person_email')}
                        copiedId={copiedId}
                      />
                    </div>
                  </div>

                  {/* Authorized Signatory */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-purple-600" />
                      Authorized Signatory & Power of Attorney Holder
                    </div>

                    <ProfileField
                      id="signatory_name"
                      name="Signatory Full Name"
                      value={currentProfile.signatory_name}
                      onCopy={(val) => handleCopy(val, 'Signatory Name')}
                      onEdit={(_, __, val) => handleStandardFieldEdit('signatory_name', val)}
                      onDelete={() => handleStandardFieldDelete('signatory_name')}
                      copiedId={copiedId}
                    />

                    <ProfileField
                      id="signatory_title"
                      name="Signatory Designation"
                      value={currentProfile.signatory_title}
                      onCopy={(val) => handleCopy(val, 'Signatory Title')}
                      onEdit={(_, __, val) => handleStandardFieldEdit('signatory_title', val)}
                      onDelete={() => handleStandardFieldDelete('signatory_title')}
                      copiedId={copiedId}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <ProfileField
                        id="signatory_nid"
                        name="National ID / Passport No"
                        value={currentProfile.signatory_nid}
                        onCopy={(val) => handleCopy(val, 'Signatory NID')}
                        onEdit={(_, __, val) => handleStandardFieldEdit('signatory_nid', val)}
                        onDelete={() => handleStandardFieldDelete('signatory_nid')}
                        copiedId={copiedId}
                      />
                      <ProfileField
                        id="power_of_attorney_ref"
                        name="POA Deed / Resolution Ref"
                        value={currentProfile.power_of_attorney_ref}
                        onCopy={(val) => handleCopy(val, 'POA Ref')}
                        onEdit={(_, __, val) => handleStandardFieldEdit('power_of_attorney_ref', val)}
                        onDelete={() => handleStandardFieldDelete('power_of_attorney_ref')}
                        copiedId={copiedId}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: STATUTORY & TAX */}
          {activeTab === 'statutory' && (
            <Card className="p-5 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Statutory Tax Identifiers & Municipal Licenses
                  </h3>
                </div>
                <span className="text-[11px] text-[#64748B]">
                  Click copy icon on any field for quick RFP bid form entry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField
                  id="tin_number"
                  name="Tax Identification Number (e-TIN)"
                  value={currentProfile.tin_number}
                  onCopy={(val) => handleCopy(val, 'TIN')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('tin_number', val)}
                  onDelete={() => handleStandardFieldDelete('tin_number')}
                  copiedId={copiedId}
                  badge="Mandatory"
                  badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                />

                <ProfileField
                  id="bin_vat_number"
                  name="VAT Registration / BIN Number"
                  value={currentProfile.bin_vat_number}
                  onCopy={(val) => handleCopy(val, 'BIN')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('bin_vat_number', val)}
                  onDelete={() => handleStandardFieldDelete('bin_vat_number')}
                  copiedId={copiedId}
                  badge="Mandatory"
                  badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                />

                <ProfileField
                  id="trade_license_no"
                  name="Municipal Trade License Number"
                  value={currentProfile.trade_license_no}
                  onCopy={(val) => handleCopy(val, 'Trade License')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('trade_license_no', val)}
                  onDelete={() => handleStandardFieldDelete('trade_license_no')}
                  copiedId={copiedId}
                />

                <ProfileField
                  id="trade_license_expiry"
                  name="Trade License Validity Date"
                  value={currentProfile.trade_license_expiry}
                  onCopy={(val) => handleCopy(val, 'License Expiry')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('trade_license_expiry', val)}
                  onDelete={() => handleStandardFieldDelete('trade_license_expiry')}
                  copiedId={copiedId}
                  badge="Active"
                  badgeColor="bg-blue-50 text-blue-700 border-blue-200"
                />

                <ProfileField
                  id="trade_license_issuer"
                  name="Trade License Issuing Authority"
                  value={currentProfile.trade_license_issuer}
                  onCopy={(val) => handleCopy(val, 'Issuer')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('trade_license_issuer', val)}
                  onDelete={() => handleStandardFieldDelete('trade_license_issuer')}
                  copiedId={copiedId}
                />

                <ProfileField
                  id="tax_circle_zone"
                  name="Taxes Circle & Regional Zone"
                  value={currentProfile.tax_circle_zone}
                  onCopy={(val) => handleCopy(val, 'Tax Circle')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('tax_circle_zone', val)}
                  onDelete={() => handleStandardFieldDelete('tax_circle_zone')}
                  copiedId={copiedId}
                />

                <ProfileField
                  id="rjsc_return_year"
                  name="Latest RJSC Annual Return Year"
                  value={currentProfile.rjsc_return_year}
                  onCopy={(val) => handleCopy(val, 'RJSC Year')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('rjsc_return_year', val)}
                  onDelete={() => handleStandardFieldDelete('rjsc_return_year')}
                  copiedId={copiedId}
                />

                <ProfileField
                  id="irc_erc_no"
                  name="Import / Export Reg Certificate (IRC/ERC)"
                  value={currentProfile.irc_erc_no}
                  onCopy={(val) => handleCopy(val, 'IRC/ERC')}
                  onEdit={(_, __, val) => handleStandardFieldEdit('irc_erc_no', val)}
                  onDelete={() => handleStandardFieldDelete('irc_erc_no')}
                  copiedId={copiedId}
                />
              </div>
            </Card>
          )}

          {/* TAB 3: BANKING & FINANCIALS */}
          {activeTab === 'banking' && (
            <div className="space-y-4">
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Principal Banking Credentials & Guarantees
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <ProfileField
                    id="bank_name"
                    name="Principal Schedule Bank"
                    value={currentProfile.bank_name}
                    onCopy={(val) => handleCopy(val, 'Bank Name')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('bank_name', val)}
                    onDelete={() => handleStandardFieldDelete('bank_name')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="bank_branch"
                    name="Branch Name & Location"
                    value={currentProfile.bank_branch}
                    onCopy={(val) => handleCopy(val, 'Branch')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('bank_branch', val)}
                    onDelete={() => handleStandardFieldDelete('bank_branch')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="bank_account_name"
                    name="Exact Account Title"
                    value={currentProfile.bank_account_name}
                    onCopy={(val) => handleCopy(val, 'Account Title')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('bank_account_name', val)}
                    onDelete={() => handleStandardFieldDelete('bank_account_name')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="bank_account_no"
                    name="Bank Account Number"
                    value={currentProfile.bank_account_no}
                    onCopy={(val) => handleCopy(val, 'Account No')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('bank_account_no', val)}
                    onDelete={() => handleStandardFieldDelete('bank_account_no')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="routing_no"
                    name="Electronic Routing Number"
                    value={currentProfile.routing_no}
                    onCopy={(val) => handleCopy(val, 'Routing No')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('routing_no', val)}
                    onDelete={() => handleStandardFieldDelete('routing_no')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="swift_code"
                    name="SWIFT / BIC Code"
                    value={currentProfile.swift_code}
                    onCopy={(val) => handleCopy(val, 'SWIFT Code')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('swift_code', val)}
                    onDelete={() => handleStandardFieldDelete('swift_code')}
                    copiedId={copiedId}
                  />
                </div>
              </Card>

              {/* Financial Turnovers & Solvency */}
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Turnovers, Capital Standing & Solvency Capacity
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <ProfileField
                    id="audited_turnover_bdt"
                    name="Audited Annual Turnover (Last 3 Yrs Avg)"
                    value={currentProfile.audited_turnover_bdt ? currentProfile.audited_turnover_bdt.toLocaleString() : '0'}
                    prefix="BDT"
                    onCopy={(val) => handleCopy(val, 'Turnover BDT')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('audited_turnover_bdt', val)}
                    onDelete={() => handleStandardFieldDelete('audited_turnover_bdt')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="audited_turnover_usd"
                    name="Equivalent Turnover (USD)"
                    value={currentProfile.audited_turnover_usd ? currentProfile.audited_turnover_usd.toLocaleString() : '0'}
                    prefix="USD"
                    onCopy={(val) => handleCopy(val, 'Turnover USD')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('audited_turnover_usd', val)}
                    onDelete={() => handleStandardFieldDelete('audited_turnover_usd')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="bank_solvency_limit_bdt"
                    name="Bank Solvency / Liquid Credit Line"
                    value={currentProfile.bank_solvency_limit_bdt ? currentProfile.bank_solvency_limit_bdt.toLocaleString() : '0'}
                    prefix="BDT"
                    onCopy={(val) => handleCopy(val, 'Solvency')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('bank_solvency_limit_bdt', val)}
                    onDelete={() => handleStandardFieldDelete('bank_solvency_limit_bdt')}
                    copiedId={copiedId}
                    badge="Solvency"
                    badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                  />

                  <ProfileField
                    id="paid_up_capital_bdt"
                    name="Paid-Up Share Capital"
                    value={currentProfile.paid_up_capital_bdt ? currentProfile.paid_up_capital_bdt.toLocaleString() : '0'}
                    prefix="BDT"
                    onCopy={(val) => handleCopy(val, 'Paid Up Capital')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('paid_up_capital_bdt', val)}
                    onDelete={() => handleStandardFieldDelete('paid_up_capital_bdt')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="authorized_capital_bdt"
                    name="Authorized Share Capital"
                    value={currentProfile.authorized_capital_bdt ? currentProfile.authorized_capital_bdt.toLocaleString() : '0'}
                    prefix="BDT"
                    onCopy={(val) => handleCopy(val, 'Authorized Capital')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('authorized_capital_bdt', val)}
                    onDelete={() => handleStandardFieldDelete('authorized_capital_bdt')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="credit_rating"
                    name="External Credit Rating"
                    value={currentProfile.credit_rating}
                    onCopy={(val) => handleCopy(val, 'Credit Rating')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('credit_rating', val)}
                    onDelete={() => handleStandardFieldDelete('credit_rating')}
                    copiedId={copiedId}
                    badge={currentProfile.credit_rating_validity ? `Exp: ${currentProfile.credit_rating_validity}` : undefined}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: ACCREDITATIONS & WORKFORCE */}
          {activeTab === 'capacity' && (
            <div className="space-y-4">
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Quality, Security & Governance Certifications
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {(currentProfile.certifications || []).map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg hover:border-[#CBD5E1] transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-[#0F172A]">{cert}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(cert, `cert-${idx}`)}
                        className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-colors"
                        title="Copy certification name"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Workforce & Technical Capacity */}
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Workforce Numbers & Core Technical Capabilities
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
                  <ProfileField
                    id="total_employees"
                    name="Total Permanent Employee Count"
                    value={currentProfile.total_employees}
                    onCopy={(val) => handleCopy(val, 'Employees')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('total_employees', val)}
                    onDelete={() => handleStandardFieldDelete('total_employees')}
                    copiedId={copiedId}
                  />

                  <ProfileField
                    id="certified_engineers"
                    name="Certified Professional Engineers & Experts"
                    value={currentProfile.certified_engineers}
                    onCopy={(val) => handleCopy(val, 'Engineers')}
                    onEdit={(_, __, val) => handleStandardFieldEdit('certified_engineers', val)}
                    onDelete={() => handleStandardFieldDelete('certified_engineers')}
                    copiedId={copiedId}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wide">
                    Core Technical Domains
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(currentProfile.core_competencies || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: DYNAMIC CUSTOM FIELDS */}
          {activeTab === 'custom' && (
            <Card className="p-5 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#F1F5F9]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Dynamic Custom Profile Fields & Attributes
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Add arbitrary metadata for tender criteria (e.g. DLMS Conformance, Ministry Quotas, Special Licenses).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingField(!isAddingField)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingField ? 'Close Form' : 'Add Custom Field'}</span>
                </button>
              </div>

              {/* Add Custom Field Form */}
              {isAddingField && (
                <form
                  onSubmit={handleAddCustomField}
                  className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 space-y-3 animate-fadeIn"
                >
                  <div className="text-xs font-bold text-[#0F172A]">Create New Custom Field</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Field Name / Title *
                      </label>
                      <input
                        type="text"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="e.g. Environmental Clearance Certificate No"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Field Value *
                      </label>
                      <input
                        type="text"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        placeholder="e.g. DOE/CLEARANCE/2025/9401"
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingField(false)}
                      className="px-3 py-1 text-xs text-[#64748B] hover:text-[#0F172A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-[#1D4ED8]"
                    >
                      Save Field
                    </button>
                  </div>
                </form>
              )}

              {/* Custom Fields Grid */}
              {(currentProfile.custom_fields || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(currentProfile.custom_fields || []).map((f) => (
                    <ProfileField
                      key={f.id}
                      id={f.id}
                      name={f.name}
                      value={f.value}
                      isCustom={true}
                      onCopy={(val) => handleCopy(val, f.id)}
                      onEdit={handleCustomFieldEdit}
                      onDelete={handleCustomFieldDelete}
                      copiedId={copiedId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                  <Sparkles className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#0F172A]">No custom fields added yet</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Click "Add Custom Field" above to add dynamic attributes for this company.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* TAB 6: LINKED CREDENTIALS & VAULT DOCS */}
          {activeTab === 'linked_assets' && (
            <div className="space-y-4">
              {/* Linked Past Projects */}
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Verified Past Project Credentials ({associatedProjects.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    Includes signed Work Orders & Completion Certificates
                  </span>
                </div>

                {associatedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {associatedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 hover:border-[#CBD5E1] transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded mr-1.5">
                              {p.id}
                            </span>
                            <span className="text-xs font-bold text-[#0F172A]">{p.projectTitle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${p.projectTitle} - Client: ${p.clientName} (Value: ${p.currency} ${p.contractValue.toLocaleString()})`, p.id)}
                            className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-white shrink-0"
                            title="Copy project reference"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-[#64748B]">
                          <strong className="text-[#0F172A]">Client:</strong> {p.clientName} •{' '}
                          <strong className="text-[#0F172A]">Value:</strong> {p.currency}{' '}
                          {p.contractValue.toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]/60 flex-wrap">
                          {p.workOrderFilename && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <FileText className="w-3 h-3" /> WO: {p.workOrderFilename}
                            </span>
                          )}
                          {p.completionCertFilename && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> CC: {p.completionCertFilename}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-[#64748B]">
                    No past project credentials registered under this company yet.
                  </div>
                )}
              </Card>

              {/* Linked Master Documents in Vault */}
              <Card className="p-5 border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Master Corporate Vault Documents ({associatedDocuments.length})
                    </h3>
                  </div>
                </div>

                {associatedDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {associatedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] truncate">
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-[#64748B] mt-0.5">
                            {doc.category} • {doc.size || 'PDF'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(doc.name, doc.id)}
                          className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-white shrink-0"
                          title="Copy file name"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-[#64748B]">
                    No documents currently tagged under this company name in the Master Vault.
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center border-dashed border-[#CBD5E1]">
          <Building2 className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#0F172A]">No Company Profile Found</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Create a profile to manage company identities, tax credentials, and banking standing.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]"
          >
            Add First Company Profile
          </button>
        </Card>
      )}

      {/* CREATE NEW COMPANY PROFILE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Create New Company Profile</h3>
                  <p className="text-xs text-[#64748B]">
                    Register a new bidding entity (Lead Bidder or Joint Venture Partner)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Legal Company Name *
                  </label>
                  <input
                    type="text"
                    value={newLegalName}
                    onChange={(e) => setNewLegalName(e.target.value)}
                    placeholder="e.g. Apex Global Engineering Ltd"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Trade / Short Name
                  </label>
                  <input
                    type="text"
                    value={newTradeName}
                    onChange={(e) => setNewTradeName(e.target.value)}
                    placeholder="e.g. Apex Engineering"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Role in Bidding
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  >
                    <option value="LEAD_BIDDER">🏛️ Lead Bidder</option>
                    <option value="JV_PARTNER">⭐ Joint Venture Partner</option>
                    <option value="SUBCONTRACTOR">🔧 Subcontractor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Entity Type
                  </label>
                  <select
                    value={newEntityType}
                    onChange={(e) => setNewEntityType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Joint Venture Consortium">Joint Venture Consortium</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Registration / Incorporation No
                  </label>
                  <input
                    type="text"
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value)}
                    placeholder="e.g. C-184920/2021"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    e-TIN Number
                  </label>
                  <input
                    type="text"
                    value={newTin}
                    onChange={(e) => setNewTin(e.target.value)}
                    placeholder="12-digit e-TIN"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    VAT / BIN Number
                  </label>
                  <input
                    type="text"
                    value={newBin}
                    onChange={(e) => setNewBin(e.target.value)}
                    placeholder="13-digit BIN"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Principal Bank Name
                  </label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. Standard Chartered Bank"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Avg Annual Turnover (BDT)
                  </label>
                  <input
                    type="number"
                    value={newTurnoverBDT}
                    onChange={(e) => setNewTurnoverBDT(e.target.value)}
                    placeholder="e.g. 50000000"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-[#1D4ED8]"
                >
                  Create Company Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
