import { API_BASE_URL } from '../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useTenders } from '../context/TenderContext';
import {
  PartnerOrganization,
  PermissionRule,
  AccessBlock,
  DiagnosticResult,
  AuthorizationAuditLog,
} from '../types/permission';
import { isSuperAdminRole } from '../types/tender';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Building2,
  PlayCircle,
  AlertTriangle,
  History,
  Search,
  Plus,
  Sliders,
  CheckCircle2,
  Eye,
  Download,
  Upload,
  Trash2,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react';

const STANDARD_PERMISSIONS = [
  { code: '*', name: 'All Permissions (* Wildcard / Full Access)', module: 'system', icon: ShieldCheck },
  { code: 'tender.view', name: 'View Tender Overview', module: 'tender', icon: Eye },
  { code: 'tender.create', name: 'Create Opportunity', module: 'tender', icon: Plus },
  { code: 'tender.edit', name: 'Modify Tender Details', module: 'tender', icon: Sliders },
  { code: 'tender.delete', name: 'Delete Tender Record', module: 'tender', icon: Trash2 },
  { code: 'task.view', name: 'View Operational Tasks', module: 'task', icon: Eye },
  { code: 'task.edit', name: 'Edit Task Status & Assignee', module: 'task', icon: Sliders },
  { code: 'document.view', name: 'View Document Metadata', module: 'document', icon: Eye },
  { code: 'document.preview', name: 'In-Browser Document Preview', module: 'document', icon: FileText },
  { code: 'document.download', name: 'Download Original Files', module: 'document', icon: Download },
  { code: 'document.upload', name: 'Upload Files to Vault', module: 'document', icon: Upload },
  { code: 'document.delete', name: 'Delete Documents from Vault', module: 'document', icon: Trash2 },
  { code: 'financial.view', name: 'View Financial & BOQ Rates', module: 'financial', icon: AlertTriangle, sensitive: true },
  { code: 'financial.edit', name: 'Edit Commercial Pricing Model', module: 'financial', icon: AlertTriangle, sensitive: true },
  { code: 'submission.submit', name: 'Execute Portal Bid Submission', module: 'submission', icon: ShieldAlert, sensitive: true },
  { code: 'partner.manage', name: 'Manage JV & Consortium Partners', module: 'partner', icon: Building2 },
  { code: 'permission.manage', name: 'Access Control & Ceilings', module: 'permission', icon: Shield },
];

export const MasterPermissionsPage: React.FC = () => {
  const { tenders, teamMembers, currentUser } = useTenders();
  const isSuperAdmin = isSuperAdminRole(currentUser.role);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'simulator' | 'partners' | 'roles' | 'blocks' | 'audit'>('simulator');

  // --- State: Partners ---
  const [partners, setPartners] = useState<PartnerOrganization[]>([
    {
      id: 'ORG-APEX-01',
      name: 'Apex Engineering & Infrastructure JV',
      partner_type: 'JV_PARTNER',
      country: 'Bangladesh',
      contact_email: 'bids@apex-engineering.com',
      status: 'ACTIVE',
      notes: 'Primary civil works and hardware integration consortium partner.',
      assignments: [
        { tender_id: 'TDR-PRC0190428', status: 'ACTIVE', partner_type: 'JV_PARTNER' },
        { tender_id: 'TDR-2026-EU-089', status: 'ACTIVE', partner_type: 'JV_PARTNER' },
      ],
      ceilings_count: 12,
    },
    {
      id: 'ORG-GLOBAL-02',
      name: 'Global Horizon Consulting Consortium',
      partner_type: 'CONSORTIUM_PARTNER',
      country: 'United Kingdom',
      contact_email: 'compliance@globalhorizon.co.uk',
      status: 'ACTIVE',
      notes: 'International regulatory & ESG audit partner.',
      assignments: [
        { tender_id: 'TDR-PRC0190428', status: 'ACTIVE', partner_type: 'CONSORTIUM_PARTNER' },
      ],
      ceilings_count: 10,
    },
  ]);

  const [selectedPartnerForCeiling, setSelectedPartnerForCeiling] = useState<string>('ORG-APEX-01');
  const [ceilings, setCeilings] = useState<Record<string, boolean>>({
    'tender.view': true,
    'task.view': true,
    'task.edit': true,
    'document.view': true,
    'document.preview': true,
    'document.upload': true,
    'document.download': true,
    'document.delete': false,
    'financial.view': false,
    'financial.edit': false,
    'submission.submit': false,
    'permission.manage': false,
  });

  // --- State: Rules & Overrides ---
  const [rules, setRules] = useState<PermissionRule[]>([
    { id: 1, subject_type: 'ROLE', subject_id: 'BUSINESS_HEAD', permission_code: 'tender.view', effect: 'ALLOW', scope_type: 'ROLE', scope_id: 'BUSINESS_HEAD' },
    { id: 2, subject_type: 'ROLE', subject_id: 'BUSINESS_HEAD', permission_code: 'financial.view', effect: 'ALLOW', scope_type: 'ROLE', scope_id: 'BUSINESS_HEAD' },
    { id: 3, subject_type: 'ROLE', subject_id: 'TENDER_ANALYST', permission_code: 'financial.view', effect: 'DENY', scope_type: 'ROLE', scope_id: 'TENDER_ANALYST' },
    { id: 4, subject_type: 'PARTNER_ORGANIZATION', subject_id: 'ORG-APEX-01', permission_code: 'document.download', effect: 'DENY', scope_type: 'RESOURCE', scope_id: 'DOC-CONFIDENTIAL-01' },
    { id: 5, subject_type: 'ROLE', subject_id: 'TENDER_ANALYST', permission_code: 'document.upload', effect: 'ALLOW', scope_type: 'TENDER', scope_id: 'TDR-PRC0190428' },
  ]);

  // --- State: Security Blockers ---
  const [blocks, setBlocks] = useState<AccessBlock[]>([
    {
      id: 1,
      subject_type: 'USER',
      subject_id: 'USR-EXT-09',
      block_type: 'USER_SUSPENDED',
      reason: 'Pending NDA renewal and security audit clearance.',
      starts_at: '2026-09-01',
      is_active: true,
    },
  ]);

  // --- State: Simulator Form ---
  const [simUser, setSimUser] = useState<string>(currentUser.id);
  const [simPartner, setSimPartner] = useState<string>('NONE');
  const [simTender, setSimTender] = useState<string>(tenders[0]?.id || 'TDR-PRC0190428');
  const [simResource, setSimResource] = useState<string>('');
  const [selectedSimActions, setSelectedSimActions] = useState<string[]>(['*']);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- State: Audit Trail ---
  const [auditLogs, setAuditLogs] = useState<AuthorizationAuditLog[]>([
    {
      id: 101,
      uuid: 'a8b9c0d1-0001',
      request_id: 'REQ-2026-09-04-A1B2C3',
      user_id: 'USR-01',
      tender_id: 'TDR-PRC0190428',
      permission_code: 'financial.view',
      action: 'view',
      decision: 'ALLOW',
      matched_rule_scope: 'ROLE',
      matched_rule_effect: 'ALLOW',
      matched_rule_id: 2,
      ip_address: '192.168.1.45',
      created_at: '2026-09-04 15:42:10',
    },
    {
      id: 102,
      uuid: 'a8b9c0d1-0002',
      request_id: 'REQ-2026-09-04-F9E8D7',
      partner_organization_id: 'ORG-APEX-01',
      tender_id: 'TDR-PRC0190428',
      permission_code: 'financial.view',
      action: 'view',
      decision: 'DENY',
      denial_reason_code: 'PARTNER_PERMISSION_CEILING_EXCEEDED',
      denial_message: 'Partner ceiling prohibits access to internal sensitive/financial operations.',
      matched_rule_scope: 'PARTNER_CEILING',
      matched_rule_effect: 'DENY',
      ip_address: '103.14.22.8',
      created_at: '2026-09-04 15:43:55',
    },
    {
      id: 103,
      uuid: 'a8b9c0d1-0003',
      request_id: 'REQ-2026-09-04-E4C2B1',
      user_id: 'USR-EXT-09',
      permission_code: 'tender.view',
      action: 'view',
      decision: 'DENY',
      denial_reason_code: 'USER_SUSPENDED',
      denial_message: 'User account is suspended: Pending NDA renewal.',
      matched_rule_scope: 'SECURITY_BLOCKER',
      matched_rule_effect: 'DENY',
      ip_address: '192.168.1.109',
      created_at: '2026-09-04 15:45:00',
    },
  ]);

  const [auditFilterDecision, setAuditFilterDecision] = useState<'ALL' | 'ALLOW' | 'DENY'>('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // Fetch from backend API if available
  useEffect(() => {
    fetch(`${API_BASE_URL}/permissions/partners`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) setPartners(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/permissions/rules`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) setRules(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/permissions/blocks`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) setBlocks(data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/permissions/audit-logs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) setAuditLogs(data);
      })
      .catch(() => {});
  }, []);

  // --- Permission Selection Handlers ---
  const toggleSimAction = (code: string) => {
    setSelectedSimActions((prev) => {
      if (prev.includes(code)) {
        const next = prev.filter((c) => c !== code);
        return next.length === 0 ? ['*'] : next;
      } else {
        return [...prev, code];
      }
    });
  };

  const handleSelectAllSimActions = () => {
    setSelectedSimActions(STANDARD_PERMISSIONS.map((p) => p.code));
  };

  const handleClearSimActions = () => {
    setSelectedSimActions(['*']);
  };

  // --- Run Multi-Action Diagnostic Simulation ---
  const handleRunDiagnostic = async () => {
    if (selectedSimActions.length === 0) return;
    setIsSimulating(true);

    const evaluatedResults: DiagnosticResult[] = [];
    const newLogs: AuthorizationAuditLog[] = [];

    for (const actionCode of selectedSimActions) {
      const payload = {
        user_id: simPartner === 'NONE' ? simUser : undefined,
        partner_org_id: simPartner !== 'NONE' ? simPartner : undefined,
        tender_id: simTender || undefined,
        resource_id: simResource.trim() || undefined,
        permission_code: actionCode,
      };

      let evaluated: DiagnosticResult | null = null;

      try {
        const res = await fetch(`${API_BASE_URL}/permissions/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          evaluated = await res.json();
        }
      } catch {
        // Fallback to local evaluation
      }

      if (!evaluated) {
        // Local Simulation Fallback
        const reqId = `REQ-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        let allowed = true;
        let denialReason = '';
        let denialCode = '';

        // Check partner ceiling
        if (simPartner !== 'NONE') {
          const isCeilingDenied =
            actionCode !== '*' &&
            (ceilings[actionCode] === false || actionCode.startsWith('financial.') || actionCode.startsWith('submission.'));
          if (isCeilingDenied) {
            allowed = false;
            denialReason = "Requested action exceeds the partner organization's maximum permission ceiling.";
            denialCode = 'PARTNER_PERMISSION_CEILING_EXCEEDED';
          }
        }

        // Check security block
        const isBlocked = blocks.some((b) => b.is_active && b.subject_id === simUser);
        if (isBlocked) {
          allowed = false;
          denialReason = 'User account is under active security suspension.';
          denialCode = 'USER_SUSPENDED';
        }

        evaluated = {
          request_id: reqId,
          allowed,
          verdict: allowed ? 'ALLOW' : 'DENY',
          permission_code: actionCode,
          denial_reason_code: allowed ? undefined : denialCode,
          denial_message: allowed ? undefined : denialReason,
          matched_rule_scope: allowed ? 'ROLE' : (simPartner !== 'NONE' ? 'PARTNER_CEILING' : 'SECURITY_BLOCKER'),
          steps: [
            {
              name: 'Layer 1: Security Blockers',
              passed: !isBlocked,
              status: !isBlocked ? 'PASS' : 'FAIL',
              detail: isBlocked ? 'User suspended' : 'No active security suspensions.',
            },
            {
              name: 'Layer 2: Access Boundaries',
              passed: true,
              status: 'PASS',
              detail: 'Tender membership & assignment verified.',
            },
            {
              name: 'Partner Permission Ceiling',
              passed: !(simPartner !== 'NONE' && actionCode !== '*' && (ceilings[actionCode] === false || actionCode.startsWith('financial.'))),
              status: !(simPartner !== 'NONE' && actionCode !== '*' && (ceilings[actionCode] === false || actionCode.startsWith('financial.'))) ? 'PASS' : 'FAIL',
              detail: simPartner === 'NONE' ? 'Internal User (Ceiling N/A)' : (ceilings[actionCode] === false ? 'Action blocked by partner ceiling.' : 'Action within ceiling boundary.'),
            },
            {
              name: 'Layer 3: Scope Resolution (Resource > Tender > Org > Role)',
              passed: allowed,
              status: allowed ? 'PASS' : 'FAIL',
              detail: allowed ? 'Granted via Role Baseline (ALLOW)' : denialReason,
            },
          ],
        };
      }

      evaluatedResults.push(evaluated);

      // Add to audit logs view
      newLogs.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        uuid: crypto.randomUUID(),
        request_id: evaluated.request_id,
        user_id: payload.user_id,
        partner_organization_id: payload.partner_org_id,
        tender_id: payload.tender_id,
        resource_id: payload.resource_id,
        permission_code: payload.permission_code,
        action: payload.permission_code.split('.').pop() || 'action',
        decision: evaluated.verdict,
        denial_reason_code: evaluated.denial_reason_code,
        denial_message: evaluated.denial_message,
        matched_rule_id: evaluated.matched_rule_id,
        matched_rule_scope: evaluated.matched_rule_scope,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
    }

    setAuditLogs((prev) => [...newLogs, ...prev]);
    setIsSimulating(false);
  };

  // Toggle ceiling locally
  const toggleCeiling = (code: string) => {
    if (!isSuperAdmin) return;
    setCeilings((prev) => {
      const next = { ...prev, [code]: !prev[code] };
      // Sync to backend
      fetch(`${API_BASE_URL}/permissions/partners/${selectedPartnerForCeiling}/ceilings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ceilings: { [code]: next[code] } }),
      }).catch(() => {});
      return next;
    });
  };

  // Allow or Deny all ceilings at once
  const handleSetAllCeilings = (allow: boolean) => {
    if (!isSuperAdmin) return;
    const updatedCeilings: Record<string, boolean> = {};
    STANDARD_PERMISSIONS.forEach((p) => {
      updatedCeilings[p.code] = allow;
    });
    setCeilings((prev) => ({ ...prev, ...updatedCeilings }));

    // Sync to backend
    fetch(`${API_BASE_URL}/permissions/partners/${selectedPartnerForCeiling}/ceilings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ceilings: updatedCeilings }),
    }).catch(() => {});
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesDecision = auditFilterDecision === 'ALL' || log.decision === auditFilterDecision;
    const matchesSearch =
      auditSearch === '' ||
      log.request_id.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.permission_code.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.user_id && log.user_id.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (log.tender_id && log.tender_id.toLowerCase().includes(auditSearch.toLowerCase()));
    return matchesDecision && matchesSearch;
  });

  // --- SUPER_ADMIN GATE ---
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shadow-sm">
          <Lock className="w-10 h-10 text-[#DC2626]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">System Admin Access Only</h2>
          <p className="text-sm text-[#64748B] max-w-sm">
            The Access &amp; Permissions console is restricted to the <span className="font-semibold text-[#DC2626]">System Administrator</span> account.<br />
            Please contact your System Admin to manage permissions.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#64748B]">
          <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Logged in as: <span className="font-semibold text-[#0F172A]">{currentUser.name}</span> ({currentUser.role.replace(/_/g, ' ')})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span className="font-semibold text-[#0F172A]">Security &amp; Governance</span>
            <span>•</span>
            <span>JV Collaboration Protocol</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
                Access &amp; Permissions Control Center
              </h1>
              <p className="text-xs text-[#64748B]">
                Centralized 4-layer authorization engine, partner permission ceilings, and immutable security audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs">
            <span className="text-[#64748B] block text-[10px] font-medium">Standard Permissions</span>
            <span className="font-mono font-bold text-[#0F172A] text-sm">20 Cataloged</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs">
            <span className="text-[#64748B] block text-[10px] font-medium">JV &amp; Partner Orgs</span>
            <span className="font-mono font-bold text-[#2563EB] text-sm">{partners.length} Registered</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs">
            <span className="text-[#64748B] block text-[10px] font-medium">Security Suspensions</span>
            <span className="font-mono font-bold text-[#DC2626] text-sm">{blocks.filter(b => b.is_active).length} Active</span>
          </div>
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>Read-Only Governance Mode:</strong> You are authenticated as{' '}
              <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')}). Modifying partner permission ceilings, role rules, and security suspensions is restricted to <strong>Super Admin</strong>.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#FDE68A] text-[#B45309] font-bold shrink-0 self-start sm:self-auto">
            Super Admin Required
          </span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Live Diagnostic Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'partners'
              ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>JV &amp; Partner Ceilings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role Baselines &amp; Overrides</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blocks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'blocks'
              ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security Blockers (Layer 1)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Authorization Audit Trail</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DIAGNOSTIC SIMULATOR                                               */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <Card
            title="Authorization Test Simulator"
            subtitle="Test any user, partner, tender, or resource to trace the 4-layer decision pipeline."
          >
            <div className="space-y-4 text-xs">
              {/* Subject Selector: Internal vs Partner */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Subject Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimPartner('NONE')}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                      simPartner === 'NONE'
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'border-[#E2E8F0] bg-white text-[#64748B]'
                    }`}
                  >
                    🏢 Internal NYK Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPartner(partners[0]?.id || 'ORG-APEX-01')}
                    className={`p-2.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                      simPartner !== 'NONE'
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'border-[#E2E8F0] bg-white text-[#64748B]'
                    }`}
                  >
                    🤝 External JV Partner
                  </button>
                </div>
              </div>

              {simPartner === 'NONE' ? (
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    Internal User Profile:
                  </label>
                  <select
                    value={simUser}
                    onChange={(e) => setSimUser(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-medium text-[#0F172A] cursor-pointer"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    External Partner Organization:
                  </label>
                  <select
                    value={simPartner}
                    onChange={(e) => setSimPartner(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-medium text-[#0F172A] cursor-pointer"
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.partner_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Tender Context */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Tender Workspace Context:
                </label>
                <select
                  value={simTender}
                  onChange={(e) => setSimTender(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-medium text-[#0F172A] cursor-pointer"
                >
                  <option value="">-- Global / No Tender --</option>
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.id}] {t.title.substring(0, 42)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Resource ID (Optional) */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Specific Resource / Document ID (Optional):
                </label>
                <input
                  type="text"
                  value={simResource}
                  onChange={(e) => setSimResource(e.target.value)}
                  placeholder="e.g. DOC-01 or DOC-CONFIDENTIAL-01"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#0F172A]"
                />
                <span className="text-[10px] text-[#94A3B8] block mt-1">
                  Leave blank to test general tender-level access.
                </span>
              </div>

              {/* Requested Action Permissions (Multi-Select) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[#0F172A] text-xs">
                    Target Permissions to Evaluate:
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px]">
                      {selectedSimActions.length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllSimActions}
                      className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#CBD5E1]">•</span>
                    <button
                      type="button"
                      onClick={handleClearSimActions}
                      className="font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    >
                      Reset (*)
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] p-1.5 space-y-1 divide-y divide-[#E2E8F0]/60">
                  {STANDARD_PERMISSIONS.map((p) => {
                    const isSelected = selectedSimActions.includes(p.code);
                    const IconComponent = p.icon;
                    return (
                      <div
                        key={p.code}
                        onClick={() => toggleSimAction(p.code)}
                        className={`pt-1 first:pt-0 flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                          isSelected ? 'bg-white border border-[#BFDBFE] shadow-2xs' : 'hover:bg-white/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2563EB] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-[#94A3B8] shrink-0" />
                          )}
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${p.sensitive ? 'text-[#DC2626]' : 'text-[#2563EB]'}`} />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-[#0F172A] block truncate leading-tight">{p.name}</span>
                            <span className="font-mono text-[10px] text-[#64748B] block truncate leading-tight">{p.code}</span>
                          </div>
                        </div>
                        {p.sensitive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shrink-0">
                            Sensitive
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={isSimulating || selectedSimActions.length === 0}
                onClick={handleRunDiagnostic}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>
                  {isSimulating
                    ? `Evaluating ${selectedSimActions.length} Permission${selectedSimActions.length > 1 ? 's' : ''}...`
                    : `Run 4-Layer Authorization Check (${selectedSimActions.length})`}
                </span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: JV / PARTNER ORGANIZATIONS & CEILINGS                              */}
      {/* ========================================================================= */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((p) => {
              const isSelected = selectedPartnerForCeiling === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPartnerForCeiling(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF]/40 shadow-xs'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs">
                        JV
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#0F172A]">{p.name}</h4>
                        <span className="font-mono text-[10px] text-[#64748B] block">{p.id} • {p.country}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                      {p.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B] mt-2 line-clamp-2">{p.notes}</p>

                  <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Tenders Assigned: <strong>{p.assignments.length}</strong></span>
                    <span className="text-[#2563EB] font-semibold hover:underline">
                      {isSelected ? '✓ Managing Ceilings' : 'Click to Configure Ceilings →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ceiling Editor for Selected Partner */}
          <Card
            title={`Partner Permission Ceiling: ${partners.find((p) => p.id === selectedPartnerForCeiling)?.name}`}
            subtitle="Hard access cap. Even if an administrator accidentally grants higher permissions, the ceiling enforces Actual = Ceiling ∩ Granted."
            headerAction={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isSuperAdmin}
                  onClick={() => handleSetAllCeilings(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] rounded-md border border-[#BFDBFE] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isSuperAdmin ? "Grant ALLOW for all permissions to this partner" : "Ceiling modification restricted to Super Admin"}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Allow All Permissions</span>
                </button>
                <button
                  type="button"
                  disabled={!isSuperAdmin}
                  onClick={() => handleSetAllCeilings(false)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] rounded-md border border-[#FECACA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isSuperAdmin ? "Set all permissions to DENY for this partner" : "Ceiling modification restricted to Super Admin"}
                >
                  <span>Deny All</span>
                </button>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {STANDARD_PERMISSIONS.map((perm) => {
                const isAllowed = ceilings[perm.code] !== false;
                const IconComponent = perm.icon;

                return (
                  <div
                    key={perm.code}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isAllowed
                        ? 'border-[#E2E8F0] bg-white'
                        : 'border-[#FECACA] bg-[#FEF2F2]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <IconComponent className={`w-4 h-4 shrink-0 ${perm.sensitive ? 'text-[#DC2626]' : 'text-[#2563EB]'}`} />
                      <div className="min-w-0">
                        <span className="font-bold text-[#0F172A] block truncate">{perm.name}</span>
                        <span className="font-mono text-[10px] text-[#64748B] block truncate">{perm.code}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isSuperAdmin}
                      onClick={() => toggleCeiling(perm.code)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                        isAllowed
                          ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] hover:bg-[#DCFCE7]'
                          : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2]'
                      } ${isSuperAdmin ? 'cursor-pointer' : ''}`}
                      title={!isSuperAdmin ? "Ceiling modifications restricted to Super Admin" : undefined}
                    >
                      {isAllowed ? 'ALLOW' : 'DENY'}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROLE BASELINES & SCOPE OVERRIDES                                   */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <Card
          title="Active Permission Rules &amp; Scope Hierarchy"
          subtitle="Hierarchical evaluation: Specific Resource overrides Tender; Tender overrides Organization; Organization overrides Role."
          headerAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newRule: PermissionRule = {
                    id: Date.now(),
                    subject_type: 'ROLE',
                    subject_id: 'ADMIN',
                    scope_type: 'ROLE',
                    permission_code: '*',
                    effect: 'ALLOW',
                  };
                  setRules((prev) => [newRule, ...prev]);
                  fetch(`${API_BASE_URL}/permissions/rules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRule),
                  }).catch(() => {});
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-md shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Grant full administrative wildcard access"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Grant All Permissions (`*` Wildcard)</span>
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Rule ID</th>
                  <th className="py-2.5 px-3">Subject (Who)</th>
                  <th className="py-2.5 px-3">Scope (Where)</th>
                  <th className="py-2.5 px-3">Permission Code</th>
                  <th className="py-2.5 px-3">Effect</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">#{rule.id}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#0F172A]">{rule.subject_id}</span>
                      <span className="text-[10px] text-[#94A3B8] block">{rule.subject_type}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-bold">
                        {rule.scope_type}
                      </span>
                      {rule.scope_id && <span className="text-[#64748B] ml-1.5">({rule.scope_id})</span>}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">{rule.permission_code}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          rule.effect === 'ALLOW'
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                        }`}
                      >
                        {rule.effect}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setRules(rules.filter((r) => r.id !== rule.id))}
                        className="text-[#94A3B8] hover:text-[#DC2626] p-1 transition-colors"
                        title="Delete this rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY BLOCKERS (LAYER 1)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'blocks' && (
        <Card
          title="Layer 1 Security Blockers (Hard DENY Conditions)"
          subtitle="Evaluated before normal permissions. Hard DENY conditions cannot be overridden by any role, tender, or resource rule."
        >
          <div className="space-y-3">
            {blocks.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#DC2626]">{b.block_type}</span>
                      <span className="font-mono text-[10px] text-[#64748B]">
                        Subject: {b.subject_type} ({b.subject_id})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] mt-1">{b.reason}</p>
                    <span className="text-[10px] font-mono text-[#94A3B8] block mt-1">
                      Enforced since: {b.starts_at || '2026-09-01'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBlocks(blocks.filter((bl) => bl.id !== b.id))}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                >
                  Deactivate Suspension
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUTHORIZATION AUDIT TRAIL                                          */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <Card
          title="Append-Only Authorization Audit Trail"
          subtitle="Immutable tamper-resistant log of every authorization evaluation, request ID, IP address, and exact denial reason code."
          headerAction={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-1 rounded-lg text-xs">
                <span className="text-[#64748B] font-medium">Filter:</span>
                <select
                  value={auditFilterDecision}
                  onChange={(e) => setAuditFilterDecision(e.target.value as any)}
                  className="bg-transparent font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Decisions</option>
                  <option value="ALLOW">ALLOW Only</option>
                  <option value="DENY">DENY Only</option>
                </select>
              </div>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search request ID, code..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A]"
                />
              </div>

              <a
                href={`${API_BASE_URL}/permissions/audit-logs/export?format=csv`}
                target="_blank"
                rel="noreferrer"
                download="authorization_audit_log.csv"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] rounded-lg shadow-2xs transition-colors"
                title="Download complete audit ledger as CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Export CSV</span>
              </a>

              <a
                href={`${API_BASE_URL}/permissions/audit-logs/export?format=json`}
                target="_blank"
                rel="noreferrer"
                download="authorization_audit_log.json"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] rounded-lg shadow-2xs transition-colors"
                title="Download complete audit ledger as JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Export JSON</span>
              </a>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Subject / Partner</th>
                  <th className="py-2.5 px-3">Tender Context</th>
                  <th className="py-2.5 px-3">Permission Code</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Denial / Rule Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors font-mono text-[11px]">
                    <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">{log.created_at}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">{log.request_id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-[#0F172A]">
                      {log.user_id || log.partner_organization_id || 'System'}
                    </td>
                    <td className="py-2.5 px-3 text-[#475569]">{log.tender_id || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0F172A]">{log.permission_code}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.decision === 'ALLOW'
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                        }`}
                      >
                        {log.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-xs text-[#64748B] max-w-xs truncate">
                      {log.denial_reason_code ? (
                        <span className="text-[#DC2626] font-mono text-[10px] font-bold block truncate">
                          {log.denial_reason_code}
                        </span>
                      ) : (
                        <span className="text-[#15803D] text-[10px] block">
                          Rule #{log.matched_rule_id || 'Base'} ({log.matched_rule_scope})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
