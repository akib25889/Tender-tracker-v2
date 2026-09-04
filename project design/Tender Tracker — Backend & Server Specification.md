# Tender Tracker — Backend & Server Specification

**Version:** 3.0  
**Architecture:** Local File Storage  
**Target Users:** 3–8 internal users  
**Status:** MVP / Initial Production Architecture

---

# 1. Purpose

Tender Tracker is an internal web-based tender lifecycle management system for tracking tenders from discovery through analysis, Go/No-Go decision, preparation, review, submission, evaluation, and final result.

The initial architecture is intentionally simple and suitable for a small internal team.

```text
React + Vite + Tailwind
          ↓
       FastAPI
          ↓
       MySQL
          ↓
   Local Server Storage
```

The system should avoid unnecessary cloud-storage and distributed-processing infrastructure during the initial implementation.

---

# 2. Technology Stack

## 2.1 Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- shadcn/ui / Radix UI
- TanStack Table
- Recharts

## 2.2 Backend

- Python 3.12+
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Uvicorn
- Gunicorn
- JWT authentication
- Argon2 or bcrypt password hashing
- python-multipart for file uploads

## 2.3 Database

- MySQL 8+

## 2.4 File Storage

**Local server filesystem (HDD / SSD)**

The server's local disk (mechanical HDD, SATA SSD, or NVMe SSD) will store tender documents and other application files.

Google Drive, AWS S3, Cloudflare R2, and MinIO are **not required for the MVP**.

## 2.5 Web Server

- Nginx
- HTTPS / TLS

## 2.6 Operating System

- Ubuntu Server 24.04 LTS

---

# 3. High-Level Architecture

```text
                    ┌──────────────────────┐
                    │      Users 3–8       │
                    └──────────┬───────────┘
                               │
                              HTTPS
                               │
                    ┌──────────▼───────────┐
                    │        Nginx          │
                    │ Reverse Proxy / HTTPS │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    React Frontend     │
                    │       Vite            │
                    └──────────┬───────────┘
                               │ REST API
                    ┌──────────▼───────────┐
                    │     FastAPI Backend   │
                    │ Business Logic / Auth │
                    └───────┬───────┬──────┘
                            │       │
                    ┌───────▼───┐ ┌─▼────────────────┐
                    │   MySQL   │ │ Local File Store │
                    │ Metadata  │ │ Tender Documents │
                    └───────────┘ └──────────────────┘
```

---

# 4. Architecture Principles

The system should follow these principles:

1. Keep the MVP simple.
2. MySQL stores structured application data.
3. Local disk (HDD / SSD) stores actual documents.
4. Files must not be stored directly inside MySQL.
5. Protected files must not be publicly accessible.
6. FastAPI controls document access.
7. All important actions should be logged.
8. Documents should support versioning.
9. Automated backups are mandatory.
10. The storage layer should be abstracted so cloud storage can be introduced later.

---

# 5. Storage Architecture

## 5.1 Storage Decision

The MVP will use **local server storage** instead of:

- Google Drive
- AWS S3
- Cloudflare R2
- MinIO
- Other object-storage services

This is appropriate because the initial system is intended for approximately **3–8 internal users**.

Advantages:

- Simple deployment
- Fast file access
- No external storage API dependency
- No additional storage subscription
- Easier development
- Easier debugging
- Lower infrastructure complexity
- Full control over files

---

# 6. MySQL vs File Storage

MySQL and the filesystem have different responsibilities.

## 6.1 MySQL stores

```text
Users
Roles
Permissions
Tender information
Tender status
Requirements
Tasks
Decisions
Approvals
Submission information
Results
Document metadata
Document versions
File paths
Activity logs
Notifications
```

## 6.2 Local filesystem stores

```text
Tender PDFs
Tender notices
DOC/DOCX
XLS/XLSX
PPT/PPTX
ZIP files
Images
Technical proposals
Financial proposals
CVs
Certificates
Legal documents
Supporting documents
Submission packages
```

### Important

Do **not** store large binary documents directly inside MySQL.

MySQL should store information **about the file**, while the filesystem stores the actual file.

Example:

```text
MySQL:

document_id = 123
filename = TenderNotice.pdf
path = tenders/TDR-2026-0001/01_SOURCE_DOCUMENTS/tender_notice.pdf
size = 18492341
checksum = abc123...
```

Actual file:

```text
/opt/tender-tracker/storage/tenders/TDR-2026-0001/01_SOURCE_DOCUMENTS/tender_notice.pdf
```

---

# 7. Local Storage Directory

Recommended production directory:

```text
/opt/tender-tracker/
│
├── app/
│   └── backend/
│
├── frontend/
│
├── storage/
│   ├── tenders/
│   │   ├── TDR-2026-0001/
│   │   │   ├── 01_SOURCE_DOCUMENTS/
│   │   │   ├── 02_TENDER_ANALYSIS/
│   │   │   ├── 03_TECHNICAL_PROPOSAL/
│   │   │   ├── 04_FINANCIAL_PROPOSAL/
│   │   │   ├── 05_LEGAL_DOCUMENTS/
│   │   │   ├── 06_TEAM_CVS/
│   │   │   ├── 07_SUPPORTING_DOCUMENTS/
│   │   │   ├── 08_REVIEW/
│   │   │   └── 09_SUBMISSION/
│   │   │
│   │   └── TDR-2026-0002/
│   │
│   ├── company_documents/
│   │   ├── COMPANY_REGISTRATION/
│   │   ├── TRADE_LICENSE/
│   │   ├── TAX_DOCUMENTS/
│   │   ├── VAT_BIN/
│   │   ├── BASIS_CERTIFICATE/
│   │   ├── ISO_CERTIFICATES/
│   │   └── OTHER_CERTIFICATES/
│   │
│   ├── employee_cvs/
│   ├── project_experience/
│   ├── templates/
│   └── temporary/
│
├── backups/
│
└── logs/
```

The exact storage location must be configurable.

Example:

```env
STORAGE_ROOT=/opt/tender-tracker/storage
TEMP_STORAGE_ROOT=/opt/tender-tracker/storage/temporary
BACKUP_ROOT=/opt/tender-tracker/backups
```

---

# 8. Tender Folder Creation

When a new tender is created, the backend should automatically create the standard directory structure.

Example tender:

```text
TDR-2026-0001
```

The system creates:

```text
storage/tenders/TDR-2026-0001/
```

with:

```text
01_SOURCE_DOCUMENTS/
02_TENDER_ANALYSIS/
03_TECHNICAL_PROPOSAL/
04_FINANCIAL_PROPOSAL/
05_LEGAL_DOCUMENTS/
06_TEAM_CVS/
07_SUPPORTING_DOCUMENTS/
08_REVIEW/
09_SUBMISSION/
```

The tender's storage path should also be stored in MySQL.

---

# 9. Document Data Model

## 9.1 documents

Recommended fields:

```text
id
uuid
tender_id
category
document_type
original_filename
display_name
relative_path
storage_filename
mime_type
file_extension
file_size
checksum_sha256
description
uploaded_by
uploaded_at
is_current_version
is_deleted
created_at
updated_at
```

### Example

```text
id: 1024
tender_id: 15
category: SOURCE_DOCUMENTS
document_type: TENDER_NOTICE
original_filename: Tender Notice Final.pdf
display_name: Tender Notice
relative_path: tenders/TDR-2026-0001/01_SOURCE_DOCUMENTS/tender_notice_abc123.pdf
storage_filename: tender_notice_abc123.pdf
mime_type: application/pdf
file_extension: pdf
file_size: 18492341
checksum_sha256: ...
uploaded_by: 4
```

---

# 10. Relative Paths

The database should store **relative paths**, not absolute paths.

Good:

```text
tenders/TDR-2026-0001/01_SOURCE_DOCUMENTS/tender_notice.pdf
```

Avoid:

```text
C:\Users\Admin\Documents\TenderTracker\storage\...
```

or:

```text
/opt/tender-tracker/storage/...
```

This makes the application easier to migrate to another server.

The backend combines:

```text
STORAGE_ROOT
+
relative_path
```

to determine the actual filesystem location.

---

# 11. Document Versioning

Documents should support version control.

## document_versions

Recommended fields:

```text
id
document_id
version_number
storage_filename
relative_path
original_filename
file_size
checksum_sha256
uploaded_by
uploaded_at
change_note
is_current_version
```

Example:

```text
Tender_Notice_v1.pdf
Tender_Notice_v2.pdf
Tender_Notice_v3.pdf
```

The application should never silently overwrite an important document.

---

# 12. File Upload Flow

```text
User
  ↓
React
  ↓
FastAPI
  ↓
Authentication
  ↓
Permission Check
  ↓
File Validation
  ↓
Temporary Storage
  ↓
Checksum Calculation
  ↓
Final Storage Location
  ↓
MySQL Metadata
  ↓
Activity Log
```

---

# 13. File Upload Rules

The backend should validate:

- File extension
- MIME type
- File size
- Filename
- Path
- User permission
- Storage availability

Recommended allowed formats:

```text
.pdf
.doc
.docx
.xls
.xlsx
.ppt
.pptx
.zip
.jpg
.jpeg
.png
.txt
.csv
```

Potentially dangerous executable files should be rejected:

```text
.exe
.bat
.cmd
.sh
.ps1
.msi
.scr
```

Maximum upload size should be configurable.

Example:

```env
MAX_UPLOAD_SIZE_MB=500
```

The backend should not blindly trust the extension. MIME validation and, where practical, file-signature validation should also be performed.

---

# 14. File Naming

User filenames should not be used directly as the final storage filename.

Recommended:

```text
{document_type}_v{version}_{uuid}.{extension}
```

Example:

```text
tender_notice_v1_7b21c9.pdf
technical_proposal_v3_91af22.docx
```

The original filename remains stored in MySQL.

This prevents:

- Filename collisions
- Accidental overwrites
- Path traversal
- Special-character problems

---

# 15. File Download

Users should not directly access filesystem paths.

Do not expose:

```text
https://server/storage/...
```

Instead:

```text
Browser
   ↓
GET /api/v1/documents/{id}/download
   ↓
FastAPI
   ↓
Authentication
   ↓
Authorization
   ↓
Locate local file
   ↓
Stream file
```

This allows the system to verify that the user has permission to access the document.

---

# 16. File Preview

Initial MVP should support preview for:

- PDF
- JPG
- JPEG
- PNG
- TXT

Office documents can initially be downloaded.

Optional future features:

- DOCX preview
- XLSX preview
- PPTX preview
- PDF conversion
- Online document editing

These are not required for the first release.

---

# 17. Storage Abstraction

Although local storage is the selected architecture, storage logic should be separated from business logic.

Create an interface such as:

```python
class StorageProvider:
    def upload():
        pass

    def download():
        pass

    def delete():
        pass

    def move():
        pass

    def copy():
        pass

    def exists():
        pass

    def get_metadata():
        pass
```

Initial implementation:

```text
LocalStorageProvider
```

Future implementations could be:

```text
GoogleDriveStorageProvider
S3StorageProvider
R2StorageProvider
MinIOStorageProvider
```

This is important because it allows cloud storage to be introduced later without rewriting the document management system.

---

# 18. Why Local Storage Is Suitable for the MVP

For 3–8 users, storing documents on the same server should not normally cause significant performance problems.

For example:

```text
User uploads 20 MB PDF
        ↓
FastAPI receives file
        ↓
SSD writes file
        ↓
MySQL stores metadata
```

The main resource consumed is:

- Disk I/O
- Network bandwidth

Normal PDF/DOCX uploads do not usually consume significant CPU or RAM.

---

# 19. When Local Storage Can Become a Problem

Performance can become an issue when the server is simultaneously performing large workloads.

Examples:

```text
500 MB ZIP upload
        +
ZIP extraction
        +
OCR of hundreds of PDFs
        +
AI processing
        +
Large downloads
        +
MySQL queries
```

Potential bottlenecks:

- CPU
- RAM
- SSD I/O
- Network bandwidth
- Disk capacity

If this happens, processing can later be separated from the main application server.

---

# 20. Storage Capacity Monitoring

The application should monitor disk usage.

Recommended thresholds:

```text
70% → Warning
80% → High Warning
90% → Critical
95% → Emergency
```

Example dashboard:

```text
Storage
────────────────────────
Used:       142 GB
Free:       358 GB
Total:      500 GB
Usage:       28%
```

Administrators should receive a warning when storage usage reaches the configured threshold.

---

# 21. Storage Sizing

Storage requirements should be estimated using:

```text
Average document size per tender
×
Number of tenders per year
×
Number of years
```

Example:

```text
100 MB average documents/tender
×
1,000 tenders/year
=
100 GB/year
```

However, the actual requirement should also include:

- Document versions
- Proposal files
- CVs
- Certificates
- Supporting documents
- Backups
- Temporary files
- Database
- Operating system
- Growth reserve

Do not plan to run the disk at 95–100% capacity.

---

# 22. Database Schema

Core tables:

```text
users
roles
permissions
user_roles

tenders
tender_status_history
tender_team_members

tender_requirements
tasks
task_dependencies

documents
document_versions

tender_analysis
tender_decisions

approval_workflows
approval_stages
tender_approvals

tender_submissions
tender_results

notifications
activity_logs
```

---

# 23. Tender Table

Recommended fields:

```text
id
uuid
title
reference_number
organization_name
country
tender_type
source_url
published_date
deadline
estimated_value
currency
status
priority
created_by
created_at
updated_at
```

---

# 24. Tender Lifecycle

The main lifecycle should be:

```text
DISCOVERED
     ↓
SCREENING
     ↓
UNDER_ANALYSIS
     ↓
DECISION_PENDING
     ↓
GO
     ↓
PREPARATION
     ↓
INTERNAL_REVIEW
     ↓
APPROVED
     ↓
READY_FOR_SUBMISSION
     ↓
SUBMITTED
     ↓
UNDER_EVALUATION
     ↓
 ┌───────────┐
 ↓           ↓
AWARDED     LOST
```

No-Go branch:

```text
DECISION_PENDING
       ↓
     NO_GO
       ↓
   DECLINED
```

Cancellation:

```text
Any active stage
       ↓
   CANCELLED
```

---

# 25. User Roles

Initial roles:

## Admin

Full system access.

## Tender Manager

- Create tenders
- Manage tenders
- Assign team members
- Monitor deadlines
- Manage workflow

## Bid Manager

- Tender analysis
- Requirement management
- Proposal preparation
- Submission management

## Technical Team

- Technical requirements
- Technical compliance
- Technical proposal

## Finance

- Financial requirements
- Financial proposal
- Financial documents

## Management

- Go/No-Go decisions
- Approval
- Final review

## Viewer

Read-only access.

---

# 26. API Architecture

Use:

```text
API Router
    ↓
Service Layer
    ↓
Repository Layer
    ↓
MySQL
```

For files:

```text
API Router
    ↓
Document Service
    ↓
Local Storage Provider
    ↓
Filesystem
```

Business logic should not be placed directly inside API route functions.

---

# 27. API Endpoints

## Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

## Tenders

```text
GET    /api/v1/tenders
POST   /api/v1/tenders
GET    /api/v1/tenders/{id}
PATCH  /api/v1/tenders/{id}
DELETE /api/v1/tenders/{id}

POST /api/v1/tenders/{id}/status
GET  /api/v1/tenders/{id}/history
```

## Documents

```text
GET    /api/v1/documents
POST   /api/v1/documents/upload
GET    /api/v1/documents/{id}
PATCH  /api/v1/documents/{id}
DELETE /api/v1/documents/{id}

GET /api/v1/documents/{id}/download
GET /api/v1/documents/{id}/preview

GET  /api/v1/documents/{id}/versions
POST /api/v1/documents/{id}/versions
```

## Requirements

```text
GET    /api/v1/tenders/{id}/requirements
POST   /api/v1/tenders/{id}/requirements
PATCH  /api/v1/requirements/{id}
DELETE /api/v1/requirements/{id}
```

## Tasks

```text
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{id}
PATCH  /api/v1/tasks/{id}
DELETE /api/v1/tasks/{id}
```

## Decision

```text
GET  /api/v1/tenders/{id}/decision
POST /api/v1/tenders/{id}/decision
```

## Submission

```text
GET  /api/v1/tenders/{id}/submission
POST /api/v1/tenders/{id}/submission
```

---

# 28. Backend Folder Structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   └── logging.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── tenders.py
│   │       ├── requirements.py
│   │       ├── tasks.py
│   │       ├── documents.py
│   │       ├── approvals.py
│   │       ├── submissions.py
│   │       ├── dashboard.py
│   │       ├── reports.py
│   │       └── notifications.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── tender.py
│   │   ├── requirement.py
│   │   ├── task.py
│   │   ├── document.py
│   │   ├── document_version.py
│   │   ├── approval.py
│   │   ├── submission.py
│   │   └── activity_log.py
│   │
│   ├── schemas/
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── tender_service.py
│   │   ├── workflow_service.py
│   │   ├── requirement_service.py
│   │   ├── task_service.py
│   │   ├── document_service.py
│   │   ├── approval_service.py
│   │   ├── submission_service.py
│   │   └── dashboard_service.py
│   │
│   ├── repositories/
│   │
│   ├── storage/
│   │   ├── base_storage.py
│   │   ├── local_storage.py
│   │   └── storage_factory.py
│   │
│   └── utils/
│
├── alembic/
├── tests/
├── requirements.txt
├── .env
├── .env.example
└── README.md
```

---

# 29. Authentication

Use JWT authentication.

Recommended:

```text
Access Token:
15–30 minutes

Refresh Token:
7–30 days
```

Passwords must be hashed using:

- Argon2 — preferred
- bcrypt — acceptable

Never store plaintext passwords.

---

# 30. Security for Local Files

The storage directory must not be publicly exposed by Nginx.

Do not configure the storage directory as a public static directory.

Bad:

```text
https://tender.company.com/storage/tenders/...
```

Instead:

```text
https://tender.company.com/api/v1/documents/{id}/download
```

FastAPI should perform authorization before returning the file.

Recommended Linux permissions:

```text
Application user → read/write
Other users → no access
```

The application must prevent path traversal.

Reject paths such as:

```text
../../etc/passwd
```

All paths should be normalized and validated before filesystem access.

---

# 31. File Integrity

Calculate SHA-256 checksum when a file is uploaded.

Example:

```text
checksum_sha256
```

Benefits:

- Detect duplicate files
- Verify file integrity
- Validate backups
- Track versions
- Detect accidental corruption

---

# 32. Temporary Files

Large uploads may first be written to:

```text
storage/temporary/
```

Then:

```text
Temporary File
      ↓
Validation
      ↓
Checksum
      ↓
Final Tender Folder
```

Temporary files must be deleted after successful processing.

A cleanup process should remove abandoned temporary files.

---

# 33. Error Handling

## 33.1 Storage failure

If the file cannot be written:

```text
Do not create a completed document record.
Return an appropriate error.
Write an error log.
```

## 33.2 Database failure after file storage

If:

```text
File saved successfully
        ↓
MySQL save fails
```

then the application should:

```text
Attempt to delete the orphaned file
        ↓
Log the failure
```

A periodic orphan-file scanner can also be implemented.

---

# 34. File Deletion

Do not immediately permanently delete important files when a user clicks Delete.

Recommended approach:

```text
User Delete
    ↓
Database is_deleted = true
    ↓
File moved to recycle/archive area
```

Permanent deletion can be performed by Admin or scheduled cleanup.

This reduces accidental document loss.

---

# 35. Audit Trail

Record important actions:

```text
Tender created
Tender edited
Tender deleted
Tender status changed
Go/No-Go decision
Document uploaded
Document deleted
Document restored
Document version created
Task assigned
Task completed
Approval submitted
Approval completed
Submission recorded
Tender result entered
User login
User permission change
```

---

# 36. Dashboard

The dashboard should primarily query MySQL.

It should not scan the filesystem for every dashboard request.

Example:

```text
┌──────────────────────────────────────────┐
│ Total Active Tenders          42         │
│ Upcoming Deadlines             8         │
│ Analysis Pending              11         │
│ Go/No-Go Pending               5         │
│ Preparation                   10         │
│ Submitted                      6         │
│ Won                            2         │
│ Lost                           7         │
└──────────────────────────────────────────┘
```

---

# 37. Dashboard Features

Recommended:

## Tender Summary

```text
Total Tenders
Active Tenders
Won
Lost
Declined
Cancelled
```

## Deadline Monitoring

```text
Due Today
Due Tomorrow
Due This Week
Overdue
```

## Workflow

```text
Screening
Analysis
Decision Pending
Preparation
Review
Approval
Submission
Evaluation
```

## Tasks

```text
My Tasks
Overdue Tasks
Due Today
Upcoming Tasks
Completed Tasks
```

---

# 38. Search and Filtering

The tender list should support:

- Tender title
- Reference number
- Organization
- Country
- Tender type
- Status
- Priority
- Deadline
- Created date
- Assigned person

Example:

```text
Search: "UNDP"
Status: Under Analysis
Priority: High
Deadline: Next 30 days
```

---

# 39. Notifications

Initial notification system can be simple.

Notify users about:

- Upcoming deadlines
- Overdue tasks
- Assigned tasks
- Go/No-Go pending
- Approval pending
- Submission deadline
- Important status changes

Email notifications can be added if required.

---

# 40. Background Processing

Do **not** add Redis + Celery/RQ to the MVP.

Simple background operations can use FastAPI BackgroundTasks or normal request processing.

Examples:

```text
Temporary-file cleanup
Simple notifications
Activity logging
Basic checksum calculation
```

If future processing becomes large, introduce a worker architecture.

---

# 41. Future Background Processing

Possible future architecture:

```text
                    FastAPI
                       ↓
                     Redis
                       ↓
                    Worker
                  /    |     \
                 ↓     ↓      ↓
               OCR    AI    Extraction
```

This should only be introduced when actual workload requires it.

---

# 42. Future Tender Scanner / AI Architecture

The future Tender Scanner can work like:

```text
Tender Source
      ↓
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
Structured Tender Data
      ↓
MySQL
      ↓
Tender Tracker
```

The original tender documents remain in local storage.

AI-generated information should be stored separately from the original documents.

---

# 43. AI Data Model

Future AI analysis may produce:

```text
Tender Summary
Eligibility
Country Restriction
Technical Requirements
Financial Requirements
Required Documents
Experience Requirements
Staff Requirements
Hardware Requirements
Software Requirements
Delivery Requirements
Deadline
Submission Method
Bid Security
Performance Security
Risks
Go/No-Go Recommendation
Reason for Recommendation
```

These should be stored in structured MySQL tables where practical.

---

# 44. Server Specification

## 44.1 Minimum

```text
CPU: 2 vCPU
RAM: 4 GB
SSD: 80 GB+
OS: Ubuntu Server 24.04 LTS
```

## 44.2 Recommended

```text
CPU: 4 vCPU
RAM: 8 GB
SSD: 250–500 GB
OS: Ubuntu Server 24.04 LTS
```

Because documents are stored locally, disk capacity is more important than in a cloud-storage architecture.

---

# 45. Recommended Server Layout

Example:

```text
/opt/tender-tracker/
```

Application:

```text
/opt/tender-tracker/app/
```

Storage:

```text
/opt/tender-tracker/storage/
```

Backups:

```text
/opt/tender-tracker/backups/
```

Logs:

```text
/opt/tender-tracker/logs/
```

---

# 46. Nginx Architecture

```text
Internet / LAN
      ↓
    Nginx
   ┌───────┐
   ↓       ↓
React    FastAPI
           ↓
        MySQL
           +
      Local Storage
```

Nginx handles:

- HTTPS
- Reverse proxy
- Frontend delivery
- Request size limits
- Connection handling
- Security headers

---

# 47. Production Process

Recommended:

```text
Nginx
  ↓
Gunicorn
  ↓
Uvicorn Workers
  ↓
FastAPI
```

For the initial server:

```text
2–4 FastAPI workers
```

depending on CPU and workload.

---

# 48. Network Exposure

Publicly expose:

```text
80   HTTP
443  HTTPS
```

SSH:

```text
22
```

should be restricted to administrators where possible.

Do not expose:

```text
3306 MySQL
```

to the public Internet.

FastAPI's internal application port should also not be publicly exposed when Nginx is used.

---

# 49. HTTPS

Production deployment must use HTTPS.

Example:

```text
https://tender.company.com
```

HTTP should redirect to HTTPS.

Use a valid TLS certificate and renew it automatically.

---

# 50. Environment Configuration

Example `.env`:

```env
APP_NAME=Tender Tracker
ENVIRONMENT=production

DATABASE_URL=mysql+pymysql://username:password@localhost:3306/tender_tracker

JWT_SECRET_KEY=CHANGE_THIS_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=14

STORAGE_ROOT=/opt/tender-tracker/storage
TEMP_STORAGE_ROOT=/opt/tender-tracker/storage/temporary
BACKUP_ROOT=/opt/tender-tracker/backups

MAX_UPLOAD_SIZE_MB=500

STORAGE_WARNING_PERCENT=70
STORAGE_CRITICAL_PERCENT=90
```

Secrets must not be committed to Git.

---

# 51. Backup Strategy

Because documents are stored locally, backup becomes particularly important.

## MySQL

Recommended:

```text
Daily backup
7 daily copies
4 weekly copies
6 monthly copies
```

## Documents

Backup:

```text
/opt/tender-tracker/storage/
```

at least daily.

---

# 52. Backup Architecture

Recommended:

```text
                 Production Server
                        │
             ┌──────────┴──────────┐
             ↓                     ↓
       Database Backup       File Backup
             │                     │
             └──────────┬──────────┘
                        ↓
                 Backup Storage
                        ↓
                  Off-site Copy
```

Do not keep the only backup on the same physical disk as the production files.

---

# 53. 3-2-1 Backup Principle

Important tender data should follow:

```text
3 copies
2 different storage locations/media
1 off-site copy
```

Example:

```text
Copy 1 → Production server
Copy 2 → Backup disk/server
Copy 3 → Off-site/cloud backup
```

Local storage is the **primary storage**, not the only copy.

---

# 54. Backup Testing

Backups should periodically be restored and tested.

A backup that cannot be restored is not a reliable backup.

Recommended test:

```text
Backup
  ↓
Restore to test location
  ↓
Verify MySQL
  ↓
Verify documents
  ↓
Verify file checksums
```

---

# 55. Performance Considerations

The application should avoid loading large files completely into RAM.

For large downloads:

```text
Use streaming responses
```

For large uploads:

```text
Use streaming/chunked handling where practical
```

Do not do:

```python
entire_file = file.read()
```

for very large files if avoidable.

Instead, process files in chunks or use streaming mechanisms.

---

# 56. Concurrent File Access

Multiple users may access different files simultaneously.

The filesystem should support normal concurrent reads.

For writes:

- Use unique filenames.
- Do not overwrite files.
- Use database transactions for metadata.
- Use versioning for document revisions.

This prevents common file-collision problems.

---

# 57. Document Locking

Document locking is not required for the MVP.

Future feature:

```text
User A opens proposal
        ↓
Document locked
        ↓
User B sees "Currently being edited"
```

This can be introduced if the team starts editing documents directly through the application.

---

# 58. File Security

Important security rules:

1. Never expose storage directly.
2. Validate every download request.
3. Validate every upload.
4. Prevent path traversal.
5. Reject dangerous executable files.
6. Limit upload size.
7. Generate safe storage filenames.
8. Store original filenames separately.
9. Use HTTPS.
10. Restrict server filesystem permissions.
11. Keep backups protected.
12. Log important file operations.

---

# 59. Database Transactions

Document metadata operations should use transactions.

Example:

```text
Begin transaction
      ↓
Create document record
      ↓
Create version record
      ↓
Commit
```

If a database operation fails:

```text
Rollback
```

Filesystem operations cannot be rolled back exactly like database transactions, so cleanup logic is required.

---

# 60. Orphan File Management

An orphan file is a file that exists on disk but has no corresponding database record.

Example:

```text
Filesystem:
proposal_v3.pdf

MySQL:
No document record
```

The system should provide an administrative cleanup process.

Possible scheduled job:

```text
Scan filesystem
      ↓
Compare with MySQL
      ↓
Find orphan files
      ↓
Report
      ↓
Admin cleanup
```

Do not automatically delete orphan files without an appropriate retention period.

---

# 61. Document Retention

The system should not permanently delete tender documents immediately.

Recommended:

```text
Deleted
   ↓
Soft deleted
   ↓
Retention period
   ↓
Permanent deletion
```

Retention period should be configurable.

Example:

```env
DELETED_FILE_RETENTION_DAYS=90
```

---

# 62. Project Structure

Full project:

```text
tender-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── deployment/
│   ├── nginx/
│   ├── systemd/
│   ├── scripts/
│   └── backup/
│
├── docs/
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

Docker can be used for development if desired, but it is not mandatory for production.

---

# 63. Development Environment

Recommended local development:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8000

MySQL:
localhost:3306
```

API documentation:

```text
http://localhost:8000/docs
```

FastAPI automatically provides OpenAPI/Swagger documentation.

---

# 64. Production Environment

Example:

```text
https://tender.company.com
```

Architecture:

```text
https://tender.company.com
          ↓
        Nginx
       ↙     ↘
   React     FastAPI
                ↓
              MySQL
                +
          Local Storage
```

---

# 65. MVP Scope

The first release should include:

## Authentication

- Login
- Logout
- Roles
- Permissions

## Tender Management

- Create tender
- Edit tender
- View tender
- Search
- Filter
- Status
- Priority
- Deadline
- Organization
- Tender type

## Documents

- Upload
- Download
- Delete
- Restore
- Versioning
- Categories
- File metadata
- Local storage

## Requirements

- Technical requirements
- Eligibility requirements
- Financial requirements
- Required documents
- Compliance status

## Tasks

- Create task
- Assign task
- Due date
- Status
- Priority

## Go/No-Go

- Go
- No-Go
- Decision reason
- Decision maker
- Decision date

## Submission

- Submission deadline
- Submission date
- Submission method
- Submitted by
- Submission confirmation
- Submission documents

## Dashboard

- Active tenders
- Upcoming deadlines
- Pending decisions
- Tasks
- Submission status
- Results

## Audit

- Activity history

---

# 66. Features Not Required Initially

Do not implement these unless there is an actual requirement:

```text
AWS S3
Cloudflare R2
Google Drive API
MinIO
Redis
Celery
RabbitMQ
Kubernetes
Microservices
Load Balancer
Multiple application servers
Distributed storage
Complex event streaming
```

These can be introduced later.

---

# 67. Future Architecture Expansion

The architecture should be capable of evolving.

### Stage 1 — MVP

```text
React
  +
FastAPI
  +
MySQL
  +
Local Storage
```

### Stage 2 — AI / OCR

```text
React
  +
FastAPI
  +
MySQL
  +
Local Storage
  +
OCR
  +
AI API
```

### Stage 3 — Heavy Processing

```text
React
      +
FastAPI
      +
MySQL
      +
Local Storage
      +
Redis
      +
Worker
      +
OCR / AI
```

### Stage 4 — Large Scale

If the system eventually grows significantly:

```text
Load Balancer
      ↓
Multiple FastAPI Servers
      ↓
MySQL
      +
Object Storage
      +
Redis
      +
Worker Cluster
```

This is not required for the current system.

---

# 68. Storage Migration Strategy

If local storage becomes insufficient, the system should migrate using the existing storage abstraction.

Current:

```text
LocalStorageProvider
```

Later:

```text
                 StorageProvider
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Local Disk   Google Drive     S3/R2
```

The application should continue calling:

```text
storage.upload()
storage.download()
storage.delete()
storage.move()
storage.copy()
```

rather than directly manipulating filesystem paths throughout the application.

---

# 69. Final Architecture Decision

| Component | Decision |
|---|---|
| Frontend | React + Vite + Tailwind |
| Language | TypeScript |
| Backend | FastAPI |
| Backend Language | Python 3.12+ |
| Database | MySQL 8+ |
| File Storage | **Local Server SSD** |
| Web Server | Nginx |
| OS | Ubuntu Server 24.04 LTS |
| Authentication | JWT |
| File Versioning | Yes |
| File Metadata | MySQL |
| Document Binary Data | Local filesystem |
| File Access | FastAPI-controlled |
| Backup | Required |
| Redis | No |
| Celery/RQ | No |
| Google Drive | No |
| AWS S3 | No |
| Cloudflare R2 | No |
| MinIO | No |
| Kubernetes | No |
| Microservices | No |

---

# 70. Recommended MVP Architecture

```text
                 ┌─────────────────┐
                 │   3–8 Users     │
                 └────────┬────────┘
                          │
                       HTTPS
                          │
                 ┌────────▼────────┐
                 │      Nginx      │
                 └───────┬─────────┘
                         │
              ┌──────────▼──────────┐
              │    React + Vite     │
              │   Tailwind + TS     │
              └──────────┬──────────┘
                         │ REST API
              ┌──────────▼──────────┐
              │       FastAPI       │
              │   Python Backend    │
              └───────┬───────┬─────┘
                      │       │
             ┌────────▼──┐ ┌──▼──────────────┐
             │   MySQL   │ │  Local SSD      │
             │ Metadata  │ │ Documents       │
             └───────────┘ └─────────────────┘
                      │
                 ┌────▼─────┐
                 │ Backups  │
                 └──────────┘
```

---

# 71. Core Principle

The system should follow this principle:

> **Keep the architecture simple, but make the storage layer replaceable.**

The initial production system should therefore be:

```text
React
  +
FastAPI
  +
MySQL
  +
Local SSD Storage
  +
Nginx
  +
Automated Backups
```

This provides everything required for the current Tender Tracker MVP without introducing unnecessary infrastructure.

When the system grows, cloud storage, Redis, background workers, OCR, AI processing, or additional servers can be added incrementally.