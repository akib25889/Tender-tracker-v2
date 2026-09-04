import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Building2,
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import { useTenders } from '../../context/TenderContext';

interface TenderPartner {
  assignment_id: number;
  organization_id: string;
  organization_name: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
  partner_type: string;
  status: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  assigned_at?: string;
  ceilings: Record<string, boolean>;
}

interface MasterPartner {
  id: string;
  name: string;
  partner_type: string;
  country: string;
  contact_email?: string;
  status: string;
}

export const TenderPartnersTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [assignedPartners, setAssignedPartners] = useState<TenderPartner[]>([]);
  const [allPartners, setAllPartners] = useState<MasterPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPartnerForCeiling, setSelectedPartnerForCeiling] = useState<TenderPartner | null>(null);

  // Form State for Assigning
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [partnerType, setPartnerType] = useState('JV_PARTNER');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const fetchTenderPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/permissions/tenders/${tender.id}/partners`);
      if (res.ok) {
        const data = await res.json();
        setAssignedPartners(data);
      }
    } catch (err) {
      console.error('Failed to fetch tender partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPartners = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/permissions/partners');
      if (res.ok) {
        const data = await res.json();
        setAllPartners(data);
      }
    } catch (err) {
      console.error('Failed to fetch master partners:', err);
    }
  };

  useEffect(() => {
    fetchTenderPartners();
    fetchAllPartners();
  }, [tender.id]);

  const handleAssignPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/permissions/partners/${selectedOrgId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tender_id: tender.id,
          partner_type: partnerType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        setShowAssignModal(false);
        setSelectedOrgId('');
        fetchTenderPartners();
      } else {
        alert('Failed to assign partner organization to this tender.');
      }
    } catch (err) {
      console.error('Assign error:', err);
    }
  };

  const handleUnassignPartner = async (partnerOrgId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from this tender? Their users will immediately lose access.`)) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/permissions/tenders/${tender.id}/partners/${partnerOrgId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTenderPartners();
      } else {
        alert('Failed to remove partner assignment.');
      }
    } catch (err) {
      console.error('Unassign error:', err);
    }
  };

  const handleToggleCeiling = async (partnerOrgId: string, permCode: string, currentVal: boolean) => {
    try {
      const updated = { [permCode]: !currentVal };
      const res = await fetch(`http://127.0.0.1:8000/api/permissions/partners/${partnerOrgId}/ceilings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ceilings: updated }),
      });

      if (res.ok) {
        fetchTenderPartners();
        if (selectedPartnerForCeiling && selectedPartnerForCeiling.organization_id === partnerOrgId) {
          setSelectedPartnerForCeiling((prev) =>
            prev
              ? {
                  ...prev,
                  ceilings: { ...prev.ceilings, [permCode]: !currentVal },
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error('Failed to update ceiling:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              Section 5 & 6 Compliant
            </span>
            <span className="text-xs text-[#64748B]">Tender Context: {tender.id}</span>
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">JV & External Partner Collaboration</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Assign partner organizations, enforce hard permission ceilings, and control cross-party data isolation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchTenderPartners();
              fetchAllPartners();
            }}
            className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
            title="Refresh Partners"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Partner</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Assigned Partners</span>
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">{assignedPartners.length}</div>
          <div className="mt-1 text-[11px] text-[#64748B]">Active JV & Consortium participants</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Security Boundary</span>
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#10B981]">Layer 2 Enforced</div>
          <div className="mt-1 text-[11px] text-[#64748B]">Unassigned orgs hard-blocked (403/404)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Financial Protection</span>
            <Lock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#F59E0B]">Ceilings Active</div>
          <div className="mt-1 text-[11px] text-[#64748B]">Financial & Commercial data sealed</div>
        </div>
      </div>

      {/* Partner List */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-semibold text-xs text-[#0F172A]">Assigned Organizations</h3>
          </div>
          <span className="text-[11px] text-[#64748B] font-mono">{assignedPartners.length} Organization(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading partner assignments...</div>
        ) : assignedPartners.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto">
              <h4 className="font-bold text-sm text-[#0F172A]">No External Partners Assigned</h4>
              <p className="text-xs text-[#64748B] mt-1">
                This tender is currently internal-only to NYK Advance. Assign a JV partner or subcontractor to begin secure collaborative authoring.
              </p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign First Partner</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {assignedPartners.map((partner) => (
              <div key={partner.organization_id} className="p-5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Organization Info */}
                  <div className="space-y-1.5 min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F172A]">{partner.organization_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        {partner.partner_type.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          partner.status === 'ACTIVE'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}
                      >
                        {partner.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#64748B]">
                      <span className="font-mono text-[11px] text-[#2563EB]">{partner.organization_id}</span>
                      {partner.country && <span>📍 {partner.country}</span>}
                      {partner.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#94A3B8]" />
                          {partner.contact_email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Permission Ceilings Overview */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[11px] text-[#64748B] mr-1 font-medium">Ceilings:</div>
                    {[
                      { code: 'document.view', label: 'View Docs' },
                      { code: 'document.download', label: 'Download' },
                      { code: 'document.upload', label: 'Upload' },
                      { code: 'financial.view', label: 'Financials' },
                    ].map((perm) => {
                      const isAllowed = partner.ceilings[perm.code] ?? (perm.code.startsWith('financial.') ? false : true);
                      return (
                        <button
                          key={perm.code}
                          type="button"
                          onClick={() => handleToggleCeiling(partner.organization_id, perm.code, isAllowed)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            isAllowed
                              ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7]'
                              : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] hover:bg-[#FEE2E2]'
                          }`}
                          title={`Click to ${isAllowed ? 'prohibit' : 'allow'} ${perm.label}`}
                        >
                          {isAllowed ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          <span>{perm.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => setSelectedPartnerForCeiling(partner)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] rounded-lg shadow-2xs transition-colors"
                    >
                      All Ceilings
                    </button>
                    <button
                      onClick={() => handleUnassignPartner(partner.organization_id, partner.organization_name)}
                      className="p-1.5 text-[#EF4444] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-lg shadow-2xs transition-colors"
                      title="Remove partner from tender"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {partner.notes && (
                  <div className="mt-2.5 text-[11px] text-[#64748B] bg-[#F1F5F9] px-3 py-1.5 rounded border border-[#E2E8F0]">
                    <span className="font-semibold text-[#475569]">Assignment Notes: </span>
                    {partner.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Assign Partner Organization */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Assign Partner to Tender</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignPartner} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Partner Organization <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                >
                  <option value="">Select organization...</option>
                  {allPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — {p.partner_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Collaboration Role</label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                >
                  <option value="JV_PARTNER">Joint Venture Partner (JV)</option>
                  <option value="CONSORTIUM_PARTNER">Consortium Member</option>
                  <option value="SUBCONTRACTOR">Designated Subcontractor</option>
                  <option value="CONSULTANT">External Consultant / Specialist</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#475569] mb-1">Assignment Scope / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Assigned to Civil Engineering and Structural Design Packages 1-4"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedOrgId}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Extended Ceilings Management */}
      {selectedPartnerForCeiling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Permission Ceilings — {selectedPartnerForCeiling.organization_name}
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Hard ceiling limits: Even if given explicit role grants, partner cannot exceed these bounds.
                </p>
              </div>
              <button
                onClick={() => setSelectedPartnerForCeiling(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { code: 'document.view', label: 'document.view', desc: 'Can inspect permitted files' },
                { code: 'document.download', label: 'document.download', desc: 'Can save raw binary files to disk' },
                { code: 'document.upload', label: 'document.upload', desc: 'Can submit new documents to the vault' },
                { code: 'task.view', label: 'task.view', desc: 'Can view tasks assigned to them' },
                { code: 'task.edit', label: 'task.edit', desc: 'Can update status on assigned tasks' },
                { code: 'financial.view', label: 'financial.view', desc: 'Can view financial & commercial sheets (Default Prohibited)' },
                { code: 'submission.submit', label: 'submission.submit', desc: 'Can execute final tender submission (Default Prohibited)' },
              ].map((item) => {
                const isAllowed = selectedPartnerForCeiling.ceilings[item.code] ?? (item.code.startsWith('financial.') || item.code.startsWith('submission.') ? false : true);
                return (
                  <div
                    key={item.code}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#0F172A]">{item.label}</div>
                      <div className="text-[10px] text-[#64748B]">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleCeiling(
                          selectedPartnerForCeiling.organization_id,
                          item.code,
                          isAllowed
                        )
                      }
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        isAllowed
                          ? 'bg-[#15803D] text-white border-[#166534]'
                          : 'bg-[#DC2626] text-white border-[#991B1B]'
                      }`}
                    >
                      {isAllowed ? 'ALLOWED' : 'PROHIBITED'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
              <button
                onClick={() => setSelectedPartnerForCeiling(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#0F172A] text-white rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
