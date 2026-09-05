# TenderTracker Command Center — Frontend Architecture (v2.9.0)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

The frontend client for the **TenderTracker Command Center** is a high-density, mission-critical Single Page Application (SPA) built for public procurement teams, bid managers, and Joint Venture partners. It adheres strictly to the **Ponytail** ("Lazy Senior Dev") generation-time optimization philosophy to maximize performance, reduce token footprint, and maintain radical architectural conciseness.

---

## 🎨 Theme Engine & Dark Mode Architecture

The frontend implements a comprehensive, **CSS-only WCAG AA dark mode theme** driven by design tokens in [`src/index.css`](file:///h:/Tender%20tracker%20v2/frontend/src/index.css).

### Design Tokens (CSS Custom Properties)

```css
:root {
  --bg-canvas: #0B0F17;
  --bg-surface: #131B28;
  --bg-surface-raised: #1A2436;
  --bg-subtle: #172030;
  --bg-muted: #212D42;
  --bg-hover: #1E2A3E;
  --bg-input: #101724;
  --bg-dropdown: #151E2E;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-raised: rgba(255, 255, 255, 0.18);
  --text-primary: #F1F5F9;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;
  --accent-cyan: #06B6D4;
}
```

### Key Highlights
- **Zero Markup Touched:** 100% of dark mode styling is contained within CSS rules and custom properties — requiring zero changes to component JSX or DOM hierarchy.
- **Dual Unescaped Selectors:** Overcomes the Tailwind compiler's bracket-escaping defect (`[class*="text-\\[\\#0F172A\\]"]`) with dual selectors (`[class*="text-[#0F172A]"], .text-\[\#0F172A\]`), guaranteeing high-contrast text readability ($\ge 14:1$).
- **Translucent Tints:** Converts 258+ harsh light-pastel alert and badge backgrounds into rich 18% alpha dark tints with luminous borders.
- **System Dark Auto-Detection:** Standalone external routes (e.g. `/partner/portal`, `/shared/:token`) render seamlessly in dark mode via native `@media (prefers-color-scheme: dark)` fallback even when outside `<AppLayout />`.

---

## 📁 Directory Structure

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          # Main shell with responsive sidebar & header
│   │   ├── Header.tsx             # Breadcrumbs, quick search trigger, live alert badge
│   │   ├── Sidebar.tsx            # Collapsible navigation with Tools & Addons accordion
│   │   └── CommandPalette.tsx     # Ctrl+Shift+K modal with keyboard navigation
│   └── ui/                        # Reusable modals, pills, and badges
├── context/
│   ├── TenderContext.tsx          # Central reactive state engine & localStorage sync
│   └── ThemeContext.tsx           # Global dark/light theme state & toggle hook
├── pages/
│   ├── DashboardPage.tsx          # Executive command center & 6-gate breakdown
│   ├── TenderListPage.tsx         # Filterable pipeline table, batch CSV/JSON import
│   ├── TenderRegistryPage.tsx     # 2-pane master-detail tender specification editor
│   ├── TenderSummaryPage.tsx      # Formal 3-page printable RFP summary
│   ├── TenderDetailPage.tsx       # Proposal workspace, 6-gate ribbon, Sentinel checklist
│   ├── PartnerPortalPage.tsx      # Authenticated JV partner workspace
│   ├── MasterDocumentVaultPage.tsx# Corporate credential library with 4-tier RBAC
│   ├── MasterPermissionsPage.tsx  # RBAC permission simulator & audit trail
│   ├── OrganizationsPage.tsx      # Procuring entity catalog & tree view
│   ├── ArchivedTendersPage.tsx    # Soft-deleted bid archive and purge console
│   ├── SharedDocumentPortalPage.tsx# Tokenized external auditor download portal
│   ├── ChatDiscussionsPage.tsx    # Channel & proposal threaded discussions
│   ├── NotificationsPage.tsx      # Real-time operational alert stream
│   ├── CalendarPage.tsx           # Monthly grid & chronological timeline calendar
│   ├── ReportsPage.tsx            # 3-tier analytics intelligence console
│   ├── TeamAllocationPage.tsx     # Workload capacity matrix
│   ├── MyTasksPage.tsx            # Cross-tender personal deliverable checklist
│   ├── SettingsPage.tsx           # Storage paths, SLA alerts, SMTP configuration
│   ├── LoginPage.tsx              # Dual-mode internal & partner portal login
│   └── tender-tabs/               # Proposal workspace sub-tabs
│       ├── TenderRequirementsTab.tsx
│       ├── TenderTasksTab.tsx
│       ├── TenderDocumentsTab.tsx
│       ├── TenderPartnersTab.tsx   # Time-bounded partner access duration controls
│       ├── TenderReviewTab.tsx
│       ├── TenderSubmissionTab.tsx
│       └── TenderResultTab.tsx
├── router.tsx                     # 25-route React Router v6 configuration
├── main.tsx                       # React root entrypoint
└── index.css                      # Global styles, Tailwind directives, dark theme tokens
```

---

## 🛠️ Development & Build Commands

```bash
# Install dependencies
npm install

# Start Vite HMR dev server (default: http://127.0.0.1:5173/)
npm run dev

# Run TypeScript type-checker without emitting
npm run build --noEmit

# Compile production bundle with tree-shaking
npm run build

# Run Oxlint / ESLint linter
npm run lint
```

---

## 🔒 Security & Access Ceilings

- **Strict JV Partner Isolation:** External partners access only their assigned scopes via `/partner/portal` with no access to internal dashboards or financial models.
- **Client-Side Token Validation:** Shared links (`/shared/:token`) validate against `/api/documents/share/{token}` before unlocking document views.
- **Cryptographic Watermarking:** External document downloads enforce watermarking to prevent unauthorized redistribution.
