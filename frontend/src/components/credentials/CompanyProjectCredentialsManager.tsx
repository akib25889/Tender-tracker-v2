import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useTenders } from '../../context/TenderContext';
import { CompanyProjectCredential, CustomCredentialField } from '../../types/tender';
import {
  Building2,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  Calendar,
  Link as LinkIcon,
  X,
  Search,
  Award,
  AlertCircle,
  Briefcase,
  FileCheck2,
} from 'lucide-react';

interface CredentialFieldProps {
  id: string;
  name: string;
  value: string;
  isCustom?: boolean;
  onCopy: (val: string) => void;
  onEdit: (id: string, newName: string, newVal: string) => void;
  onDelete: (id: string) => void;
  copiedId: string | null;
}

const CredentialField: React.FC<CredentialFieldProps> = ({
  id,
  name,
  value,
  isCustom = false,
  onCopy,
  onEdit,
  onDelete,
  copiedId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editVal, setEditVal] = useState(value);

  const handleSave = () => {
    onEdit(id, editName.trim(), editVal.trim());
    setIsEditing(false);
  };

  const isCopied = copiedId === id;

  return (
    <div className="group relative bg-[#F8FAFC] hover:bg-[#F1F5F9]/80 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg p-2.5 transition-all">
      {/* Top Header on top of field with Copy, Edit, Delete toolbar */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#E2E8F0]/70">
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
          {isCustom && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0">
              Custom
            </span>
          )}
        </div>

        {/* Action Toolbar on Top of Field: Copy, Edit, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Copy Icon Button */}
          <button
            type="button"
            onClick={() => onCopy(value)}
            className={`p-1 rounded transition-colors ${
              isCopied
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
            title="Copy field value to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Edit Icon Button */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className={`p-1 rounded transition-colors ${
              isEditing
                ? 'bg-blue-600 text-white'
                : 'text-[#64748B] hover:text-[#2563EB] hover:bg-white'
            }`}
            title={isEditing ? 'Save changes' : 'Edit field name and value'}
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
        <div className="flex items-center gap-1.5 mt-1">
          <input
            type="text"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            className="w-full bg-white border border-[#2563EB] rounded px-2 py-1 text-xs text-[#0F172A] font-medium outline-none focus:ring-1 focus:ring-[#2563EB]"
            placeholder="Field value"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-2 py-1 bg-[#2563EB] text-white rounded text-[10px] font-bold hover:bg-[#1D4ED8]"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="font-medium text-xs text-[#0F172A] break-words">
          {value || <span className="text-[#94A3B8] italic font-normal">Not specified</span>}
        </div>
      )}

      {isCopied && (
        <span className="absolute right-2 -bottom-2.5 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold shadow-xs animate-fadeIn">
          Copied!
        </span>
      )}
    </div>
  );
};

export const CompanyProjectCredentialsManager: React.FC = () => {
  const {
    companyProjects,
    addCompanyProject,
    updateCompanyProject,
    deleteCompanyProject,
    uploadProjectWorkOrder,
    uploadProjectCompletionCert,
    linkProjectToTender,
    tenders,
  } = useTenders();

  const [selectedCompany, setSelectedCompany] = useState<string>('PrimeTech Ltd');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal: Create New Project Credential
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newValue, setNewValue] = useState<number | ''>('');
  const [newCurrency, setNewCurrency] = useState('BDT');
  const [newStartDate, setNewStartDate] = useState('');
  const [newCompletionDate, setNewCompletionDate] = useState('');
  const [newRole, setNewRole] = useState('Prime Contractor');
  const [newCompanyRole, setNewCompanyRole] = useState('LEAD_BIDDER');

  // Modal: Add Custom Field to an existing project
  const [projectForCustomField, setProjectForCustomField] = useState<CompanyProjectCredential | null>(null);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  // Modal: Use Project in Tender Submission
  const [projectToLink, setProjectToLink] = useState<CompanyProjectCredential | null>(null);
  const [targetTenderId, setTargetTenderId] = useState<string>(tenders[0]?.id || '');
  const [targetFolder, setTargetFolder] = useState<string>('02_company_statutory_documents');
  const [linkSuccessMsg, setLinkSuccessMsg] = useState<string | null>(null);

  // Filtered projects
  const filteredProjects = companyProjects.filter((p) => {
    const matchesCompany =
      selectedCompany === 'ALL' ||
      p.companyName.toLowerCase() === selectedCompany.toLowerCase();
    const matchesSearch =
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roleInProject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customFields &&
        p.customFields.some(
          (cf) =>
            cf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cf.value.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    return matchesCompany && matchesSearch;
  });

  const handleCopy = (val: string, id: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;

    await addCompanyProject({
      companyName: selectedCompany === 'ALL' ? 'PrimeTech Ltd' : selectedCompany,
      companyRole: newCompanyRole,
      projectTitle: newTitle.trim(),
      clientName: newClient.trim(),
      contractValue: Number(newValue) || 0,
      currency: newCurrency,
      startDate: newStartDate || undefined,
      completionDate: newCompletionDate || undefined,
      roleInProject: newRole,
      customFields: [],
    });

    setNewTitle('');
    setNewClient('');
    setNewValue('');
    setNewStartDate('');
    setNewCompletionDate('');
    setIsAddProjectModalOpen(false);
  };

  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForCustomField || !customFieldName.trim()) return;

    const newField: CustomCredentialField = {
      id: `cf-${Date.now()}`,
      name: customFieldName.trim(),
      value: customFieldValue.trim(),
    };

    const updatedFields = [...(projectForCustomField.customFields || []), newField];
    await updateCompanyProject(projectForCustomField.id, {
      customFields: updatedFields,
    });

    setCustomFieldName('');
    setCustomFieldValue('');
    setProjectForCustomField(null);
  };

  const handleEditCustomField = async (
    project: CompanyProjectCredential,
    fieldId: string,
    newName: string,
    newVal: string
  ) => {
    const updated = (project.customFields || []).map((cf) =>
      cf.id === fieldId ? { ...cf, name: newName, value: newVal } : cf
    );
    await updateCompanyProject(project.id, { customFields: updated });
  };

  const handleDeleteCustomField = async (
    project: CompanyProjectCredential,
    fieldId: string
  ) => {
    const updated = (project.customFields || []).filter((cf) => cf.id !== fieldId);
    await updateCompanyProject(project.id, { customFields: updated });
  };

  const handleEditStandardField = async (
    project: CompanyProjectCredential,
    fieldKey: string,
    newVal: string
  ) => {
    const updates: Partial<CompanyProjectCredential> = {};
    if (fieldKey === 'client_name') updates.clientName = newVal;
    if (fieldKey === 'contract_value') updates.contractValue = Number(newVal) || 0;
    if (fieldKey === 'role_in_project') updates.roleInProject = newVal;
    if (fieldKey === 'start_date') updates.startDate = newVal;
    if (fieldKey === 'completion_date') updates.completionDate = newVal;
    await updateCompanyProject(project.id, updates);
  };

  const handleLinkToTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToLink || !targetTenderId) return;

    const res = await linkProjectToTender(projectToLink.id, targetTenderId, targetFolder);
    if (res) {
      setLinkSuccessMsg(
        `Linked "${projectToLink.projectTitle}" (WO & CC) into Tender ${targetTenderId} (${targetFolder})`
      );
      setTimeout(() => {
        setLinkSuccessMsg(null);
        setProjectToLink(null);
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Company Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Corporate Repository</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Company Experience Dossiers</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Company Past Projects &amp; Performance Credentials
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Store verified project details with Work Order (WO) and Completion Certificate (CC) uploads. Add dynamic custom fields and attach past experience credentials into any tender submission proposal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project Credential</span>
        </button>
      </div>

      {/* Filter and Company Selector Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Company Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCompany('PrimeTech Ltd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCompany === 'PrimeTech Ltd'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏛️ PrimeTech Ltd (Lead Bidder)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCompany('DataCore Systems Ltd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCompany === 'DataCore Systems Ltd'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>⭐ DataCore Systems Ltd (JV Partner)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCompany('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCompany === 'ALL'
                ? 'bg-[#2563EB] text-white font-semibold'
                : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            All Companies ({companyProjects.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, client, custom fields..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="font-bold text-sm text-[#0F172A]">No Project Credentials Found</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            No past project experience has been cataloged for {selectedCompany}. Click "Add Project Credential" to register completed projects with Work Order and Completion Certificate uploads.
          </p>
          <button
            type="button"
            onClick={() => setIsAddProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Project Dossier</span>
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-4 hover:border-[#CBD5E1] transition-colors"
            >
              {/* Project Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-base text-[#0F172A]">
                      {project.projectTitle}
                    </span>
                    {project.companyRole === 'JV_PARTNER' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        ⭐ JV Partner: {project.companyName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        🏛️ Lead Bidder: {project.companyName}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      ID: {project.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span className="font-medium text-[#0F172A]">{project.clientName}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      <span>
                        {project.currency} {project.contractValue.toLocaleString()}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>
                        {project.startDate || 'N/A'} → {project.completionDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setProjectToLink(project);
                      if (project.companyRole === 'JV_PARTNER') {
                        setTargetFolder('02A_jv_partner_credentials');
                      } else {
                        setTargetFolder('02_company_statutory_documents');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors shadow-2xs"
                    title="Attach this project credential into a tender submission"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Use in Tender Submission</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete project credential "${project.projectTitle}"?`)) {
                        deleteCompanyProject(project.id);
                      }
                    }}
                    className="p-1.5 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete project credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Core Project Details Fields Grid with Top Toolbar on Each Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Project Details &amp; Custom Fields
                  </span>
                  <button
                    type="button"
                    onClick={() => setProjectForCustomField(project)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded border border-[#BFDBFE] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Standard Field: Client Name */}
                  <CredentialField
                    id={`${project.id}-client`}
                    name="Client / Employer"
                    value={project.clientName}
                    onCopy={(val) => handleCopy(val, `${project.id}-client`)}
                    onEdit={(_, __, newVal) => handleEditStandardField(project, 'client_name', newVal)}
                    onDelete={() => handleEditStandardField(project, 'client_name', '')}
                    copiedId={copiedId}
                  />

                  {/* Standard Field: Contract Value */}
                  <CredentialField
                    id={`${project.id}-value`}
                    name={`Contract Value (${project.currency})`}
                    value={`${project.currency} ${project.contractValue.toLocaleString()}`}
                    onCopy={(val) => handleCopy(val, `${project.id}-value`)}
                    onEdit={(_, __, newVal) => handleEditStandardField(project, 'contract_value', newVal.replace(/[^0-9.]/g, ''))}
                    onDelete={() => handleEditStandardField(project, 'contract_value', '0')}
                    copiedId={copiedId}
                  />

                  {/* Standard Field: Role in Project */}
                  <CredentialField
                    id={`${project.id}-role`}
                    name="Execution Role"
                    value={project.roleInProject}
                    onCopy={(val) => handleCopy(val, `${project.id}-role`)}
                    onEdit={(_, __, newVal) => handleEditStandardField(project, 'role_in_project', newVal)}
                    onDelete={() => handleEditStandardField(project, 'role_in_project', '')}
                    copiedId={copiedId}
                  />

                  {/* Standard Field: Start Date */}
                  <CredentialField
                    id={`${project.id}-start`}
                    name="Commencement Date"
                    value={project.startDate || ''}
                    onCopy={(val) => handleCopy(val, `${project.id}-start`)}
                    onEdit={(_, __, newVal) => handleEditStandardField(project, 'start_date', newVal)}
                    onDelete={() => handleEditStandardField(project, 'start_date', '')}
                    copiedId={copiedId}
                  />

                  {/* Standard Field: Completion Date */}
                  <CredentialField
                    id={`${project.id}-completion`}
                    name="Completion Date"
                    value={project.completionDate || ''}
                    onCopy={(val) => handleCopy(val, `${project.id}-completion`)}
                    onEdit={(_, __, newVal) => handleEditStandardField(project, 'completion_date', newVal)}
                    onDelete={() => handleEditStandardField(project, 'completion_date', '')}
                    copiedId={copiedId}
                  />

                  {/* Dynamic Custom Fields */}
                  {(project.customFields || []).map((cf) => (
                    <CredentialField
                      key={cf.id}
                      id={cf.id}
                      name={cf.name}
                      value={cf.value}
                      isCustom={true}
                      onCopy={(val) => handleCopy(val, cf.id)}
                      onEdit={(_, newName, newVal) => handleEditCustomField(project, cf.id, newName, newVal)}
                      onDelete={() => handleDeleteCustomField(project, cf.id)}
                      copiedId={copiedId}
                    />
                  ))}
                </div>
              </div>

              {/* Work Order and Completion Certificate Upload Cards */}
              <div className="pt-2 border-t border-[#F1F5F9]">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block mb-2.5">
                  Attached Formal Proofs (Work Order &amp; Completion Certificate)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Work Order Card */}
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">
                            Work Order (WO) / Signed Contract
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            Official appointment award or PO copy
                          </span>
                        </div>
                      </div>

                      {project.workOrderFilename ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Attached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          Pending Upload
                        </span>
                      )}
                    </div>

                    {project.workOrderFilename ? (
                      <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                        <div className="font-semibold text-[#0F172A] truncate">
                          {project.workOrderFilename}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B]">
                          <span>Size: {project.workOrderSize || 'Unknown'}</span>
                          {project.workOrderSha256 && (
                            <>
                              <span>•</span>
                              <span className="truncate">SHA: {project.workOrderSha256.substring(0, 12)}...</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Work Order File Upload Input */}
                    <div>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] border-dashed rounded-lg text-xs font-semibold text-[#2563EB] cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{project.workOrderFilename ? 'Replace Work Order File' : 'Upload Work Order PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadProjectWorkOrder(project.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Completion Certificate Card */}
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                          <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">
                            Completion / Performance Certificate (CC)
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            Employer sign-off or final acceptance sheet
                          </span>
                        </div>
                      </div>

                      {project.completionCertFilename ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Attached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          Pending Upload
                        </span>
                      )}
                    </div>

                    {project.completionCertFilename ? (
                      <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                        <div className="font-semibold text-[#0F172A] truncate">
                          {project.completionCertFilename}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B]">
                          <span>Size: {project.completionCertSize || 'Unknown'}</span>
                          {project.completionCertSha256 && (
                            <>
                              <span>•</span>
                              <span className="truncate">SHA: {project.completionCertSha256.substring(0, 12)}...</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Completion Certificate File Upload Input */}
                    <div>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] border-dashed rounded-lg text-xs font-semibold text-emerald-700 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{project.completionCertFilename ? 'Replace Certificate File' : 'Upload Completion Certificate PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadProjectCompletionCert(project.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Project Credential */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Add Project Experience Credential
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProjectModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Project Title / Contract Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National High-Speed Transmission Backbone Network Phase-III"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Client / Procuring Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh Telecommunications Company"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Owning Entity Role
                  </label>
                  <select
                    value={newCompanyRole}
                    onChange={(e) => setNewCompanyRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="LEAD_BIDDER">🏛️ Lead Bidder ({selectedCompany})</option>
                    <option value="JV_PARTNER">⭐ JV Partner ({selectedCompany})</option>
                    <option value="SUBCONTRACTOR">🤝 Subcontractor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Contract / Work Order Value *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="45000000"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Currency
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={newCompletionDate}
                    onChange={(e) => setNewCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Contractor Execution Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prime EPC Contractor / Joint Venture Partner (40%)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[11px] text-[#1D4ED8]">
                <strong>Persistent Archive:</strong> After creating the project dossier, you can upload its Work Order and Completion Certificate files and add unlimited custom fields.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0F172A] text-white font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
                >
                  Save Project Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Field */}
      {projectForCustomField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Add Custom Field to Project
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProjectForCustomField(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomField} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                  Target Project:
                </span>
                <span className="font-bold text-[#0F172A] block truncate mt-0.5">
                  {projectForCustomField.projectTitle}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Field Name / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supervising Consultant, JV Share %, FIDIC Clause"
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Field Value *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. SMEC International Pty Ltd, 40% Share, Clause 14.1"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setProjectForCustomField(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] shadow-sm transition-colors"
                >
                  Create Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Use in Tender Submission */}
      {projectToLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Attach Project Credential to Tender Proposal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProjectToLink(null)}
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
                    Selected Past Experience Credential:
                  </span>
                  <span className="font-semibold text-xs text-[#0F172A] block mt-0.5">
                    {projectToLink.projectTitle}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B]">
                    <span>Client: {projectToLink.clientName}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#0F172A]">
                      {projectToLink.currency} {projectToLink.contractValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Select Target Tender Opportunity *
                  </label>
                  <select
                    value={targetTenderId}
                    onChange={(e) => setTargetTenderId(e.target.value)}
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
                    {projectToLink.companyRole === 'JV_PARTNER' && (
                      <option value="02A_jv_partner_credentials" className="font-bold text-amber-700 bg-amber-50">
                        ⭐ 02A JV Partner Credentials &amp; Agreements
                      </option>
                    )}
                    <option value="02_company_statutory_documents">
                      📁 02 Company Statutory Credentials
                    </option>
                    <option value="03_technical_proposal">
                      📁 03 Technical Proposal &amp; Experience Dossier
                    </option>
                    <option value="05_final_submission_package">
                      📁 05 Compiled Sealed Submission Package
                    </option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 space-y-1">
                  <strong>Automatic Package Bundling:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1">
                    <li>Work Order PDF ({projectToLink.workOrderFilename || 'Pending upload'})</li>
                    <li>Completion Certificate PDF ({projectToLink.completionCertFilename || 'Pending upload'})</li>
                    <li>Full Credential Factsheet with all Custom Fields</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setProjectToLink(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] shadow-sm transition-colors"
                  >
                    Attach to Proposal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
