# Implementation Plan — Milestone 4: Frontend Foundation & Design System

Scaffold the frontend application using React 18, Vite, TypeScript, and Tailwind CSS. Implement the enterprise design system specified in `DESIGN.md`, the collapsible command center shell, complete route hierarchy for all 17 core screens, and shared foundational UI primitives adhering to Ponytail guidelines (no bloat, high reuse).

---

## User Review Required

> [!IMPORTANT]
> **Icons Strategy**: The prototype HTML files utilize Google Material Symbols via web font. In a React/Vite production setup, using `lucide-react` provides tree-shaken, zero-runtime SVG icons that avoid layout shifts and webfont dependencies. We will use `lucide-react` for standard icons while preserving the exact layout, sizes, and styling defined in `DESIGN.md`.

> [!NOTE]
> **Mock Data Engine**: Since Backend (M2/M3) will be built next, M4 will introduce a typed mock data layer (`src/mock/tenders.ts`) reflecting the active \$48.5M pipeline (UNDP, World Bank, ADB, Sovereign) so every screen renders with realistic data immediately.

---

## Proposed Changes

### 1. Frontend Scaffolding & Configuration

#### [NEW] [`frontend/package.json`](file:///h:/Tender%20tracker%20v2/frontend/package.json)
- Vite + React + TypeScript baseline.
- Minimal, essential dependencies: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`.
- Dev dependencies: `vite`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`.

#### [NEW] [`frontend/vite.config.ts`](file:///h:/Tender%20tracker%20v2/frontend/vite.config.ts)
- Vite configuration with `@vitejs/plugin-react` and path aliases (`@/` -> `src/`).

#### [NEW] [`frontend/tailwind.config.js`](file:///h:/Tender%20tracker%20v2/frontend/tailwind.config.js)
- Direct mapping of `DESIGN.md` color tokens, typography scales, spacing variables, and border radiuses:
  - **Colors**: Canvas Base (`#F8FAFC`), Surface (`#FFFFFF`), Shell Navy (`#0F172A`), Shell Elevated (`#1E293B`), Secondary Blue (`#2563EB`), Error/Urgent (`#DC2626`, `#BA1A1A`), Success/Won (`#16A34A`), Warning (`#D97706`).
  - **Typography**: Display (`Plus Jakarta Sans`), Body (`Inter`), Monospace (`JetBrains Mono`).
  - **Spacing**: `w-sidebar-expanded` (16rem), `w-sidebar-collapsed` (4.5rem), `h-header-height` (3.5rem).

#### [NEW] [`frontend/src/index.css`](file:///h:/Tender%20tracker%20v2/frontend/src/index.css)
- Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
- Font imports (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`).
- Custom utility classes for badge pills, monospaced countdown timers, and custom scrollbar styles.

---

### 2. App Shell & Layout Components

#### [NEW] [`frontend/src/components/layout/AppLayout.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/AppLayout.tsx)
- Main layout wrapper containing the fixed collapsible sidebar, top navigation header, and fluid content viewport.

#### [NEW] [`frontend/src/components/layout/Sidebar.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Sidebar.tsx)
- Persistent dark navy sidebar (`#0F172A`) supporting expanded (256px) and collapsed (72px) states.
- Branding header with TenderTracker emblem and version badge (`v2.1`).
- Navigation links organized into Command Navigation (Dashboard, My Tasks, Tenders, Calendar, Documents, Team, Reports) and System (Settings).
- Bottom pipeline health gauge (84% health widget) and collapse toggle.

#### [NEW] [`frontend/src/components/layout/Header.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/layout/Header.tsx)
- Fixed top masthead (`#FFFFFF` with backdrop blur, height `3.5rem`).
- Global search input with `Ctrl + K` / `⌘K` badge.
- "+ New Tender" primary CTA (`#0F172A`), "AI Assistant" trigger, notification indicator badge (with pulse animation), and user profile avatar (`Sarah Jenkins`, Senior Bid Operations Director).

---

### 3. Shared UI Primitives (Ponytail-Optimized)

#### [NEW] [`frontend/src/components/ui/StatusBadge.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/StatusBadge.tsx)
- Semantic pill badge with strict lifecycle token mapping:
  - `DISCOVERED` (Blue tint)
  - `SCREENING` (Indigo tint)
  - `UNDER_ANALYSIS` (Purple tint)
  - `PREPARATION` (Amber tint)
  - `INTERNAL_REVIEW` (Orange tint)
  - `SUBMITTED` (Slate tint)
  - `AWARDED` / `WON` (Green tint)
  - `DECLINED` / `LOST` (Red tint)

#### [NEW] [`frontend/src/components/ui/UrgencyBadge.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/UrgencyBadge.tsx)
- JetBrains Mono monospaced countdown badge with pulsing red dot indicator for deadlines `< 24h` / `< 72h`.

#### [NEW] [`frontend/src/components/ui/ReadinessBar.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/ReadinessBar.tsx)
- Dynamic submission readiness score progress bar with stage-paired color grading.

#### [NEW] [`frontend/src/components/ui/Card.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/components/ui/Card.tsx)
- Elevation Level 1 card wrapper with clean hairline border (`#E2E8F0`) and standard padding.

---

### 4. Router & 17 Screen Stubs

#### [NEW] [`frontend/src/router.tsx`](file:///h:/Tender%20tracker%20v2/frontend/src/router.tsx)
- React Router DOM configuration mapping all 17 routes defined in `knowledge_graph.md`:
  - `/` -> Redirect to `/dashboard`
  - `/login` -> Standalone auth screen (outside AppLayout)
  - `/dashboard` -> `DashboardPage`
  - `/tasks/my-tasks` -> `MyTasksPage`
  - `/tenders` -> `TenderListPage`
  - `/tenders/:id` -> `TenderDetailPage` (with nested tab layout)
  - `/tenders/:id/analysis` -> `TenderAnalysisPage`
  - `/tenders/:id/requirements` -> `TenderRequirementsPage`
  - `/tenders/:id/tasks` -> `TenderTasksPage`
  - `/tenders/:id/documents` -> `TenderDocumentsPage`
  - `/tenders/:id/review` -> `TenderReviewPage`
  - `/tenders/:id/submission` -> `TenderSubmissionPage`
  - `/tenders/:id/result` -> `TenderResultPage`
  - `/team` -> `TeamAllocationPage`
  - `/calendar` -> `CalendarPage`
  - `/reports` -> `ReportsPage`
  - `/notifications` -> `NotificationsPage`
  - `/settings` -> `SettingsPage`

#### [NEW] [`frontend/src/mock/tenders.ts`](file:///h:/Tender%20tracker%20v2/frontend/src/mock/tenders.ts)
- Type definitions and baseline dataset representing real active bids ($48.5M active pipeline, urgent closing bids, blocker counts, compliance scores).

---

## Verification Plan

### Automated Verification
- Run `npm run build` in `frontend/` to confirm zero TypeScript compile errors, valid imports, and successful Vite bundling.
- Run `npm run lint` (if configured) or TypeScript check (`npx tsc --noEmit`).

### Manual & Interactive Verification
- Launch local development server (`npm run dev`) on `http://localhost:5173`.
- Verify:
  1. Collapsible sidebar expands (256px) and collapses (72px) cleanly.
  2. Top search bar, quick action button, and user header render accurately.
  3. Navigation through all 17 routes loads corresponding page shells with correct titles, breadcrumbs, and layout without 404s.
  4. Design tokens match `DESIGN.md` (colors, fonts, radii, spacing).
