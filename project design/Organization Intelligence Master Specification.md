# Organization Intelligence Master Specification

## Tender Tracker System

---

# 1. Purpose

The Organization Intelligence module is a centralized master database and analytics system for managing procuring organizations, their organizational hierarchy, tender history, tender analysis, and long-term procurement intelligence.

The module must support organizations such as:

- Bangladesh Government
- Ministries
- Divisions
- Departments
- Directorates
- Government Authorities
- Government Agencies
- Boards
- Commissions
- Corporations
- State-Owned Enterprises
- Government Projects
- United Nations
- UN Agencies
- UN Funds and Programmes
- UN Specialized Agencies
- UN Regional Offices
- UN Country Offices
- International Organizations
- Development Partners
- Multilateral Organizations
- NGOs
- Non-Profit Organizations
- Banks
- Financial Institutions
- Universities
- Educational Institutions
- Private Companies
- Consulting Firms
- Other Procuring Entities

The Organization Intelligence module must help the company understand:

- Which organizations publish the most tenders.
- How many tenders have been discovered from each organization.
- How many tenders have been analyzed.
- How many tenders were suitable for the company.
- How many tenders were declined.
- Why tenders were declined.
- How many tenders received a Go decision.
- How many tenders were submitted.
- How many tenders were awarded.
- How many tenders were lost.
- Which organizations provide the best opportunities.
- Which organizations should receive higher monitoring priority.
- Which organizations should receive less monitoring effort.
- What categories of tenders an organization commonly publishes.
- What requirements an organization frequently requests.
- What eligibility problems frequently occur for tenders from an organization.
- What historical tender patterns can help prepare for future opportunities.

---

# 2. Main Business Objective

The Organization Intelligence Database must transform tender history into procurement intelligence.

The system should allow the company to move from asking:

```text
What tenders are available today?
```

to asking:

```text
Which organizations publish the most relevant tenders?

Which organizations are most suitable for our company?

Which organizations have the highest historical win rate?

Why do we frequently decline tenders from certain organizations?

Which organizations should we monitor more closely?

What requirements should we prepare before future tenders?
```

The long-term goal is:

# Procurement and Organization Intelligence

---

# 3. Core System Principles

The Organization Intelligence system must follow these principles.

## 3.1 One Generic Organization Model

Do not create separate database systems for:

```text
Bangladesh Government

United Nations

International Organizations

Development Partners

NGOs

Private Companies
```

All organizations must use one generic organization architecture.

```text
Organization
        ↓
Parent Organization
        ↓
Child Organization
        ↓
Sub-Organization
        ↓
Additional Levels
```

---

## 3.2 Unlimited Hierarchy Depth

The system must not assume a fixed number of hierarchy levels.

Example:

```text
Government
        ↓
Ministry
        ↓
Division
        ↓
Department
        ↓
Directorate
        ↓
Regional Office
```

Another example:

```text
United Nations System
        ↓
UN Organization
        ↓
Regional Office
        ↓
Country Office
        ↓
Project Office
```

---

## 3.3 Database-Driven Configuration

Organization types, hierarchy, aliases, relationships, and classifications must be stored in the database.

Do not hard-code organization structures in application logic.

---

## 3.4 Historical Data Preservation

Organizations connected to historical tenders must not be permanently deleted.

Use:

```text
ACTIVE

INACTIVE

ARCHIVED

MERGED

RENAMED
```

Historical tender relationships must remain intact.

---

## 3.5 Statistics Must Be Calculated from Real Data

Do not manually store editable counters such as:

```text
total_tenders = 120
```

Statistics must be calculated from actual tender records.

Example:

```text
COUNT(tenders)
```

This prevents inconsistent reporting.

---

# 4. Organization Hierarchy Architecture

The primary organization hierarchy must use:

```text
organizations.parent_id
```

Example:

```text
Government of Bangladesh
        │
        └── Ministry of Finance
                │
                └── Finance Division
```

Database relationship:

```text
Finance Division

parent_id
        ↓
Ministry of Finance
```

---

# 5. Organization Types

Create a database-driven organization type master table.

Recommended initial types:

```text
ROOT

COUNTRY

GOVERNMENT

MINISTRY

DIVISION

DEPARTMENT

DIRECTORATE

AGENCY

AUTHORITY

BOARD

COMMISSION

CORPORATION

PUBLIC_BODY

STATE_OWNED_ENTERPRISE

PROJECT

UN_SYSTEM

UN_ORGANIZATION

UN_PROGRAMME

UN_FUND

UN_SPECIALIZED_AGENCY

UN_SECRETARIAT

UN_COUNTRY_OFFICE

UN_REGIONAL_OFFICE

INTERNATIONAL_ORGANIZATION

MULTILATERAL_ORGANIZATION

DEVELOPMENT_PARTNER

NGO

NON_PROFIT

BANK

FINANCIAL_INSTITUTION

UNIVERSITY

EDUCATIONAL_INSTITUTION

PRIVATE_COMPANY

CONSULTING_FIRM

OTHER
```

Administrators must be able to create new organization types.

---

# 6. Core Database Schema

## 6.1 organization_types

```text
id

code

name

description

is_active

created_at

updated_at
```

Example:

```text
code:

MINISTRY

name:

Ministry
```

---

## 6.2 organizations

```text
id

name

short_name

legal_name

normalized_name

organization_type_id

parent_id

country_id

website

email

phone

address

city

state_or_division

postal_code

external_identifier

status

description

merged_into_organization_id

created_at

updated_at

created_by

updated_by
```

### Important Fields

#### parent_id

Defines the primary organization hierarchy.

#### normalized_name

Used for:

- Search
- Duplicate detection
- AI organization matching
- Tender Scanner matching

#### organization_type_id

Defines the organization category.

#### country_id

Defines the primary country.

For global organizations, this may be:

```text
NULL
```

depending on the final country model.

#### merged_into_organization_id

Used when duplicate organizations are merged.

---

# 7. Organization Relationships

The primary organization hierarchy must use:

```text
organizations.parent_id
```

Complex or additional relationships must use:

```text
organization_relationships
```

## organization_relationships

```text
id

parent_organization_id

child_organization_id

relationship_type

start_date

end_date

status

notes

created_at

updated_at
```

Recommended relationship types:

```text
PARENT_OF

SUBSIDIARY_OF

DIVISION_OF

DEPARTMENT_OF

DIRECTORATE_OF

AGENCY_OF

COUNTRY_OFFICE_OF

REGIONAL_OFFICE_OF

PROJECT_OF

AFFILIATED_WITH

MERGED_INTO

REPLACED_BY
```

### Important Rule

Use:

```text
parent_id
```

for the main organization tree.

Use:

```text
organization_relationships
```

only for additional or complex relationships.

Do not duplicate the same relationship unnecessarily.

---

# 8. Organization Aliases

Tender documents frequently use different names for the same organization.

Example:

```text
United Nations Development Programme

UNDP

United Nations Development Program
```

Create:

## organization_aliases

```text
id

organization_id

alias

normalized_alias

language

source

is_primary

created_at

updated_at
```

---

## 8.1 Alias Purpose

Aliases help with:

- Tender Scanner organization matching
- AI document analysis
- Duplicate detection
- Search
- Historical organization name matching

---

## 8.2 Country Office Rule

Country offices should normally be separate organization records.

Example:

```text
UNDP
        ↓
UNDP Bangladesh
```

Database:

```text
Organization:

UNDP Bangladesh

Type:

UN_COUNTRY_OFFICE

Parent:

UNDP

Country:

Bangladesh
```

Do not simply store `UNDP Bangladesh` as an alias of `UNDP` if it functions as a distinct office.

---

# 9. Organization Name Normalization

The system must generate normalized organization names.

Example:

```text
UNDP
```

↓

```text
undp
```

Example:

```text
Ministry of Information and Communication Technology
```

↓

```text
ministry information communication technology
```

Normalization should handle:

- Uppercase and lowercase differences
- Extra spaces
- Punctuation
- Common formatting differences
- Common abbreviations

Normalized names must be used for:

- Duplicate detection
- Search
- Tender Scanner matching
- AI organization identification

---

# 10. Duplicate Detection

Before creating an organization, the system should check:

```text
Organization Name

Normalized Name

Short Name

Aliases

Parent Organization

Country
```

Example:

```text
User enters:

UNDP Bangladesh
```

System should show:

```text
Possible Existing Organizations:

UNDP Bangladesh

United Nations Development Programme Bangladesh
```

The authorized user can choose:

```text
Use Existing Organization
```

or:

```text
Create New Organization
```

---

# 11. Organization Merge

The system must support merging duplicate organizations.

Workflow:

```text
Duplicate Organization
        ↓
Select Target Organization
        ↓
Validate Merge Permission
        ↓
Move Tender Relationships
        ↓
Move Aliases
        ↓
Move Relationships
        ↓
Preserve Historical Reference
        ↓
Mark Source Organization as MERGED
```

The duplicate organization must remain historically traceable.

Recommended fields:

```text
status = MERGED

merged_into_organization_id = Target Organization ID
```

All merges must be audit logged.

---

# 12. Organization Rename and Replacement

Organizations may change names or structures.

The system must support:

```text
Organization Renamed
```

and:

```text
Organization Replaced
```

Do not overwrite historical information if the old organization was responsible for historical tenders.

Recommended process:

```text
Old Organization

status = RENAMED
```

Then create:

```text
REPLACED_BY
        ↓
New Organization
```

Historical tenders must remain connected to the organization that existed when the tender was issued.

---

# 13. Tender-to-Organization Architecture

A tender may involve multiple organizations.

Do not store only one organization directly inside the tender record.

Create:

## tender_organizations

```text
id

tender_id

organization_id

organization_role

is_primary

created_at

updated_at
```

Recommended roles:

```text
PROCURING_ENTITY

IMPLEMENTING_AGENCY

FUNDING_ORGANIZATION

PROJECT_OWNER

CLIENT

BENEFICIARY

REGULATOR

TECHNICAL_PARTNER

OTHER
```

Example:

```text
Tender:

National Digital Transformation Project
```

Organizations:

```text
Procuring Entity:

ICT Division
```

```text
Funding Organization:

World Bank
```

```text
Implementing Agency:

Bangladesh Computer Council
```

---

# 14. Tender Source vs Procuring Organization

The system must distinguish between:

```text
WHERE THE TENDER WAS DISCOVERED
```

and:

```text
WHO ISSUED THE TENDER
```

Example:

```text
Tender Source:

UNGM
```

But:

```text
Procuring Organization:

UNDP Bangladesh
```

Therefore:

```text
UNGM
        ↓
Tender Discovery Source

UNDP Bangladesh
        ↓
Procuring Organization
```

These must be stored separately.

---

# 15. Tender Source Database

Create:

## tender_sources

```text
id

name

source_type

website

description

status

created_at

updated_at
```

Recommended source types:

```text
PROCUREMENT_PORTAL

ORGANIZATION_WEBSITE

GOVERNMENT_PORTAL

EMAIL

MANUAL_ENTRY

API

WEB_SCRAPER

OTHER
```

Example sources:

```text
UNGM

e-GP Bangladesh

Organization Website

UNDP Procurement Portal

World Bank Procurement Portal

ADB Procurement Portal

Email Notification

Manual Entry
```

---

# 16. Organization Tender Intelligence

Each organization must automatically display tender intelligence statistics.

Example:

# UNDP Bangladesh

```text
TOTAL TENDERS DISCOVERED

120

↓

ANALYZED

85

↓

NOT ANALYZED

35

↓

GO DECISION

40

↓

NO-GO / DECLINED

45

↓

SUBMITTED

32

↓

AWARDED

8

↓

LOST

20

↓

UNDER EVALUATION

4
```

These statistics must be calculated automatically.

---

# 17. Tender Lifecycle Funnel by Organization

Each organization should have a tender funnel.

```text
TENDERS DISCOVERED
        120
         ↓

TENDERS SCREENED
        100
         ↓

TENDERS ANALYZED
         85
         ↓

GO DECISION
         40
         ↓

TENDERS PREPARED
         36
         ↓

TENDERS SUBMITTED
         32
         ↓

AWARDED
          8
```

This helps identify where opportunities are filtered out.

---

# 18. Tender Discovery Metrics

Each organization must support:

```text
Total Tenders Discovered

Tenders This Month

Tenders This Year

Average Tenders Per Month

First Tender Recorded

Latest Tender Recorded
```

---

# 19. Tender Analysis Tracking

The system must distinguish between:

```text
TENDER DISCOVERED
```

and:

```text
TENDER ANALYZED
```

Recommended analysis statuses:

```text
NOT_ANALYZED

ANALYSIS_PENDING

ANALYSIS_IN_PROGRESS

ANALYZED

ANALYSIS_FAILED

ANALYSIS_NOT_REQUIRED
```

---

# 20. Organization Analysis Metrics

Each organization must show:

```text
Total Tenders Requiring Analysis

Tenders Analyzed

Pending Analysis

Analysis Completion Rate

Average Analysis Time
```

### Analysis Completion Rate

Calculated from:

```text
Analyzed Tenders
──────────────────────────── × 100
Tenders Requiring Analysis
```

---

# 21. Go / No-Go Intelligence

Track Go / No-Go decisions by organization.

Recommended decision values:

```text
GO

NO_GO

PENDING
```

Organization dashboard example:

```text
ANALYZED

50

GO

20

NO-GO

25

PENDING

5
```

This helps answer:

```text
How suitable are tenders from this organization?
```

---

# 22. Organization Suitability Metrics

Each organization should calculate:

```text
GO Decisions

NO-GO Decisions

Pending Decisions

GO Rate

NO-GO Rate

Average Suitability Score
```

---

# 23. Decline Reason Intelligence

The system must track why tenders are declined.

Recommended reasons:

```text
NOT_ELIGIBLE

COUNTRY_RESTRICTION

LACK_OF_SIMILAR_EXPERIENCE

INSUFFICIENT_TURNOVER

MISSING_CERTIFICATION

TEAM_UNAVAILABLE

DEADLINE_TOO_SHORT

BUDGET_TOO_LOW

OUTSIDE_COMPANY_EXPERTISE

CLIENT_REQUIREMENTS_NOT_SUITABLE

STRONG_COMPETITION

STRATEGIC_DECISION

OTHER
```

Example:

# ADB

```text
DECLINED TENDERS:

30
```

Reasons:

```text
Lack of Similar Experience

10

Financial Requirement

8

Country Restriction

2

Deadline Too Short

5

Outside Expertise

5
```

---

# 24. Organization Category Intelligence

Track which tender categories are published by each organization.

Example:

# UNDP Bangladesh

```text
SOFTWARE DEVELOPMENT

35

ERP

12

CONSULTANCY

25

HARDWARE

10

AI

8
```

This should help predict future opportunities.

---

# 25. Historical Tender Pattern Analysis

The system should analyze historical tender patterns.

Example:

```text
Organization:

UNDP Bangladesh
```

```text
Most Active Months:

March

June

October
```

```text
Common Categories:

Software Development

Consultancy

ERP
```

```text
Average Tender Preparation Time:

18 Days
```

```text
Average Submission Period:

25 Days
```

---

# 26. Organization Tender Frequency

Track how frequently organizations publish tenders.

Example:

```text
UNDP Bangladesh

January:

5

February:

8

March:

12

April:

3

May:

7
```

The system should identify:

```text
High Activity Organizations

Seasonal Procurement Patterns

Inactive Organizations

Emerging Opportunities
```

---

# 27. Organization Requirement Intelligence

The system should collect recurring requirements from analyzed tenders.

Example:

# UNDP Bangladesh

Frequently Required:

```text
Similar Project Experience

Project Manager

Technical Team

Financial Proposal

Company Registration

ISO Certification
```

Over time, the system should help answer:

```text
What requirements should we prepare before the next UNDP tender?
```

---

# 28. Organization Eligibility Pattern Analysis

The system should identify recurring eligibility requirements.

Example:

# World Bank

```text
Minimum Similar Projects:

3

Minimum Turnover:

High

International Experience:

Frequently Required

JV:

Sometimes Allowed
```

The information should be based on analyzed tender data.

---

# 29. Organization Document Readiness

For frequently monitored organizations, the system should support document readiness tracking.

Example:

# UNDP Tender Readiness

```text
Company Documents

95% Ready

Technical CVs

80% Ready

Experience Documents

75% Ready

Financial Documents

90% Ready
```

This helps prepare before future tenders are published.

---

# 30. Company Relationship History

The system must maintain a historical relationship profile between the company and each organization.

Example:

# UNDP Bangladesh

```text
Tenders Discovered:

120

Analyzed:

85

Submitted:

32

Awarded:

8

Lost:

20

Cancelled:

2

Under Evaluation:

2
```

This creates long-term procurement intelligence.

---

# 31. Organization Performance Metrics

Every organization should support the following metrics.

## 31.1 Discovery Metrics

```text
Total Tenders Discovered

Tenders This Month

Tenders This Year

Average Tenders Per Month
```

## 31.2 Analysis Metrics

```text
Tenders Analyzed

Analysis Completion Rate

Average Analysis Time

Pending Analysis
```

## 31.3 Suitability Metrics

```text
GO Decisions

NO-GO Decisions

GO Rate

Average Suitability Score
```

## 31.4 Submission Metrics

```text
Tenders Prepared

Tenders Submitted

Submission Rate
```

## 31.5 Result Metrics

```text
Awarded

Lost

Cancelled

Under Evaluation

Win Rate
```

## 31.6 Financial Metrics

```text
Total Estimated Tender Value

Submitted Tender Value

Awarded Contract Value

Average Tender Value
```

## 31.7 Strategic Metrics

```text
Monitoring Priority

Opportunity Score

Organization Relevance

Strategic Importance
```

---

# 32. Win Rate Calculation

Win rate should be calculated using completed tender results.

Recommended formula:

```text
Awarded
──────────────────── × 100
Awarded + Lost
```

Do not include:

```text
Under Evaluation
```

in the win rate calculation.

Cancelled tenders should normally be excluded unless reporting rules specify otherwise.

---

# 33. Organization Opportunity Score

The system may calculate an organization-level opportunity score.

Example:

```text
UNDP Bangladesh

Opportunity Score:

82 / 100
```

Possible factors:

```text
Tender Frequency

Relevant Tender Percentage

GO Decision Rate

Submission Rate

Win Rate

Average Tender Value

Strategic Importance

Company Experience Match
```

The scoring algorithm must be configurable.

Do not permanently hard-code scoring weights.

---

# 34. Organization Monitoring Priority

Each organization should support monitoring priority.

Recommended values:

```text
CRITICAL

HIGH

MEDIUM

LOW

NOT_MONITORED
```

Priority can be:

```text
Manually Set
```

or:

```text
Automatically Recommended
```

The final implementation should support both.

---

# 35. Monitoring Recommendation

The system may calculate a monitoring score.

Example:

```text
Monitoring Score:

92 / 100

Recommendation:

HIGH PRIORITY
```

Suggested factors:

```text
Tender Frequency

Relevant Tender Percentage

GO Decision Rate

Submission Rate

Win Rate

Average Tender Value

Strategic Importance
```

The recommendation must not automatically override manual monitoring priority.

---

# 36. Organization Relevance Analysis

The system should help answer:

```text
Should we continue monitoring this organization?
```

Example:

```text
Organization A

Tenders Discovered:

50

Analyzed:

40

Relevant:

3

Submitted:

1

Awarded:

0
```

Possible conclusion:

```text
LOW PRIORITY
```

Example:

```text
Organization B

Tenders Discovered:

30

Analyzed:

25

Relevant:

18

Submitted:

15

Awarded:

5
```

Possible conclusion:

```text
HIGH PRIORITY
```

---

# 37. Organization Dashboard

Each organization should have a dedicated intelligence dashboard.

Example:

```text
┌───────────────────────────────────────────────┐

│ UNDP BANGLADESH                              │

│ Parent: UNDP                                 │

│ Country: Bangladesh                          │

│ Monitoring Priority: HIGH                    │

├───────────────────────────────────────────────┤

│ TOTAL TENDERS                                │
│ 120                                           │

│ ANALYZED                                     │
│ 85                                            │

│ GO                                           │
│ 40                                            │

│ SUBMITTED                                    │
│ 32                                            │

│ AWARDED                                      │
│ 8                                             │

├───────────────────────────────────────────────┤

│ ANALYSIS RATE                                │
│ ████████░░ 81%                               │

│ WIN RATE                                     │
│ ███░░░░░░░ 25%                               │

├───────────────────────────────────────────────┤

│ TOP DECLINE REASON                           │

│ Lack of Similar Experience                   │
│ 10 Tenders                                   │

├───────────────────────────────────────────────┤

│ COMMON TENDER CATEGORIES                     │

│ Software Development                         │
│ Consultancy                                  │
│ ERP                                          │

└───────────────────────────────────────────────┘
```

---

# 38. Parent Organization Analytics

The system must support hierarchy-level aggregation.

Example:

```text
UNDP
```

Should include:

```text
Direct UNDP Tenders

+

UNDP Bangladesh

+

UNDP India

+

UNDP Nepal

+

Other Country Offices
```

The user must be able to switch between:

```text
DIRECT TENDERS ONLY
```

and:

```text
INCLUDE CHILD ORGANIZATIONS
```

---

# 39. Organization Comparison

The system should allow organizations to be compared.

Example:

| Organization | Discovered | Analyzed | GO | Submitted | Won |
|---|---:|---:|---:|---:|---:|
| UNDP | 120 | 85 | 40 | 32 | 8 |
| World Bank | 90 | 70 | 35 | 25 | 6 |
| ADB | 60 | 50 | 15 | 10 | 1 |

This should help management decide:

```text
Where should we spend our tender monitoring effort?
```

---

# 40. Organization Hierarchy Reporting

Reports must support aggregation at any hierarchy level.

Example:

```text
Government of Bangladesh

Total Tenders:

450

Active:

30

Submitted:

120

Won:

25
```

Clicking:

```text
Ministry of Finance
```

should show:

```text
Direct Tenders

+

Tenders from Child Organizations
```

The same logic must work for UN organizations and other hierarchies.

---

# 41. Bangladesh Government Hierarchy

The Bangladesh Government should use the generic hierarchy model.

Recommended root:

```text
People's Republic of Bangladesh
        │
        └── Government of Bangladesh
                │
                ├── President's Office
                ├── Prime Minister's Office
                ├── Cabinet Division
                ├── Armed Forces Division
                │
                └── Ministries and Divisions
```

Recommended structure:

```text
Government
        ↓
Ministry
        ↓
Division
        ↓
Department / Directorate / Authority
        ↓
Regional / Local Office
        ↓
Project
```

---

# 42. Bangladesh Government Seed Data

Initial seed data should include:

```text
People's Republic of Bangladesh

Government of Bangladesh

Current Ministries

Current Divisions

Major Departments

Major Directorates

Major Authorities

Major Boards

Major Corporations

Major IT Organizations

Major Government Procurement Organizations
```

The organization hierarchy must remain editable because government structures may change.

---

# 43. United Nations Hierarchy

Recommended root:

```text
United Nations System
```

Recommended structure:

```text
United Nations System
        │
        ├── United Nations
        │
        ├── UN Funds and Programmes
        │
        ├── UN Specialized Agencies
        │
        └── Other Related Organizations
```

The database structure must remain flexible because UN classifications and relationships vary.

---

# 44. UN Funds and Programmes

Example:

```text
United Nations System
        │
        └── UN Funds and Programmes
                │
                ├── UNDP
                ├── UNICEF
                ├── UNFPA
                ├── UNEP
                ├── UN-Habitat
                ├── WFP
                ├── UNOPS
                ├── UNHCR
                └── UN Women
```

---

# 45. UN Country Office Structure

Example:

```text
UNDP
        │
        ├── Headquarters
        │
        ├── Regional Offices
        │
        └── Country Offices
                │
                ├── UNDP Bangladesh
                ├── UNDP India
                ├── UNDP Nepal
                └── Other Country Offices
```

Country offices must normally be stored as separate organizations.

---

# 46. UN Specialized Agencies

Example:

```text
United Nations System
        │
        └── UN Specialized Agencies
                │
                ├── FAO
                ├── ICAO
                ├── IFAD
                ├── ILO
                ├── IMF
                ├── IMO
                ├── ITU
                ├── UNESCO
                ├── UNIDO
                ├── UN Tourism
                ├── UPU
                ├── WHO
                ├── WIPO
                └── WMO
```

Seed data classifications should be verified against official sources during implementation.

---

# 47. International Organizations and Development Partners

Examples:

```text
World Bank Group
        │
        ├── Headquarters
        ├── Regional Offices
        └── Country Offices
```

```text
Asian Development Bank
        │
        └── Bangladesh Resident Mission
```

```text
JICA
        │
        └── JICA Bangladesh Office
```

Recommended initial organizations:

```text
World Bank Group

Asian Development Bank

Islamic Development Bank

European Union

JICA

USAID
```

---

# 48. Organization Detail Page

Each organization should have a dedicated page.

Recommended sections:

```text
Overview

Organization Information

Hierarchy

Parent Organization

Child Organizations

Aliases

Relationships

Country and Location

Tender Statistics

Tender Funnel

Tender Categories

Requirements Intelligence

Decline Reasons

Tender History

Monitoring Priority

Organization Sources

Activity History
```

---

# 49. Organization Tree User Interface

Recommended UI:

```text
Organizations

🔍 Search Organization

┌─────────────────────────────────────┐

▼ United Nations System

    ├── UN Funds and Programmes

    │       ├── UNDP

    │       │       └── UNDP Bangladesh

    │       ├── UNICEF

    │       └── UNOPS

    │
    └── UN Specialized Agencies

            ├── WHO

            ├── FAO

            └── UNESCO

└─────────────────────────────────────┘
```

Features:

```text
Expand

Collapse

Search

Filter by Type

Filter by Country

Show Parent

Show Children

Show Related Tenders

Include Descendants
```

---

# 50. Organization Search

The system must support hierarchy-aware search.

Example:

```text
Search:

Ministry of Finance
```

Option:

```text
Include Child Organizations

✓ Yes
```

Results should include:

```text
Ministry of Finance

Finance Division

Internal Resources Division

Other Child Organizations
```

---

# 51. Organization Sources and Verification

Create:

## organization_sources

```text
id

organization_id

source_name

source_url

source_type

verified_at

verified_by

last_checked_at

created_at
```

Recommended source types:

```text
OFFICIAL_WEBSITE

GOVERNMENT_PORTAL

UN_PORTAL

INTERNATIONAL_DIRECTORY

MANUAL_VERIFICATION

OTHER
```

Purpose:

- Verify organization information.
- Record official sources.
- Track data freshness.
- Support future organization updates.

---

# 52. Administration Features

Authorized administrators must be able to:

```text
Create Organization

Edit Organization

Change Parent Organization

Add Child Organization

Change Organization Type

Add Alias

Add Relationship

Merge Duplicate Organizations

Rename Organization

Replace Organization

Mark Organization Inactive

Archive Organization

Add Country Office

Add Project Office

Add Official Source

Import Organizations
```

---

# 53. Bulk Import

Support importing organization data from:

```text
CSV

Excel

JSON
```

Recommended import columns:

```text
name

short_name

legal_name

organization_type

parent_name

country

website

status

aliases
```

Import process:

```text
Validate Organization Type
        ↓
Validate Parent Organization
        ↓
Check Duplicates
        ↓
Check Aliases
        ↓
Preview Import
        ↓
Show Errors
        ↓
Approve Import
        ↓
Create / Update Organizations
```

---

# 54. Seed Data Architecture

Seed data must remain separate from application logic.

Recommended structure:

```text
backend/

app/

    seeds/

        bangladesh_government.json

        united_nations.json

        international_organizations.json

        development_partners.json
```

Example:

```json
{
  "name": "Government of Bangladesh",
  "short_name": "GoB",
  "type": "GOVERNMENT",
  "children": [
    {
      "name": "Ministry of Finance",
      "type": "MINISTRY",
      "children": [
        {
          "name": "Finance Division",
          "type": "DIVISION"
        }
      ]
    }
  ]
}
```

Do not hard-code organization names in backend business logic.

---

# 55. Recommended API Endpoints

## Organization APIs

```text
GET /api/v1/organizations

GET /api/v1/organizations/{id}

POST /api/v1/organizations

PATCH /api/v1/organizations/{id}

DELETE /api/v1/organizations/{id}
```

Physical deletion should normally be blocked when tender records exist.

Use:

```text
ARCHIVED
```

instead.

---

## Hierarchy APIs

```text
GET /api/v1/organizations/tree

GET /api/v1/organizations/{id}/children

GET /api/v1/organizations/{id}/ancestors

GET /api/v1/organizations/{id}/descendants
```

---

## Alias APIs

```text
GET /api/v1/organizations/{id}/aliases

POST /api/v1/organizations/{id}/aliases

DELETE /api/v1/organizations/{id}/aliases/{alias_id}
```

---

## Relationship APIs

```text
GET /api/v1/organizations/{id}/relationships

POST /api/v1/organizations/{id}/relationships

PATCH /api/v1/organization-relationships/{relationship_id}
```

---

## Tender Intelligence APIs

```text
GET /api/v1/organizations/{id}/statistics

GET /api/v1/organizations/{id}/tenders

GET /api/v1/organizations/{id}/analytics

GET /api/v1/organizations/{id}/categories

GET /api/v1/organizations/{id}/decline-reasons

GET /api/v1/organizations/{id}/requirements

GET /api/v1/organizations/{id}/patterns

GET /api/v1/organizations/compare
```

---

## Merge APIs

```text
POST /api/v1/organizations/{id}/merge
```

The merge process must require:

```text
Source Organization

Target Organization

Permission Validation

Confirmation

Audit Logging
```

---

# 56. Performance Requirements

Use:

```text
MySQL 8+
```

Recommended indexes:

```text
organizations.parent_id

organizations.organization_type_id

organizations.country_id

organizations.status

organizations.name

organizations.normalized_name

organization_aliases.organization_id

organization_aliases.normalized_alias

organization_relationships.parent_organization_id

organization_relationships.child_organization_id

tender_organizations.tender_id

tender_organizations.organization_id
```

Use MySQL recursive CTE queries where appropriate for:

```text
Ancestors

Descendants

Organization Trees
```

Do not load the entire organization hierarchy when only one branch is required.

---

# 57. Recommended Data Relationship Model

```text
organization_types
        │
        ▼
organizations
        │
        ├── parent_id
        │
        ├── organization_aliases
        │
        ├── organization_relationships
        │
        ├── organization_sources
        │
        └── tender_organizations
                │
                ▼
              tenders
                │
                ├── tender_sources
                │
                ├── analysis
                │
                ├── go_no_go_decision
                │
                ├── requirements
                │
                ├── decline_reasons
                │
                └── tender_results
```

---

# 58. Analytics Data Rules

The organization analytics system must calculate metrics from actual tender records.

Primary data sources include:

```text
tenders.status

tenders.analysis_status

tenders.go_no_go_decision

tenders.result_status

tenders.category

tenders.estimated_value

tenders.awarded_value

tender_organizations

tender_decline_reasons

tender_requirements
```

Do not maintain separate manually editable statistics.

---

# 59. Organization Intelligence Reports

The system should support reports such as:

```text
Top Tender Publishing Organizations

Organizations with Most Discovered Tenders

Organizations with Highest Analysis Rate

Organizations with Highest GO Rate

Organizations with Highest Submission Rate

Organizations with Highest Win Rate

Organizations with Highest Tender Value

Organizations with Most Declined Tenders

Organizations with Most Eligibility Problems

Organizations with Most Software Tenders

Organizations We Should Monitor More

Organizations We Should Monitor Less
```

---

# 60. Organization-Level AI Intelligence

Historical organization data should be available for future AI analysis.

AI should eventually help answer:

```text
Which organizations publish the most relevant software tenders?
```

```text
Which organizations have the highest success rate for our company?
```

```text
Why do we frequently decline tenders from ADB?
```

```text
Which organization should we prioritize this month?
```

```text
What requirements are commonly requested by UNDP?
```

```text
Which organization is likely to publish a relevant tender soon?
```

AI recommendations must be clearly separated from factual historical statistics.

---

# 61. Final Organization Intelligence Workflow

```text
TENDER DISCOVERED
        ↓
Tender Source Recorded
        ↓
Procuring Organization Identified
        ↓
Organization Matched
        ↓
Organization Hierarchy Identified
        ↓
Tender Analyzed
        ↓
Requirements Extracted
        ↓
Go / No-Go Decision
        ↓
Tender Preparation
        ↓
Tender Submission
        ↓
Tender Result
        ↓
Organization Statistics Updated
        ↓
Historical Pattern Analysis
        ↓
Organization Intelligence
```

---

# 62. Final Coding Agent Requirements

The coding agent must implement the following.

## Core Organization System

```text
✓ Generic organization system

✓ Unlimited hierarchy depth

✓ Parent-child relationships

✓ Database-driven organization types

✓ No hard-coded government or UN hierarchy
```

## Organization Intelligence

```text
✓ Organization aliases

✓ Name normalization

✓ Duplicate detection

✓ Duplicate merge

✓ Rename handling

✓ Replacement handling

✓ Historical organization preservation
```

## Organization Relationships

```text
✓ Parent-child relationships

✓ Complex relationships

✓ Country office relationships

✓ Regional office relationships

✓ Project relationships

✓ Organization merge relationships

✓ Organization replacement relationships
```

## Tender Integration

```text
✓ Multiple organizations per tender

✓ Procuring entity

✓ Implementing agency

✓ Funding organization

✓ Project owner

✓ Client

✓ Beneficiary

✓ Regulator

✓ Technical partner
```

## Tender Intelligence

```text
✓ Tender discovery tracking

✓ Tender analysis tracking

✓ Go / No-Go tracking

✓ Submission tracking

✓ Award tracking

✓ Loss tracking

✓ Decline reason analysis

✓ Category analysis

✓ Requirement analysis

✓ Historical tender patterns
```

## Analytics

```text
✓ Organization statistics

✓ Tender funnel

✓ Parent organization aggregation

✓ Child organization aggregation

✓ Organization comparison

✓ Monitoring priority

✓ Opportunity score

✓ Relevance analysis

✓ Tender frequency analysis
```

## Administration

```text
✓ Organization management

✓ Hierarchy management

✓ Alias management

✓ Relationship management

✓ Merge management

✓ Rename management

✓ Source verification

✓ Bulk import

✓ Seed data import
```

## Data Protection

```text
✓ Preserve historical tender relationships

✓ Prevent unsafe organization deletion

✓ Archive organizations

✓ Maintain merge history

✓ Maintain rename history

✓ Maintain replacement history

✓ Audit important changes
```

---

# 63. Final Design Goal

The Organization Intelligence module must become a reusable master intelligence layer for the Tender Tracker.

It must support:

```text
Organization Discovery
        ↓
Organization Identification
        ↓
Organization Matching
        ↓
Tender Source Tracking
        ↓
Tender Analysis
        ↓
Organization Performance Analysis
        ↓
Historical Tender Intelligence
        ↓
Opportunity Prediction
        ↓
Strategic Tender Monitoring
```

The system should identify not only the organization named in a tender but also its complete organizational context.

Example:

```text
Tender
        ↓
Procuring Entity

UNDP Bangladesh
        ↓
UNDP
        ↓
UN Funds and Programmes
        ↓
United Nations System
```

Or:

```text
Tender
        ↓
Procuring Entity

Department
        ↓
Division
        ↓
Ministry
        ↓
Government of Bangladesh
```

---

# 64. Ultimate Business Value

Over time, every tender entered into the Tender Tracker will contribute to organizational intelligence.

The system should help management understand:

```text
WHO PUBLISHES THE MOST TENDERS?

WHO PUBLISHES THE MOST RELEVANT TENDERS?

WHO DO WE ANALYZE MOST OFTEN?

WHICH ORGANIZATIONS DO WE FREQUENTLY DECLINE?

WHY DO WE DECLINE THEM?

WHICH ORGANIZATIONS HAVE THE HIGHEST GO RATE?

WHICH ORGANIZATIONS DO WE SUBMIT TO MOST?

WHICH ORGANIZATIONS HAVE THE HIGHEST WIN RATE?

WHICH ORGANIZATIONS SHOULD WE MONITOR MORE?

WHICH ORGANIZATIONS SHOULD WE MONITOR LESS?

WHAT REQUIREMENTS SHOULD WE PREPARE IN ADVANCE?
```

The final system must function as:

# Organization Intelligence + Procurement Intelligence Database

It should transform historical tender data into actionable business intelligence that improves:

```text
Tender Selection

Tender Monitoring

Tender Analysis

Go / No-Go Decisions

Bid Preparation

Document Readiness

Organization Prioritization

Resource Allocation

Win Strategy

Long-Term Procurement Planning
```

---

# END OF MASTER SPECIFICATION