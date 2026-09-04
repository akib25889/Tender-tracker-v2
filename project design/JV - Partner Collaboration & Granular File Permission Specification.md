# JV / Partner Collaboration & Granular File Permission Specification

## 1. Purpose

This section defines the complete authorization, JV/partner collaboration, file-sharing, document access, permission inheritance, denial handling, and audit architecture for the Tender Tracker system.

The system must support internal NYK Advance users as well as external:

- JV partners
- Consortium partners
- Subcontractors
- External consultants
- Other authorized external organizations

The primary requirement is:

> A partner must only be able to see, edit, upload, download, share, or perform other actions on information and functionality that NYK Advance has explicitly authorized.

Partner access must never be broader than the permissions explicitly granted to that partner.

---

# 2. Core Authorization Principle

Authorization consists of three separate mechanisms:

```text
LAYER 1
SECURITY BLOCKERS
        ↓
LAYER 2
ACCESS BOUNDARIES
        ↓
PARTNER PERMISSION CEILING
        ↓
LAYER 3
PERMISSION RESOLUTION
        ↓
DEFAULT DENY
```

These mechanisms must not be implemented as one simple permission-priority list.

---

# 3. Layer 1 — Security Blockers

Security blockers are hard DENY conditions.

They are evaluated before normal permissions.

Examples:

```text
USER_SUSPENDED
USER_DISABLED
USER_INACTIVE

ORGANIZATION_SUSPENDED
ORGANIZATION_DISABLED

PARTNER_REMOVED
PARTNER_INACTIVE

TENDER_ACCESS_REVOKED
TENDER_ARCHIVED
TENDER_CLOSED

SESSION_INVALID
TOKEN_EXPIRED

ACCESS_EXPIRED
```

A security blocker cannot be overridden by any:

- Role permission
- Organization permission
- Tender permission
- Resource permission
- Direct user permission

Example:

```text
Role:

Bid Manager

document.view:

ALLOW
```

but:

```text
User:

SUSPENDED
```

Final:

```text
DENY
```

---

# 4. Layer 2 — Access Boundaries

Access boundaries determine whether a user is eligible to enter the requested context.

Examples:

```text
Organization membership
Tender membership
JV assignment
Partner assignment
Resource sharing
Partner active status
```

A permission cannot create access outside an authorized boundary.

Example:

```text
Partner ABC

NOT ASSIGNED

to Tender #1001
```

Even if:

```text
document.view = ALLOW
```

the result is:

```text
DENY
```

because the partner does not have access to the tender.

---

# 5. JV / Partner Organization Model

The system must treat an external partner as an organization rather than simply as another user.

Example:

```text
Tender #1001
    │
    ├── NYK Advance
    │
    ├── ABC Technologies
    │
    └── XYZ Consulting
```

Each organization can have multiple users.

Example:

```text
ABC Technologies
    │
    ├── Rahim
    ├── Karim
    └── Salma
```

The partner organization is assigned to the tender first.

Individual partner users are then granted access within the partner organization's permitted boundary.

---

# 6. JV Assignment

Recommended entity:

```text
tender_partner_organizations
```

Fields:

```text
id
tender_id
organization_id
partner_type
status
assigned_at
assigned_by
start_date
end_date
notes
created_at
updated_at
```

Possible `partner_type` values:

```text
JV_PARTNER
CONSORTIUM_PARTNER
SUBCONTRACTOR
CONSULTANT
OTHER
```

Possible statuses:

```text
ACTIVE
SUSPENDED
REMOVED
EXPIRED
```

If the partner assignment is not ACTIVE:

```text
Partner Access = DENY
```

---

# 7. Partner Permission Ceiling

The partner permission ceiling defines the maximum permissions that an external organization can ever receive.

It is an **access boundary**, not a normal permission scope.

Example:

```text
ABC Technologies
```

Maximum allowed:

```text
tender.view
task.view
task.edit
document.view
document.upload
document.download
```

Maximum not allowed:

```text
financial.view
financial.edit
submission.submit
permission.manage
partner.manage
```

Even if an administrator accidentally grants:

```text
financial.view = ALLOW
```

through a normal user or role permission, the ceiling prevents access.

Final result:

```text
DENY
```

---

# 8. Partner Ceiling Formula

Actual partner access is:

```text
ACTUAL ACCESS
=
PARTNER CEILING
∩
GRANTED PERMISSIONS
```

Example:

Partner ceiling:

```text
document.view
document.upload
task.edit
```

User permissions:

```text
document.view
document.upload
document.delete
task.edit
```

Effective permissions:

```text
document.view
document.upload
task.edit
```

Not available:

```text
document.delete
```

---

# 9. Permission Subjects

The system must distinguish **who receives a permission** from **where the permission applies**.

Permission subjects can be:

```text
USER
ROLE
ORGANIZATION
PARTNER_ORGANIZATION
```

Example:

```text
Subject:

User #45
```

or:

```text
Subject:

Role = Bid Manager
```

or:

```text
Subject:

Partner Organization = ABC Technologies
```

---

# 10. Permission Scopes

Permission scope defines where the permission applies.

Supported scopes:

```text
RESOURCE
TENDER
ORGANIZATION
ROLE
```

The system must not confuse:

```text
SUBJECT
```

with:

```text
SCOPE
```

Example:

```text
Subject:

User #45

Scope:

Tender #1001

Permission:

document.upload

Effect:

ALLOW
```

---

# 11. Permission Scope Priority

After security and access-boundary checks pass:

```text
1. RESOURCE
        ↓
2. TENDER
        ↓
3. ORGANIZATION
        ↓
4. ROLE
        ↓
5. DEFAULT DENY
```

The more specific scope takes precedence over a broader scope.

---

# 12. Scope Conflict Rules

## Different scopes

Example:

```text
ROLE:

document.upload = DENY
```

and:

```text
TENDER:

document.upload = ALLOW
```

Result:

```text
ALLOW
```

because Tender is more specific than Role.

---

## Same scope

Example:

```text
TENDER:

document.upload = ALLOW
```

and:

```text
TENDER:

document.upload = DENY
```

Result:

```text
DENY
```

Rule:

> Within the same scope, DENY overrides ALLOW.

---

# 13. Specific DENY vs Broad ALLOW

Example:

```text
ROLE:

document.view = ALLOW
```

but:

```text
RESOURCE:

Document #500

document.view = DENY
```

Result:

```text
DENY
```

The resource restriction is more specific.

---

# 14. Specific ALLOW vs Broad DENY

Example:

```text
ROLE:

document.upload = DENY
```

but:

```text
TENDER:

Tender #1001

document.upload = ALLOW
```

Result:

```text
ALLOW
```

The tender-specific rule overrides the broader role rule.

---

# 15. Same-Scope Source Conflict

A user can receive permissions from multiple sources.

Example:

```text
Role A:

document.upload = ALLOW
```

Role B:

```text
document.upload = DENY
```

Both are:

```text
ROLE SCOPE
```

Therefore:

```text
DENY
```

No role should automatically outrank another role.

---

# 16. Resource/File Permission Model

Every file/document must have its own authorization context.

Examples:

```text
Tender Notice.pdf
Technical Proposal.docx
Financial Proposal.xlsx
Company Certificate.pdf
CV - Project Manager.pdf
BOQ.xlsx
Architecture Diagram.pdf
```

The system must be able to control access to an individual resource.

Possible actions:

```text
VIEW
PREVIEW
DOWNLOAD
UPLOAD
EDIT
DELETE
SHARE
UNSHARE
REPLACE
VERSION
EXPORT
```

---

# 17. File Categories

Recommended categories:

```text
SOURCE_DOCUMENT
TENDER_ANALYSIS
TECHNICAL_PROPOSAL
FINANCIAL_PROPOSAL
LEGAL_DOCUMENT
TEAM_CV
SUPPORTING_DOCUMENT
REVIEW_DOCUMENT
SUBMISSION_DOCUMENT
OTHER
```

Financial documents should be capable of having stricter default access.

For example:

```text
Financial Proposal
```

may be:

```text
Internal Only
```

unless specifically shared.

---

# 18. Default File Access

Sensitive files should follow:

```text
DEFAULT DENY
```

especially:

```text
Financial Proposal
Pricing
Commercial Documents
Internal Management Documents
Confidential Analysis
Internal Evaluation
```

The system must not assume that tender membership automatically grants access to every document.

---

# 19. Partner File Sharing

A partner must only access a file when the file has been explicitly shared or the permission model explicitly grants access within the partner's authorized boundary.

Example:

```text
Tender #1001

Document:

Technical Architecture.pdf

Shared with:

ABC Technologies
```

ABC can access it only if:

```text
Partner Assignment = ACTIVE

AND

Partner Ceiling allows the requested action

AND

Effective Permission allows the requested action
```

---

# 20. File Sharing Must Support Action-Level Control

Sharing a document must not mean automatically granting all actions.

Example:

```text
Share:

Technical Proposal.pdf
```

Permissions:

```text
VIEW       ALLOW
PREVIEW    ALLOW
DOWNLOAD   DENY
EDIT       DENY
DELETE     DENY
RESHARE    DENY
```

Therefore the partner can inspect the document but cannot download, modify, delete, or reshare it.

---

# 21. File Share Record

Recommended table:

```text
resource_shares
```

Fields:

```text
id
resource_type
resource_id
tender_id
shared_with_organization_id
shared_with_user_id
permission_code
effect
shared_by
shared_at
expires_at
status
notes
created_at
updated_at
```

Possible status:

```text
ACTIVE
EXPIRED
REVOKED
```

The system should support sharing with:

```text
Partner Organization
```

and, where necessary:

```text
Specific Partner User
```

---

# 22. Partner Resource Isolation

A partner must not be able to discover resources that have not been shared with them.

For example:

```text
Tender #1001
```

contains:

```text
Financial Proposal.xlsx
Technical Proposal.docx
Company Profile.pdf
Architecture.pdf
```

Partner is only shared:

```text
Technical Proposal.docx
Architecture.pdf
```

The partner's interface should show only:

```text
Technical Proposal.docx
Architecture.pdf
```

The partner should not receive:

```text
Financial Proposal.xlsx
Company Profile.pdf
```

unless explicitly authorized.

---

# 23. Information Leakage Protection

When an unauthorized partner requests an unshared resource, the system should preferably return:

```text
404 Not Found
```

where appropriate.

This prevents the partner from learning that a hidden resource exists.

Internally, the system should record the real reason:

```text
PARTNER_RESOURCE_NOT_SHARED
```

The user-facing response should remain generic.

Example:

```text
You do not have permission to access this resource.
```

Do not expose:

```text
Internal permission rules
Permission IDs
Other users' access
Hidden document names
Admin notes
Partner restrictions
```

---

# 24. Partner File Editing

If the partner has:

```text
document.edit
```

the system must still verify:

```text
Partner Assignment = ACTIVE

Partner Ceiling allows document.edit

Resource is shared

Resource permission allows document.edit

File is not locked

File is not archived
```

Only then:

```text
EDIT = ALLOW
```

---

# 25. Partner Upload

Partners may be allowed to upload files without being allowed to edit existing files.

Example:

```text
document.upload = ALLOW
document.edit = DENY
```

This means:

```text
Partner can add new files

but cannot modify existing files.
```

Uploads must inherit the correct:

```text
Tender
Organization
Partner
Resource Category
Uploader
Permission Context
```

---

# 26. Partner Download

Download must be an independent permission.

Example:

```text
document.view = ALLOW
document.download = DENY
```

Result:

```text
Partner can view/preview

but cannot download.
```

The API must check `document.download` separately.

---

# 27. Partner Resharing

Partners should not automatically be allowed to share files with other users.

A separate permission is required:

```text
document.share
```

Example:

```text
document.view = ALLOW
document.download = ALLOW
document.share = DENY
```

The partner can use the file but cannot redistribute it.

---

# 28. Permission Expiration

Permissions and shares may have:

```text
expires_at
```

When:

```text
current_time > expires_at
```

the permission is no longer valid.

Result:

```text
DENY
```

Internal denial reason:

```text
PERMISSION_EXPIRED
```

or:

```text
PARTNER_ACCESS_EXPIRED
```

depending on the layer that caused the denial.

---

# 29. Permission Revocation

An administrator must be able to revoke:

```text
Partner assignment
Partner access
File share
User permission
Role permission
Tender access
```

Revocation must take effect immediately or according to the configured policy.

All revocations must be audited.

---

# 30. Permission Database Schema

## permissions

Master list of permission types.

```text
id
code
name
description
module
action
is_active
created_at
```

Examples:

```text
document.view
document.preview
document.download
document.upload
document.edit
document.delete
document.share
document.unshare
```

---

## permission_rules

Actual permission assignments.

```text
id
subject_type
subject_id
permission_id
permission_code
effect
scope_type
scope_id
expires_at
created_by
created_at
updated_at
```

Example:

```text
subject_type = USER
subject_id = 45
permission_code = document.upload
effect = ALLOW
scope_type = TENDER
scope_id = 1001
```

---

## partner_permission_ceilings

```text
id
partner_organization_id
permission_code
allowed
scope_type
scope_id
expires_at
created_by
created_at
updated_at
```

---

## access_blocks

```text
id
subject_type
subject_id
block_type
reason
starts_at
expires_at
created_by
created_at
```

---

## resource_shares

```text
id
resource_type
resource_id
tender_id
shared_with_organization_id
shared_with_user_id
permission_code
effect
shared_by
shared_at
expires_at
status
notes
created_at
updated_at
```

---

# 31. Authorization Evaluation Order

Every protected API operation must follow:

```text
REQUEST
   ↓
AUTHENTICATION
   ↓
SECURITY BLOCKERS
   ↓
ACCESS BOUNDARY
   ↓
PARTNER CEILING
   ↓
RESOURCE PERMISSION
   ↓
TENDER PERMISSION
   ↓
ORGANIZATION PERMISSION
   ↓
ROLE PERMISSION
   ↓
DEFAULT DENY
```

If a layer produces a hard DENY:

```text
STOP
```

Do not continue evaluating lower layers.

---

# 32. Authorization Result

The authorization service should return a structured result.

Example:

```python
AuthorizationResult(
    allowed=False,
    permission_code="document.download",
    denial_reason_code="PARTNER_RESOURCE_NOT_SHARED",
    denial_message="Resource is not shared with the partner.",
    matched_rule_id=None,
    scope_type="RESOURCE",
    scope_id=501
)
```

For an allowed request:

```text
allowed = true
denial_reason_code = null
```

For a denied request:

```text
allowed = false
denial_reason_code = REQUIRED
```

---

# 33. Standard Permission Codes

At minimum:

```text
tender.view
tender.create
tender.edit
tender.delete

task.view
task.create
task.edit
task.delete
task.assign

document.view
document.preview
document.upload
document.edit
document.delete
document.download
document.share
document.unshare

requirement.view
requirement.create
requirement.edit
requirement.delete

analysis.view
analysis.edit

decision.view
decision.create
decision.edit

approval.view
approval.approve
approval.reject

submission.view
submission.create
submission.edit
submission.submit

result.view
result.edit

team.view
team.assign

notification.view
report.view
audit.view

permission.manage

partner.view
partner.assign
partner.remove
partner.permission.manage
partner.share
partner.unshare
partner.access.view
```

---

# 34. Standard Denial Reason Codes

## Authentication

```text
AUTH_REQUIRED
AUTH_INVALID_TOKEN
AUTH_EXPIRED_TOKEN
AUTH_SESSION_REVOKED
```

## Account/security

```text
USER_INACTIVE
USER_SUSPENDED
USER_DISABLED
ORGANIZATION_INACTIVE
ORGANIZATION_SUSPENDED
```

## Tender access

```text
TENDER_ACCESS_REQUIRED
TENDER_ACCESS_REVOKED
TENDER_ARCHIVED
TENDER_CLOSED
TENDER_NOT_ASSIGNED
```

## Partner

```text
PARTNER_NOT_ASSIGNED
PARTNER_INACTIVE
PARTNER_ACCESS_EXPIRED
PARTNER_PERMISSION_CEILING_EXCEEDED
PARTNER_RESOURCE_NOT_SHARED
PARTNER_ACTION_NOT_ALLOWED
```

## Permission

```text
PERMISSION_NOT_FOUND
PERMISSION_DENIED
RESOURCE_PERMISSION_DENIED
TENDER_PERMISSION_DENIED
ORGANIZATION_PERMISSION_DENIED
ROLE_PERMISSION_DENIED
EXPLICIT_PERMISSION_DENIED
PERMISSION_EXPIRED
DEFAULT_DENY
```

## Resource

```text
RESOURCE_NOT_FOUND
RESOURCE_ACCESS_DENIED
RESOURCE_NOT_SHARED
RESOURCE_RESTRICTED
RESOURCE_ARCHIVED
```

## Action-specific

```text
ACTION_VIEW_DENIED
ACTION_CREATE_DENIED
ACTION_EDIT_DENIED
ACTION_DELETE_DENIED
ACTION_UPLOAD_DENIED
ACTION_DOWNLOAD_DENIED
ACTION_APPROVE_DENIED
ACTION_SUBMIT_DENIED
ACTION_ASSIGN_DENIED
```

---

# 35. Explicit DENY vs Default DENY

The system must distinguish:

### Explicit DENY

An actual DENY rule matched.

Example:

```text
Tender permission:

document.download = DENY
```

Reason:

```text
EXPLICIT_PERMISSION_DENIED
```

### Default DENY

No applicable ALLOW rule exists.

Reason:

```text
DEFAULT_DENY
```

This distinction is important for administrator troubleshooting.

---

# 36. Authorization Audit Logging

Create a dedicated table:

```text
authorization_audit_logs
```

This must be separate from normal business activity logs.

Fields:

```text
id
uuid

user_id
organization_id
partner_organization_id

tender_id

resource_type
resource_id

permission_code
action

decision

denial_reason_code
denial_message

matched_rule_id
matched_rule_scope
matched_rule_effect

request_method
request_path

ip_address
user_agent

session_id
request_id

source
metadata

created_at
```

---

# 37. Authorization Audit Events

The system should log:

```text
AUTHORIZATION_ALLOWED
AUTHORIZATION_DENIED
```

for protected operations.

At minimum:

```text
VIEW
CREATE
EDIT
DELETE
UPLOAD
DOWNLOAD
PREVIEW
APPROVE
REJECT
ASSIGN
UNASSIGN
SHARE
UNSHARE
SUBMIT
EXPORT
```

---

# 38. Partner Sharing Audit

When an internal user shares a resource:

```text
PARTNER_RESOURCE_SHARED
```

Log:

```text
Who shared it
Partner organization
Tender
Resource
Permission granted
Share expiry
Timestamp
```

When revoked:

```text
PARTNER_RESOURCE_UNSHARED
```

When automatically expired:

```text
PARTNER_RESOURCE_SHARE_EXPIRED
```

---

# 39. Permission Change Audit

Log:

```text
PERMISSION_GRANTED
PERMISSION_REVOKED
PERMISSION_MODIFIED
PERMISSION_EXPIRED

PARTNER_CEILING_CHANGED

PARTNER_ACCESS_GRANTED
PARTNER_ACCESS_REVOKED

TENDER_ACCESS_GRANTED
TENDER_ACCESS_REVOKED
```

---

# 40. JV Assignment Audit

Log:

```text
PARTNER_ASSIGNED
PARTNER_REMOVED
PARTNER_SUSPENDED
PARTNER_REACTIVATED
```

The audit should identify:

```text
Tender
Partner organization
Actor
Previous state
New state
Timestamp
Reason
```

---

# 41. Audit Immutability

Authorization audit logs must be append-only.

Normal users:

```text
CANNOT EDIT
CANNOT DELETE
```

Administrators should also not directly modify historical authorization decisions.

If legal or operational requirements ever require deletion:

```text
Deletion itself must be audited.
```

---

# 42. Request Correlation

Every API request should receive a unique:

```text
request_id
```

Example:

```text
REQ-2026-09-04-00001284
```

The same request ID should be available in:

```text
Application logs
Authorization audit logs
Error logs
API response headers
```

This allows administrators to trace a permission problem across the system.

---

# 43. HTTP Authorization Behavior

Use:

```text
401 Unauthorized
```

when authentication is missing or invalid.

Use:

```text
403 Forbidden
```

when the authenticated user is not authorized.

For protected resources that should not reveal their existence:

```text
404 Not Found
```

may be returned.

Example:

```text
Partner requests hidden financial proposal.

API:

404
```

Internal audit:

```text
decision = DENY
reason = PARTNER_RESOURCE_NOT_SHARED
```

---

# 44. User-Facing Denial Messages

Internal denial information may be detailed.

User-facing messages should remain generic.

Example internal:

```text
PARTNER_PERMISSION_CEILING_EXCEEDED
```

User sees:

```text
You do not have permission to perform this action.
```

Do not reveal:

```text
Permission IDs
Hidden rules
Partner ceiling configuration
Other users
Hidden resources
Internal security notes
```

---

# 45. Permission Troubleshooting View

Administrators should have a permission diagnostic screen.

Example:

```text
Authorization Check

User:
Rahim

Organization:
ABC Technologies

Tender:
Tender #1001

Resource:
Financial Proposal.xlsx

Requested Action:
DOWNLOAD
```

Result:

```text
Security:              ✓ PASS

Tender Access:         ✓ PASS

Partner Ceiling:       ✗ FAIL

Final Decision:        DENY

Reason:
PARTNER_PERMISSION_CEILING_EXCEEDED
```

The administrator may also view:

```text
Security Check       ✓ PASS
Tender Access        ✓ PASS
Partner Ceiling      ✗ FAIL
Resource Permission NOT EVALUATED
Tender Permission    NOT EVALUATED
Organization         NOT EVALUATED
Role Permission      NOT EVALUATED
Final                 DENY
```

This makes authorization problems easy to diagnose.

---

# 46. Partner Permission Management UI

Administrators should be able to manage:

```text
Partner Organization
    ↓
Tender Assignment
    ↓
Partner Ceiling
    ↓
Partner Users
    ↓
User Permissions
    ↓
Shared Resources
```

Example UI:

```text
ABC Technologies

Tender:
ERP Implementation 2026

Status:
ACTIVE

Maximum Permissions:

☑ tender.view
☑ task.view
☑ task.edit
☑ document.view
☑ document.upload
☐ document.delete
☐ financial.view
☐ financial.edit
☐ submission.submit
```

---

# 47. File Sharing UI

When sharing a file:

```text
Document:
Technical Proposal.pdf
```

Select:

```text
Share With:

ABC Technologies
```

Then choose:

```text
☑ View
☑ Preview
☑ Download
☐ Edit
☐ Delete
☐ Reshare
```

Optional:

```text
Expiration:
30 September 2026
```

The system must show the effective access before confirmation.

---

# 48. Effective Permission Preview

Before an administrator grants access, the system should be able to calculate:

```text
Current Access
+
New Permission
+
Partner Ceiling
+
Existing Restrictions
=
Effective Access
```

Example:

```text
Partner Ceiling:

document.view
document.download

Requested:

document.edit
```

Result:

```text
document.edit

NOT AVAILABLE
```

The UI should explain:

```text
This permission exceeds the partner's maximum allowed access.
```

---

# 49. Partner User Isolation

A partner user must not automatically inherit the permissions of:

```text
NYK Advance employees
```

or:

```text
Other partner organizations
```

A partner user only receives access through:

```text
Partner Organization Assignment
+
Partner Ceiling
+
Applicable User/Role Permissions
+
Resource Sharing
```

---

# 50. Cross-Partner Isolation

Example:

```text
Tender #1001

NYK Advance
ABC Technologies
XYZ Consulting
```

ABC must not automatically see:

```text
XYZ documents
XYZ tasks
XYZ internal notes
XYZ permissions
```

unless specifically authorized.

Partner organizations must be isolated from each other by default.

---

# 51. Internal vs External Data

The system should support data visibility levels:

```text
INTERNAL
PARTNER_SHARED
RESTRICTED
CONFIDENTIAL
FINANCIAL
```

Suggested default behavior:

```text
INTERNAL
→ NYK users only

PARTNER_SHARED
→ authorized partner only

RESTRICTED
→ explicitly authorized users

CONFIDENTIAL
→ explicitly authorized users

FINANCIAL
→ tightly restricted
```

These labels are additional controls and do not replace authorization checks.

---

# 52. No Client-Side-Only Security

The frontend must never be considered the final authorization layer.

Hiding a button is not sufficient.

Example:

```text
Frontend hides DOWNLOAD button
```

but the user directly calls:

```text
GET /api/v1/documents/500/download
```

The backend must still perform the complete authorization check.

Every protected API endpoint must enforce authorization server-side.

---

# 53. File API Requirements

Recommended endpoints:

```text
GET    /api/v1/documents
POST   /api/v1/documents/upload

GET    /api/v1/documents/{id}
PATCH  /api/v1/documents/{id}
DELETE /api/v1/documents/{id}

GET    /api/v1/documents/{id}/preview
GET    /api/v1/documents/{id}/download

GET    /api/v1/documents/{id}/versions
POST   /api/v1/documents/{id}/versions

POST   /api/v1/documents/{id}/share
POST   /api/v1/documents/{id}/unshare

GET    /api/v1/documents/{id}/shares
```

Every endpoint must map to an explicit permission code.

---

# 54. API Permission Mapping

Example:

```text
GET /documents/{id}

→ document.view
```

```text
GET /documents/{id}/preview

→ document.preview
```

```text
GET /documents/{id}/download

→ document.download
```

```text
POST /documents/upload

→ document.upload
```

```text
PATCH /documents/{id}

→ document.edit
```

```text
DELETE /documents/{id}

→ document.delete
```

```text
POST /documents/{id}/share

→ document.share
```

```text
POST /documents/{id}/unshare

→ document.unshare
```

The backend must not rely only on route names or frontend state.

---

# 55. Central Authorization Service

Authorization logic must be centralized.

Do not implement different permission rules independently in:

```text
Documents API
Tasks API
Tender API
Partner API
Submission API
```

Instead:

```text
API Router
      ↓
Authorization Service
      ↓
Security Checks
      ↓
Access Boundary
      ↓
Partner Ceiling
      ↓
Permission Resolver
      ↓
ALLOW / DENY
```

This prevents inconsistent security behavior.

---

# 56. Recommended Authorization Interface

Conceptually:

```python
authorize(
    user=user,
    permission="document.download",
    tender_id=1001,
    resource_type="DOCUMENT",
    resource_id=500
)
```

Returns:

```python
AuthorizationResult
```

The service must be reusable by every protected module.

---

# 57. Automated Authorization Tests

The coding agent must implement automated tests for at least the following.

### Test 1

```text
Role ALLOW
Tender DENY
```

Expected:

```text
DENY
```

### Test 2

```text
Role DENY
Tender ALLOW
```

Expected:

```text
ALLOW
```

### Test 3

```text
Tender ALLOW
Resource DENY
```

Expected:

```text
DENY
```

### Test 4

```text
Role ALLOW
Resource ALLOW
```

Expected:

```text
ALLOW
```

### Test 5

```text
No Permission
```

Expected:

```text
DENY
```

### Test 6

```text
Partner Ceiling DENY
Resource ALLOW
```

Expected:

```text
DENY
```

### Test 7

```text
Partner not assigned to tender
Role ALLOW
```

Expected:

```text
DENY
```

### Test 8

```text
Same Scope:

ALLOW + DENY
```

Expected:

```text
DENY
```

### Test 9

```text
Permission expired
```

Expected:

```text
DENY
```

### Test 10

```text
User suspended
```

Expected:

```text
DENY
```

### Test 11

```text
Partner shared document
View ALLOW
Download DENY
```

Expected:

```text
VIEW = ALLOW
DOWNLOAD = DENY
```

### Test 12

```text
Partner shared document
Download ALLOW
Share DENY
```

Expected:

```text
DOWNLOAD = ALLOW
RESHARE = DENY
```

### Test 13

```text
ABC partner

attempts to access

XYZ partner's unshared file
```

Expected:

```text
DENY
```

### Test 14

```text
Partner removed from tender

existing file permission = ALLOW
```

Expected:

```text
DENY
```

### Test 15

```text
Partner ceiling allows view
User permission allows download
```

If ceiling does not allow download:

```text
DENY
```

---

# 58. Security Acceptance Criteria

The implementation is not complete until all of the following are true:

```text
✓ Partner organizations can be assigned to individual tenders.

✓ Partner users can be assigned within their organization.

✓ Partner access can be revoked.

✓ Partner permissions can expire.

✓ Partner permission ceilings can be configured.

✓ Partners cannot exceed their permission ceiling.

✓ Partners cannot access unshared resources.

✓ Individual files can have independent permissions.

✓ View, preview, download, upload, edit, delete and share
  can be controlled independently.

✓ Resource permissions override broader permissions.

✓ Tender permissions override organization and role permissions.

✓ Organization permissions override role permissions.

✓ Same-scope DENY overrides ALLOW.

✓ Security blockers cannot be overridden.

✓ Tender access boundaries cannot be bypassed.

✓ Partner organizations cannot see each other's private data.

✓ Backend authorization is enforced independently of the frontend.

✓ Every protected authorization decision can be audited.

✓ Denial reasons are recorded internally.

✓ Explicit DENY and DEFAULT DENY are distinguishable.

✓ Permission changes are audited.

✓ File sharing and unsharing are audited.

✓ Authorization logs are append-only.

✓ Request IDs allow security events to be traced.

✓ Automated authorization tests cover conflict cases.
```

---

# 59. Final Authorization Model

The complete model is:

```text
                         USER REQUEST
                              │
                              ↓
                    ┌──────────────────┐
                    │ AUTHENTICATION   │
                    └────────┬─────────┘
                             │
                       FAILED? ──YES──→ DENY
                             │
                             ↓
                    ┌──────────────────┐
                    │ SECURITY         │
                    │ BLOCKERS         │
                    └────────┬─────────┘
                             │
                       BLOCKED? ─YES──→ DENY
                             │
                             ↓
                    ┌──────────────────┐
                    │ ACCESS           │
                    │ BOUNDARY         │
                    └────────┬─────────┘
                             │
                       FAILED? ─YES──→ DENY
                             │
                             ↓
                    ┌──────────────────┐
                    │ PARTNER CEILING  │
                    └────────┬─────────┘
                             │
                       EXCEEDED? ─YES→ DENY
                             │
                             ↓
                    ┌──────────────────┐
                    │ RESOURCE SCOPE  │
                    └────────┬─────────┘
                             │
                         MATCH?
                       YES ↓   ↓ NO
                         RESOLVE
                             │
                             ↓
                    ┌──────────────────┐
                    │ TENDER SCOPE    │
                    └────────┬─────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │ ORGANIZATION     │
                    │ SCOPE            │
                    └────────┬─────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │ ROLE SCOPE      │
                    └────────┬─────────┘
                             │
                             ↓
                    ┌──────────────────┐
                    │ DEFAULT DENY    │
                    └──────────────────┘
```

---

# 60. Final Rule

The coding agent must implement this exact principle:

> **A user must first pass authentication, security blockers, and access boundaries. External partners must additionally remain within their partner permission ceiling. Only then are normal permissions evaluated, from the most specific resource scope to the broader tender, organization, and role scopes. A more specific permission overrides a broader permission. Within the same scope, DENY overrides ALLOW. If no applicable ALLOW exists, access is denied.**

Therefore:

```text
SECURITY BLOCKER
      ↓
      HARD DENY

ACCESS BOUNDARY
      ↓
      HARD DENY

PARTNER CEILING
      ↓
      HARD DENY

RESOURCE
      ↓
TENDER
      ↓
ORGANIZATION
      ↓
ROLE
      ↓
DEFAULT DENY
```

No normal permission may bypass:

```text
Security
Access Boundary
Partner Ceiling
```

And no partner may access, modify, download, upload, delete, or share a file unless the requested action is explicitly authorized.