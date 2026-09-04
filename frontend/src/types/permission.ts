export interface PermissionItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  action: string;
}

export interface PartnerAssignment {
  tender_id: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED' | 'EXPIRED';
  partner_type: string;
  start_date?: string;
  end_date?: string;
}

export interface PartnerOrganization {
  id: string;
  name: string;
  partner_type: 'JV_PARTNER' | 'CONSORTIUM_PARTNER' | 'SUBCONTRACTOR' | 'CONSULTANT' | 'OTHER';
  country?: string;
  contact_email?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED' | 'EXPIRED';
  notes?: string;
  assignments: PartnerAssignment[];
  ceilings_count?: number;
}

export interface PermissionRule {
  id: number;
  subject_type: 'USER' | 'ROLE' | 'ORGANIZATION' | 'PARTNER_ORGANIZATION';
  subject_id: string;
  permission_code: string;
  effect: 'ALLOW' | 'DENY';
  scope_type: 'RESOURCE' | 'TENDER' | 'ORGANIZATION' | 'ROLE';
  scope_id?: string;
  expires_at?: string;
}

export interface AccessBlock {
  id: number;
  subject_type: 'USER' | 'ORGANIZATION' | 'TENDER';
  subject_id: string;
  block_type: string;
  reason: string;
  starts_at?: string;
  is_active: boolean;
}

export interface DiagnosticStep {
  name: string;
  passed: boolean;
  status: 'PASS' | 'FAIL';
  detail: string;
}

export interface DiagnosticResult {
  request_id: string;
  allowed: boolean;
  verdict: 'ALLOW' | 'DENY';
  permission_code: string;
  denial_reason_code?: string;
  denial_message?: string;
  matched_rule_id?: number;
  matched_rule_scope?: string;
  steps: DiagnosticStep[];
}

export interface AuthorizationAuditLog {
  id: number;
  uuid: string;
  request_id: string;
  user_id?: string;
  partner_organization_id?: string;
  tender_id?: string;
  resource_type?: string;
  resource_id?: string;
  permission_code: string;
  action: string;
  decision: 'ALLOW' | 'DENY';
  denial_reason_code?: string;
  denial_message?: string;
  matched_rule_id?: number;
  matched_rule_scope?: string;
  matched_rule_effect?: string;
  ip_address?: string;
  created_at: string;
}

