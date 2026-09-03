# Tender Tracker Dashboard – Web Design & Feature Specification

**Version:** 2.0  
**System:** Tender Lifecycle Management System  
**Frontend:** React + Vite + Tailwind CSS  
**Backend:** FastAPI  
**Database:** MySQL  
**File Storage:** Local Server Storage  
**Target Users:** 3–8 internal users  

---

# 1. Project Overview

The Tender Tracker Dashboard is a centralized web application for managing the complete lifecycle of a tender.

The system should help a company track every tender from the moment it is discovered or automatically scanned until it is submitted, awarded, lost, declined, cancelled, or archived.

The application should function as a **Tender Command Center**, not simply as a database for storing tender information.

## Main Objectives

The system should provide a clear answer to:

- What tenders are currently active?
- What stage is each tender in?
- Which tenders require immediate attention?
- Who is responsible for each task?
- What documents are missing?
- What requirements are incomplete?
- What deadlines are approaching?
- Has the tender passed Go/No-Go?
- Is the tender ready for submission?
- What approvals are pending?
- What tenders have been submitted?
- Why was a tender declined?
- Why was a tender lost?
- What is the current tender pipeline?
- What is the expected tender value?
- What is the company's win rate?

---

# 2. System Architecture Context

The dashboard is the frontend of the following architecture:

```text
Users
   ↓
React + Vite + Tailwind
   ↓ REST API
FastAPI Backend
   ↓
MySQL
   ↓
Local Server Storage
```

The frontend must communicate with the backend through REST APIs.

The frontend must **not directly access MySQL or the filesystem**.

---

# 3. Tender Scanner Integration

The Tender Tracker should be designed to receive tenders from the future/parallel **Tender Scanner** module.

## Tender Scanner Flow

```text
Tender Sources
      ↓
Tender Scanner
      ↓
Source Collection
      ↓
Duplicate Detection
      ↓
Initial Tender Record
      ↓
Tender Tracker
      ↓
Screening
      ↓
Analysis
      ↓
Go / No-Go
```

## Scanner-Generated Tender

A scanned tender may initially contain:

- Title
- Organization
- Country
- Reference number
- Tender type
- Category
- Source URL
- Publication date
- Deadline
- Source
- Original notice/document
- Scanner timestamp

The user should be able to open the scanned tender and complete/edit the remaining information.

## Scanner Status

A tender imported from the scanner should be identifiable as:

```text
Source:
[ Tender Scanner ]

Scanner Confidence:
[ 92% ]

Imported:
03 September 2026
```

The user must always be able to manually correct scanner-generated information.

---

# 4. Tender Lifecycle

The tender lifecycle should be:

```text
DISCOVERED
    ↓
SCREENING
    ↓
UNDER ANALYSIS
    ↓
DECISION PENDING
    ↓
PREPARATION
    ↓
INTERNAL REVIEW
    ↓
REVISION REQUIRED
    ↓
APPROVED
    ↓
READY FOR SUBMISSION
    ↓
SUBMITTED
    ↓
UNDER EVALUATION
    ↓
AWARDED / LOST
```

Alternative terminal paths:

```text
DECISION PENDING
       ↓
   DECLINED
```

```text
Any Active Stage
       ↓
   CANCELLED
```

```text
Completed Tender
       ↓
   ARCHIVED
```

---

# 5. Important: Status vs Go/No-Go Decision

The system must keep **Tender Status** and **Go/No-Go Decision** as separate fields.

## Tender Status

Examples:

```text
Discovered
Screening
Under Analysis
Decision Pending
Preparation
Internal Review
Revision Required
Approved
Ready for Submission
Submitted
Under Evaluation
Awarded
Lost
Declined
Cancelled
Archived
```

## Go/No-Go Decision

Separate field:

```text
Pending
Go
No-Go
```

This prevents the incorrect design where "GO" becomes a tender lifecycle status.

Example:

```text
Status:
Preparation

Go/No-Go:
GO
```

---

# 6. Main Dashboard

The dashboard is the first screen after login.

## Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo │ Global Search │ Notifications │ User Profile          │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ Dashboard    │ Dashboard                                    │
│              │                                               │
│ My Tasks     │ KPI Cards                                    │
│              │                                               │
│ Tenders      │ Tender Pipeline                              │
│              │                                               │
│ Calendar     │ Tenders Requiring Attention                  │
│              │                                               │
│ Documents    │ Upcoming Deadlines                            │
│              │                                               │
│ Team         │ My Tasks                                     │
│              │                                               │
│ Reports      │ Recent Activity                              │
│              │                                               │
│ Settings     │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

---

# 7. Dashboard Summary Cards

The dashboard should display the most important KPIs.

## Recommended Cards

### Active Tenders

```text
24

Active Tenders
↑ 12% this month
```

Clicking the card opens the filtered tender list.

### Due This Week

```text
7

Deadlines This Week
⚠ Requires Attention
```

### Pending Tasks

```text
18

Pending Tasks
```

### Ready for Submission

```text
3

Ready for Submission
```

### Submitted

```text
12

Submitted This Month
```

### Won

```text
4

Awarded
```

Additional optional KPI:

### Pipeline Value

```text
BDT 8.5 Crore

Active Pipeline Value
```

---

# 8. Dashboard KPI Rules

KPIs must be calculated from live database data.

## Active Tenders

Count tenders that are not:

```text
Awarded
Lost
Declined
Cancelled
Archived
```

## Due This Week

Count active tenders whose submission deadline falls within the next 7 calendar days.

## Pending Tasks

Count tasks that are:

```text
To Do
In Progress
Review
```

and not completed/cancelled.

## Ready for Submission

Count tenders whose:

- Status = Ready for Submission
- Required documents are complete
- Required reviews are approved
- Mandatory requirements are satisfied
- No blocking task remains

## Won

Count tenders with:

```text
Result = Awarded
```

---

# 9. Tender Pipeline

Display tenders by lifecycle stage.

```text
DISCOVERED       12
SCREENING         8
ANALYSIS          6
DECISION PENDING  4
PREPARATION       5
REVIEW             3
READY              2
SUBMITTED          7
EVALUATION         4
```

The pipeline should be interactive.

Clicking a stage should open:

```text
Tender List
with Status = selected stage
```

The pipeline should support both:

- Count view
- Value view

Example:

```text
Preparation

5 Tenders
BDT 3.2 Crore Pipeline Value
```

---

# 10. Tenders Requiring Attention

The dashboard should automatically identify urgent items.

Examples:

```text
🔴 Tender deadline in 2 days
🔴 Financial proposal missing
🟠 Management approval pending
🟠 Requirement verification incomplete
🟡 Task overdue
🟡 Tender analysis not completed
```

Clicking an item should open the relevant tender/task/document.

---

# 11. Tender List Page

The Tender List is the primary working area.

## Recommended Columns

| Column | Description |
|---|---|
| Tender ID | Internal system ID |
| Tender Title | Tender name |
| Organization | Procuring organization |
| Country | Tender country |
| Reference No. | Official reference |
| Category | Software / Hardware / Service / Consultancy |
| Status | Current lifecycle status |
| Go/No-Go | Decision |
| Deadline | Submission deadline |
| Days Left | Remaining time |
| Assigned To | Responsible person |
| Priority | Critical / High / Medium / Low |
| Estimated Value | Contract value |
| Readiness | Submission readiness percentage |

The user should be able to customize visible columns.

---

# 12. Search and Filtering

Tender List must support:

- Keyword search
- Tender title
- Reference number
- Organization
- Country
- Category
- Status
- Go/No-Go
- Priority
- Assigned person
- Deadline range
- Tender value range
- Result
- Source
- Tender type

## Search Behavior

Search should support:

```text
Tender title
Reference number
Organization
Tender ID
```

Search should update results without requiring a full page reload.

---

# 13. Sorting

Users should be able to sort by:

- Deadline
- Days remaining
- Tender value
- Priority
- Created date
- Updated date
- Organization
- Status
- Readiness

Default sorting:

```text
Most urgent deadline first
```

---

# 14. Tender Status Display

Use consistent visual status badges.

Suggested semantic colors:

```text
Blue       Discovered / Screening
Purple     Under Analysis
Yellow     Decision Pending
Orange     Preparation / Revision Required
Indigo     Internal Review
Green      Approved / Ready / Submitted / Awarded
Red        Deadline Critical / Lost
Gray       Declined / Cancelled / Archived
```

Colors must not be the only indicator.

Every status must also contain readable text.

---

# 15. Priority System

Priority should be a **manual business priority**, not automatically determined only by deadline.

```text
Critical
High
Medium
Low
```

Deadline urgency should be calculated separately.

## Deadline Urgency

```text
Critical:
0–3 days

High:
4–7 days

Medium:
8–14 days

Normal:
15+ days
```

Example:

```text
Priority:
Medium

Deadline:
2 Days

Deadline Urgency:
Critical
```

This gives management better control.

---

# 16. Tender Detail Workspace

Every tender should have a dedicated workspace.

## Header

```text
Tender Title

Reference: RFP-2026-001
Organization: UNDP
Country: Bangladesh

Deadline:
10 September 2026 – 15:00

⏰ 7 Days Remaining

Status:
[Preparation]

Go/No-Go:
[GO]

Priority:
[HIGH]

[Edit]
[Add Task]
[Upload Document]
```

---

# 17. Tender Detail Navigation

Use tabs:

```text
Overview
Analysis
Requirements
Tasks
Documents
Team
Financial
Review
Submission
Result
Activity
```

Tabs should preserve tender context.

---

# 18. Tender Overview

Display:

- Tender title
- Internal Tender ID
- Reference number
- Organization
- Country
- Procurement type
- Tender category
- Publication date
- Submission deadline
- Submission method
- Tender portal
- Estimated contract value
- Currency
- Contract duration
- Assigned Bid Manager
- Source
- Created date
- Last updated date

---

# 19. Important Links

Display external links separately:

```text
🔗 Tender Portal
📄 Tender Notice
📄 RFP / Tender Document
📄 TOR
📄 BOQ
📄 Addendum
📄 Clarification
```

Links should open in a new browser tab.

---

# 20. Tender Analysis

Tender Analysis is one of the most important sections.

The system should support:

```text
AI Analysis
+
Manual Verification
```

AI-generated information must have a clear state:

```text
AI Extracted
Pending Verification
Verified
Corrected
```

AI output must not automatically be considered verified.

---

# 21. Analysis Categories

## Scope of Work

- Project objective
- Required solution
- Major deliverables
- Implementation scope
- Support/maintenance scope

## Technical Requirements

- Software requirements
- Hardware requirements
- Infrastructure
- Integration
- Security
- Programming technologies
- Database requirements
- Cloud requirements
- Hosting requirements
- Network requirements

## Eligibility

- Company registration
- Country restriction
- Local registration requirements
- Experience
- Similar projects
- Financial capacity
- Turnover
- Certifications
- Legal requirements

## Team Requirements

- Required positions
- Number of experts
- Experience
- Education
- Certifications
- Nationality requirements

## Financial Requirements

- Bid security
- Performance security
- Tender fee
- Turnover
- Payment terms
- Contract value
- Currency

## Delivery Requirements

- Delivery period
- Implementation period
- Warranty
- Maintenance
- Training
- Support requirements

---

# 22. Country / Registration Eligibility

Because eligibility is critical, the system should have a dedicated field:

```text
Country Eligibility

Eligible Countries:
Bangladesh

Registration Requirement:
Local / International / Both

NYK Eligibility:
Eligible / Not Eligible / Requires Verification

Evidence:
Document reference / page number
```

The system should clearly distinguish:

```text
Tender explicitly allows Bangladesh company
```

from:

```text
Eligibility not yet verified
```

---

# 23. Go / No-Go Decision

## Decision Panel

```text
GO / NO-GO DECISION

Technical Fit             ✓
Experience Match          ✓
Eligibility               ✓
Team Availability         ⚠
Financial Capacity        ✓
Deadline Feasibility      ✓

Overall Score:
82%

Decision:
[ GO ] [ NO-GO ] [ PENDING ]
```

The score should be configurable.

The system must retain:

- Decision
- Decision maker
- Decision date
- Score
- Reason
- Supporting notes

---

# 24. Decline Reason Tracking

Every No-Go decision should record a reason.

## Decline Categories

```text
Eligibility
Country Restriction
Insufficient Experience
Insufficient Turnover
Missing Certification
Deadline Too Short
Team Unavailable
Budget Too Low
Technical Mismatch
Requirements Outside Expertise
Documentation Difficulty
Strategic Decision
Client/Contract Conditions
Commercial Risk
Other
```

The system should support:

```text
Primary Reason
+
Secondary Reasons
+
Free-text Explanation
```

This information must be available for analytics.

---

# 25. Requirement Tracker

Every tender should have a structured requirement checklist.

| Requirement | Type | Mandatory | Evidence | Status | Assigned To |
|---|---|---:|---|---|---|
| Trade License | Company | Yes | Trade License | Complete | Admin |
| BASIS Certificate | Company | Yes | BASIS Certificate | Missing | Admin |
| Similar Work Order | Experience | Yes | Work Order | Complete | Business |
| Project Manager CV | Team | Yes | CV | Complete | HR |
| Financial Statement | Financial | Yes | Audit Report | Missing | Finance |

## Requirement Status

```text
Missing
In Progress
Available
Submitted
Verified
Not Applicable
Rejected
```

---

# 26. Requirement Evidence

Each requirement should be linked to evidence where applicable.

Example:

```text
Requirement:
Similar Project Experience

Evidence:
Work Order #WO-2025-018

Document:
[View Document]

Verification:
✓ Verified

Verified By:
Bid Manager
```

A requirement may have multiple evidence documents.

---

# 27. Document Management

Each tender should have its own document workspace.

## Categories

### Company Documents

- Trade License
- Certificate of Incorporation
- MOA
- AOA
- BIN
- Tax Certificate
- VAT Certificate
- BASIS Certificate
- ISO Certificates

### Financial Documents

- Audited Financial Statements
- Bank Statement
- Solvency Certificate
- Turnover Certificate

### Experience Documents

- Work Orders
- Completion Certificates
- Client Certificates
- Project References

### Team Documents

- CVs
- Certifications
- Degrees
- Experience Certificates

### Tender Documents

- Tender Notice
- RFP
- TOR
- BOQ
- Addendum
- Clarification

### Proposal Documents

- Technical Proposal
- Financial Proposal
- Cover Letter
- Forms
- Submission Receipt

---

# 28. Local Server Storage

Documents will be stored on the application's local server.

Example:

```text
/opt/tender-tracker/storage/
```

Tender-specific storage:

```text
storage/
└── tenders/
    └── TDR-2026-0001/
        ├── 01_SOURCE_DOCUMENTS/
        ├── 02_TENDER_ANALYSIS/
        ├── 03_TECHNICAL_PROPOSAL/
        ├── 04_FINANCIAL_PROPOSAL/
        ├── 05_LEGAL_DOCUMENTS/
        ├── 06_TEAM_CVS/
        ├── 07_SUPPORTING_DOCUMENTS/
        ├── 08_REVIEW/
        └── 09_SUBMISSION/
```

The frontend must never access these filesystem paths directly.

Files must be accessed through authenticated API endpoints.

---

# 29. Document Versioning

Documents must support versions.

Example:

```text
Technical Proposal

v1
v2
v3 CURRENT
```

Each version should record:

- Version number
- Uploaded by
- Upload date
- File size
- Checksum
- Change note

Users should be able to download previous versions according to their permissions.

---

# 30. Document Status

```text
Available
Needs Update
Missing
Under Review
Approved
Rejected
Archived
```

---

# 31. Task Management

Every tender should have its own task board.

```text
┌───────────┬──────────────┬─────────────┬───────────┐
│ To Do     │ In Progress  │ Review      │ Completed │
├───────────┼──────────────┼─────────────┼───────────┤
│ Collect   │ Technical    │ Proposal    │ Company   │
│ CVs       │ Proposal     │ Review      │ Profile   │
└───────────┴──────────────┴─────────────┴───────────┘
```

Task board should support drag-and-drop status changes.

---

# 32. Task Information

Each task should include:

- Task name
- Description
- Tender
- Assigned person
- Priority
- Due date
- Status
- Dependencies
- Attachments
- Comments
- Created date
- Completion date

---

# 33. Task Dependencies

Example:

```text
Collect CVs
      ↓
Complete Team Section
      ↓
Technical Proposal
      ↓
Internal Review
```

A blocked task should display:

```text
🔒 Blocked

Waiting for:
Collect CVs
```

---

# 34. Team Assignment

Each tender should have a dedicated team.

Possible roles:

- Bid Manager
- Tender Coordinator
- Technical Lead
- Software Architect
- Business Analyst
- Proposal Writer
- UI/UX Designer
- Finance Officer
- Legal Officer
- HR Officer
- Management Approver

---

# 35. Team Workload

Display team workload.

```text
Team Member: John

Active Tenders: 5

Assigned Tasks:
18

Overdue:
2

Workload:
████████░░ 80%

Availability:
Limited
```

The workload indicator should be based on configurable rules.

---

# 36. Tender Timeline

Display major lifecycle events.

```text
Tender Published
       ✓
       │
Tender Added
       ✓
       │
Analysis
       ✓
       │
Go Decision
       ✓
       │
Preparation
       ● CURRENT
       │
Internal Review
       ○
       │
Submission
       ○
```

The timeline should also show dates.

---

# 37. Deadline Tracking

The system should automatically calculate:

- Days remaining
- Hours remaining when appropriate
- Deadline urgency
- Overdue status

Example:

```text
DEADLINE

10 September 2026
15:00

7 Days Remaining

████████░░
```

The countdown should use the tender's configured timezone.

---

# 38. Deadline Alerts

Default notifications:

```text
14 days before
7 days before
5 days before
3 days before
1 day before
6 hours before
1 hour before
```

Administrators should be able to configure alert rules.

---

# 39. Tender Calendar

Calendar should display:

- Submission deadlines
- Internal deadlines
- Task deadlines
- Clarification deadlines
- Pre-bid meetings
- Review dates
- Approval deadlines
- Submission dates

Calendar views:

```text
Month
Week
Day
Agenda
```

---

# 40. Submission Readiness

Before submission, automatically calculate readiness.

Example:

```text
SUBMISSION READINESS

✓ Technical Proposal
✓ Financial Proposal
✓ Required Forms
✓ Required Documents
✓ Signatures
✓ Bid Security
⚠ Financial Proposal Review Pending

READINESS SCORE

85%

STATUS:

NOT READY FOR SUBMISSION
```

---

# 41. Readiness Calculation

Readiness should be based on configurable weighted components.

Example:

```text
Requirements          25%
Documents             25%
Technical Proposal    20%
Financial Proposal    15%
Review                10%
Approval                5%
```

A tender must not become:

```text
READY FOR SUBMISSION
```

if any mandatory blocking requirement remains incomplete.

---

# 42. Internal Review & Approval

Approval stages:

```text
Technical Review
       ↓
Financial Review
       ↓
Compliance Review
       ↓
Management Approval
       ↓
Ready for Submission
```

Each stage records:

- Reviewer
- Status
- Date
- Comments
- Approval/rejection
- Version reviewed

---

# 43. Approval Status

```text
✓ Approved
⏳ Pending
✕ Rejected
○ Not Started
```

If rejected:

```text
Reason:
Required revision to technical methodology.

Action:
Revision Required
```

---

# 44. Submission Tracking

Record:

- Submission date
- Submission time
- Submitted by
- Submission portal
- Submission method
- Submission reference number
- Receipt
- Confirmation email
- Final submitted documents

---

# 45. Submission Status

```text
Not Submitted
      ↓
Ready for Submission
      ↓
Submitted
      ↓
Confirmation Received
```

---

# 46. Tender Result Tracking

After submission:

```text
Under Evaluation
Shortlisted
Clarification Requested
Presentation Required
Negotiation
Awarded
Lost
Cancelled
```

---

# 47. Win / Loss Analysis

## If Awarded

Record:

- Contract value
- Award date
- Contract duration
- Project start date
- Client
- Winning bid value
- Final contract value

## If Lost

Record:

- Price Too High
- Technical Score Low
- Experience
- Strong Competitor
- Eligibility Issue
- Documentation Issue
- Client Preference
- Deadline/Process Issue
- Unknown
- Other

The system should support both:

```text
Reason Category
+
Detailed Explanation
```

---

# 48. Tender Activity Log

Every important activity should be recorded.

Example:

```text
Today

10:30 AM
Rahim uploaded Technical Proposal

09:45 AM
Akib changed status to Internal Review

Yesterday

04:30 PM
Finance uploaded Financial Statement
```

Activities should include:

- User
- Action
- Tender
- Object/document/task
- Timestamp
- Previous value
- New value where applicable

---

# 49. Notification Center

Notifications:

- New tender assigned
- Task assigned
- Task overdue
- Document missing
- Deadline approaching
- Review pending
- Approval required
- Tender updated
- Clarification published
- Requirement changed
- Tender status changed
- Submission completed

Notification states:

```text
Unread
Read
Archived
```

---

# 50. My Tasks

The sidebar should provide a dedicated **My Tasks** page.

Display:

```text
My Tasks

Due Today
Due This Week
Overdue
In Progress
Waiting for Review
Completed
```

Users should be able to see all tasks assigned to them across every tender.

---

# 51. Reports & Analytics

Management reporting should include:

## Tender Pipeline

```text
Total Opportunities: 120
Active: 24
Submitted: 50
Won: 12
Lost: 28
Declined: 6
```

## Win Rate

```text
Submitted: 50
Won: 12

Win Rate: 24%
```

Win rate calculation should be:

```text
Won ÷ Completed Competitive Submissions × 100
```

The exact definition should be configurable.

---

# 52. Organization Analysis

Example:

```text
UNDP
15 Tenders

World Bank
8 Tenders

Government
45 Tenders
```

Allow filtering by:

- Date range
- Status
- Result
- Category
- Organization

---

# 53. Category Analysis

Possible categories:

```text
Software Development
ERP
AI
Hardware
Consultancy
Cloud
Cybersecurity
Networking
IT Support
Training
Other
```

Categories must be configurable from Settings.

---

# 54. Tender Value Analytics

Dashboard/report should show:

```text
Total Active Pipeline
Submitted Value
Awarded Value
Lost Value
Declined Value
```

Charts should support:

- Monthly pipeline
- Pipeline by category
- Pipeline by organization
- Won vs Lost value
- Average tender value

---

# 55. AI Features

The system should support future AI integration.

## AI Tender Analysis

Automatically extract:

- Tender title
- Organization
- Reference number
- Deadline
- Country
- Eligibility
- Technical requirements
- Financial requirements
- Required documents
- Team requirements
- Delivery requirements
- Security requirements
- Experience requirements

---

# 56. AI Requirement Extraction

AI should convert tender documents into structured requirements:

```text
Tender Document
      ↓
AI Extraction
      ↓
Requirement
      ↓
Required Evidence
      ↓
Responsible Person
      ↓
Verification
      ↓
Status
```

AI-generated requirements must be reviewable and editable.

---

# 57. AI Suitability Score

Example:

```text
TECHNICAL MATCH
90%

EXPERIENCE MATCH
75%

ELIGIBILITY
100%

TEAM AVAILABILITY
80%

OVERALL SCORE
86%
```

The system should display how the score was calculated.

AI score should be treated as a **decision-support indicator**, not an automatic final decision.

---

# 58. AI Analysis Status

For each AI analysis:

```text
Not Started
Processing
Completed
Needs Verification
Verified
Failed
```

Display:

```text
AI Analysis:
✓ Completed

Verification:
⚠ 8 items require review
```

---

# 59. Manual Override

Users with appropriate permissions must be able to correct AI-generated data.

Example:

```text
AI extracted:
Deadline = 10 Sep 2026

User correction:
Deadline = 12 Sep 2026

Reason:
Addendum No. 2
```

The correction must be recorded in the audit log.

---

# 60. Main Sidebar

```text
🏠 Dashboard

📌 My Tasks

📋 Tenders
   ├── All Tenders
   ├── Discovered
   ├── Screening
   ├── Under Analysis
   ├── Preparation
   ├── Due Soon
   ├── Ready for Submission
   ├── Submitted
   └── Completed

📅 Calendar

📁 Documents

👥 Team

📊 Reports

🔔 Notifications

⚙ Settings
```

---

# 61. Tender Command Center

The Tender Command Center is the most important screen inside a tender.

It should provide a complete operational overview.

```text
┌─────────────────────────────────────────────────────┐
│ Tender: ERP Implementation Project                  │
│ Deadline: 7 Days Remaining                          │
│ Status: Preparation                                 │
│ Go/No-Go: GO                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ READINESS                  TASKS                    │
│ 75%                        12 Pending               │
│ ████████░░                 ██████░░░░              │
│                                                     │
├──────────────────────┬──────────────────────────────┤
│ DOCUMENT STATUS      │ TEAM STATUS                  │
│ 18 Complete          │ 6 Members                    │
│ 4 Missing            │ 2 Tasks Overdue              │
├──────────────────────┴──────────────────────────────┤
│                                                     │
│ REQUIREMENTS                                       │
│ 22 Complete | 3 Pending | 1 Missing                │
│                                                     │
├─────────────────────────────────────────────────────┤
│ UPCOMING DEADLINES                                  │
│                                                     │
│ • Technical Proposal - 3 Days                      │
│ • Financial Review - 5 Days                        │
│ • Tender Submission - 7 Days                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ REQUIRES ATTENTION                                  │
│                                                     │
│ 🔴 Financial Statement Missing                     │
│ 🟠 Management Approval Pending                     │
│ 🟡 Project Manager CV Needs Verification           │
└─────────────────────────────────────────────────────┘
```

---

# 62. Quick Actions

The Command Center should provide quick actions:

```text
+ Add Task
+ Upload Document
+ Add Requirement
+ Add Team Member
+ Add Note
+ Start Review
+ Record Decision
+ Mark Ready
```

Actions must respect user permissions.

---

# 63. Responsive Design

The application must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop is the primary target.

For smaller screens:

- Sidebar becomes collapsible
- Tables become horizontally scrollable
- Cards stack vertically
- Command Center sections stack
- Important actions remain accessible
- Deadline remains visible

---

# 64. UI States

Every major screen must support:

## Loading

```text
Loading tenders...
```

## Empty

```text
No tenders found.

[Create Tender]
```

## Error

```text
Unable to load tenders.

[Retry]
```

## Permission Denied

```text
You do not have permission to access this section.
```

---

# 65. Confirmation & Destructive Actions

Destructive actions must require confirmation.

Examples:

```text
Delete Tender
Delete Document
Delete Task
Cancel Tender
Archive Tender
```

Example:

```text
Are you sure?

This tender will be moved to the archive.

[Cancel] [Confirm]
```

Permanent deletion should be restricted to administrators.

---

# 66. Role-Based Access

The interface should adapt to user permissions.

## Admin

Full access.

## Tender Manager

- Manage tenders
- Assign team
- Manage requirements
- Manage tasks
- Review tenders

## Bid Manager

- Tender preparation
- Documents
- Requirements
- Tasks
- Submission

## Technical Team

- Technical requirements
- Technical documents
- Technical tasks
- Technical review

## Finance

- Financial requirements
- Financial documents
- Financial review

## Management

- Dashboard
- Go/No-Go
- Approval
- Reports

## Viewer

Read-only access.

The frontend must hide actions that the user is not authorized to perform.

Backend permissions remain the final authority.

---

# 67. Global Search

A global search box should allow searching across:

```text
Tenders
Tasks
Documents
Requirements
Organizations
Reference Numbers
```

Example:

```text
Search:
"Oracle ERP"
```

Results:

```text
Tenders (4)
Documents (12)
Requirements (8)
Tasks (3)
```

---

# 68. Dashboard "10 Second Rule"

The dashboard should allow a user to understand within approximately 10 seconds:

```text
1. What tender needs attention?

2. What is the next deadline?

3. What documents are missing?

4. What tasks are assigned to me?

5. Which tenders are at risk?

6. Which tender is ready for submission?

7. What is the current pipeline value?
```

The UI should prioritize action over decorative analytics.

---

# 69. Design System

Use a professional enterprise SaaS design.

## Layout

- Clean background
- Dark or neutral sidebar
- Card-based dashboard
- Consistent spacing
- Clear typography
- Compact data tables
- Status badges
- Large deadline indicators
- Consistent buttons
- Consistent form components

## Design Principle

Avoid excessive visual decoration.

The application is an operational business tool.

---

# 70. Recommended Component System

Create reusable React components for:

```text
Layout
Sidebar
Topbar
Breadcrumb
Button
Input
Select
DatePicker
Modal
Drawer
Tabs
Badge
Card
Table
Pagination
Dropdown
Toast
Tooltip
ProgressBar
ProgressRing
Timeline
KanbanBoard
FileUploader
FilePreview
Checklist
StatusBadge
DeadlineIndicator
UserAvatar
ActivityFeed
EmptyState
LoadingState
ErrorState
```

Components should be reusable across the application.

---

# 71. API Integration Requirements

The frontend should consume REST APIs such as:

```text
GET    /api/v1/tenders
POST   /api/v1/tenders
GET    /api/v1/tenders/{id}
PATCH  /api/v1/tenders/{id}

GET    /api/v1/tenders/{id}/requirements
POST   /api/v1/tenders/{id}/requirements

GET    /api/v1/tasks
POST   /api/v1/tasks
PATCH  /api/v1/tasks/{id}

GET    /api/v1/documents
POST   /api/v1/documents/upload
GET    /api/v1/documents/{id}/download

GET    /api/v1/tenders/{id}/analysis
POST   /api/v1/tenders/{id}/analysis

GET    /api/v1/tenders/{id}/decision
POST   /api/v1/tenders/{id}/decision

GET    /api/v1/tenders/{id}/submission
POST   /api/v1/tenders/{id}/submission

GET    /api/v1/dashboard
GET    /api/v1/reports
```

The exact API contract should be maintained separately in the backend/API specification.

---

# 72. Frontend Data Handling

The frontend should:

- Use centralized API services
- Handle loading states
- Handle API errors
- Cache appropriate data
- Refresh deadline information
- Avoid unnecessary API requests
- Maintain filter/search state
- Preserve selected tender context
- Provide optimistic UI only where safe

Authentication tokens must not be exposed in application UI.

---

# 73. File Upload UI

File upload should display:

```text
Select Files

Accepted:
PDF, DOCX, XLSX, ZIP, JPG, PNG

Maximum:
500 MB

Uploading:
Technical_Proposal.pdf

████████████░░ 80%
```

After upload:

```text
✓ Upload Complete
```

The exact maximum file size should be configurable by the backend.

---

# 74. Document Preview

Where technically supported, users should be able to preview:

```text
PDF
Images
Common Office documents where supported
```

Otherwise:

```text
Preview unavailable

[Download File]
```

Large files should use streaming rather than loading the complete file into browser memory unnecessarily.

---

# 75. Audit & Traceability

Important changes must be traceable.

Examples:

```text
Status changed
Deadline changed
Requirement changed
Document uploaded
Document deleted
Document restored
Task reassigned
Decision changed
Approval completed
Submission recorded
AI result corrected
```

The Activity page should allow filtering by:

- User
- Action
- Date
- Object type

---

# 76. Settings

Settings should include:

```text
Users
Roles
Permissions
Tender Categories
Tender Types
Status Configuration
Priority Configuration
Notification Rules
Deadline Rules
Document Categories
Requirement Types
Decline Reasons
Loss Reasons
Company Information
System Configuration
```

Administrative settings should be restricted to authorized users.

---

# 77. Dashboard Widgets

Recommended widgets:

1. Active Tender Count
2. Deadline Countdown
3. Tender Pipeline
4. My Tasks
5. Missing Documents
6. Upcoming Deadlines
7. Team Workload
8. Submission Readiness
9. Win Rate
10. Recent Activity
11. Tender Value Pipeline
12. Tenders Requiring Attention
13. Go/No-Go Distribution
14. Decline Reason Analysis
15. Win/Loss Analysis

Widgets should be modular so additional widgets can be added later.

---

# 78. Important Dashboard Interactions

The dashboard should be **clickable**, not merely informational.

Examples:

```text
Active Tenders: 24
        ↓
Open Active Tender List
```

```text
Missing Documents: 7
        ↓
Open Missing Document List
```

```text
Overdue Tasks: 4
        ↓
Open My Tasks → Overdue
```

```text
Ready for Submission: 3
        ↓
Open Ready Tenders
```

```text
Pipeline: BDT 8.5 Crore
        ↓
Open Pipeline Report
```

---

# 79. Performance Requirements

The UI should remain responsive for the expected initial scale of:

```text
3–8 users
```

and a growing database of tenders and documents.

The frontend should:

- Paginate large tables
- Avoid loading all documents at once
- Use lazy loading where appropriate
- Use debounced search
- Stream large downloads
- Avoid unnecessary re-rendering
- Load dashboard widgets efficiently

---

# 80. Future Scalability

The current application should remain simple.

Do not initially require:

```text
Microservices
Kubernetes
Load Balancers
Redis
Celery
RabbitMQ
Distributed Storage
Multiple Application Servers
```

These can be introduced later if actual system usage requires them.

---

# 81. Future AI/OCR Interface

The UI should be designed so future OCR and AI processing can be integrated without redesigning the application.

Future flow:

```text
Tender Document
      ↓
Local Storage
      ↓
Text Extraction
      ↓
OCR if required
      ↓
AI Analysis
      ↓
Structured Information
      ↓
Human Verification
      ↓
Tender Tracker
```

The frontend should eventually display:

```text
AI Processing:
Processing...

Extraction:
82%

Verification:
12 items pending
```

---

# 82. Development Priority

## Phase 1 – Core Tracking

Build first:

- Authentication
- Dashboard
- Tender creation
- Tender list
- Tender detail
- Status workflow
- Search/filter
- Deadline tracking
- Basic task management

## Phase 2 – Tender Preparation

Add:

- Requirements
- Documents
- Local file storage integration
- Team assignment
- Go/No-Go
- Decline reasons
- Internal review
- Submission readiness

## Phase 3 – Submission & Analytics

Add:

- Approval workflow
- Submission tracking
- Result tracking
- Win/loss analysis
- Reports
- Pipeline analytics
- Team workload

## Phase 4 – Tender Scanner & AI

Add:

- Tender Scanner integration
- AI document analysis
- Requirement extraction
- Eligibility extraction
- AI suitability scoring
- OCR
- AI document comparison

---

# 83. Recommended Core Web Pages

The complete web application should have:

```text
1. Login

2. Dashboard

3. My Tasks

4. Tender List

5. Tender Detail Workspace

6. Tender Analysis

7. Requirement Tracker

8. Task Management

9. Document Management

10. Team Management

11. Calendar

12. Review & Approval

13. Submission Tracker

14. Result Tracker

15. Reports & Analytics

16. Notifications

17. Settings
```

---

# 84. Recommended Tender Detail Structure

The final Tender Workspace should follow:

```text
Tender
│
├── Overview
│
├── Analysis
│   ├── Scope
│   ├── Technical
│   ├── Eligibility
│   ├── Team
│   ├── Financial
│   └── Delivery
│
├── Requirements
│
├── Tasks
│
├── Documents
│
├── Team
│
├── Financial
│
├── Review
│
├── Submission
│
├── Result
│
└── Activity
```

---

# 85. Final System Concept

The Tender Tracker should function as a:

# Tender Lifecycle Management System

```text
TENDER DISCOVERY
       ↓
TENDER SCANNER
       ↓
TENDER TRACKING
       ↓
INITIAL SCREENING
       ↓
TENDER ANALYSIS
       ↓
GO / NO-GO
       ↓
BID PREPARATION
       ↓
REQUIREMENT TRACKING
       ↓
TASK MANAGEMENT
       ↓
DOCUMENT MANAGEMENT
       ↓
TEAM COLLABORATION
       ↓
REVIEW & APPROVAL
       ↓
SUBMISSION
       ↓
RESULT TRACKING
       ↓
WIN / LOSS ANALYSIS
       ↓
BUSINESS INTELLIGENCE
```

---

# 86. Final Design Goal

The Tender Tracker should **not** simply be a place to store tender information.

It should function as a **Tender Command Center** where the company can manage every action required to evaluate, prepare, approve, submit, and track a tender.

The most important information must always be visible:

```text
DEADLINE
        ↓
READINESS
        ↓
MISSING REQUIREMENTS
        ↓
MISSING DOCUMENTS
        ↓
PENDING TASKS
        ↓
RESPONSIBLE PERSON
        ↓
CURRENT STATUS
        ↓
GO / NO-GO
        ↓
SUBMISSION STATUS
```

The design should prioritize:

**Action → Decision → Compliance → Deadline → Submission**

rather than simply displaying data.

---

# 87. Coding-Agent Implementation Rule

The coding agent implementing this specification should treat this document as the **UI/UX and functional behavior specification**, while following the separate system architecture specification for backend, database, authentication, storage, API, deployment, and infrastructure.

The implementation must not introduce unnecessary infrastructure or architectural complexity.

The first production-ready version should use:

```text
React
+
Vite
+
Tailwind CSS
+
FastAPI
+
MySQL
+
Local Server Storage
```

The system must be designed so OCR, AI, Tender Scanner, and more advanced background processing can be added later without rebuilding the core Tender Tracker.