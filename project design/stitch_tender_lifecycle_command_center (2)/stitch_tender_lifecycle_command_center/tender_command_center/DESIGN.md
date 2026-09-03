---
name: Tender Command Center
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#25005a'
  on-tertiary-container: '#9863ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-expanded: 16rem
  sidebar-collapsed: 4.5rem
  header-height: 3.5rem
  gutter-xs: 0.25rem
  gutter-sm: 0.5rem
  gutter-md: 0.75rem
  gutter-lg: 1rem
  gutter-xl: 1.5rem
  container-padding-desktop: 1.5rem
  container-padding-mobile: 1rem
  row-gap-dense: 0.375rem
---

## Brand & Style

This design system is engineered for mission-critical tender lifecycle management, procurement oversight, and enterprise bidding operations. It communicates uncompromising precision, institutional stability, and rapid situational awareness.

The design philosophy adopts a high-density **Corporate / Modern Data-Dense** aesthetic:
- Utilitarian efficiency dominates over decorative whitespace. Visual noise is minimized to prioritize cognitive speed under tight submission deadlines.
- Deep, anchor-weight navy navigations establish authoritative structure, while crisp, surgical content surfaces keep complex tables and analytics readable.
- High-visibility chromatic status indicators provide instant operational state awareness across high-stakes procurement pipelines.

## Colors

The palette balances a rigorous architectural dark framework with pristine light data surfaces and deliberate, functional status codes.

### Foundation & Surfaces
- **Canvas Base (`#F8FAFC`)**: Light slate backdrop for dashboard canvas and workspaces.
- **Surface Elevation 1 (`#FFFFFF`)**: Pure white for primary metric tiles, data tables, sheets, and modal views.
- **Surface Elevation 2 (`#F1F5F9`)**: Soft neutral grey for table row alternations, inactive tab states, inner pill wells, and nested containers.
- **Borders & Dividers (`#E2E8F0`)**: Crisp, subtle hairline borders providing structural isolation without heavy line weight.

### Structural Brand Accents
- **Primary / Shell (`#0F172A`)**: Deep void navy for primary navigation sidebars, mastheads, and primary action CTAs.
- **Shell Elevated (`#1E293B`)**: Mid-tone slate navy for active sidebar items, sub-navigation clusters, and command palettes.
- **Secondary (`#2563EB`)**: Royal Blue for primary interactive targets, links, and discovery-phase milestones.
- **Tertiary (`#7C3AED`)**: Electric Purple designated for analysis, compliance audit scoring, and legal reviews.

### Operational Lifecycle Tokens
- **Discovery / Info (`#2563EB`)**: Initial tender ingestion, intelligence, and notifications.
- **Analysis / Review (`#7C3AED`)**: Technical qualification, scoring, and viability indexing.
- **Preparation (`#D97706`)**: Drafting responses, cost modeling, and proposal collation.
- **Attention (`#EA580C`)**: Clarification questions pending, executive review bottlenecks.
- **Critical / Deadline (`#DC2626`)**: SLA breaches, submission windows < 24h, compliance blockers.
- **Success / Won (`#16A34A`)**: Contract awards, sign-offs, criteria validated.
- **Archived / Dormant (`#64748B`)**: Superseded tenders, historical benchmarks, cancelled RFPs.

## Typography

The typographic hierarchy couples geometric authority with maximum data legibility:
- **Plus Jakarta Sans** serves as the executive display and section header typeface, providing high contrast and modern structure.
- **Inter** handles all narrative text, dashboard data columns, forms, and table rows, ensuring neutrality and clean scanning at 12px–14px sizes.
- **JetBrains Mono** is mandatory for all RFP reference codes (e.g., `TND-2025-EU-892`), monetary figures, countdown timers, and strict submission timestamps to eliminate variable-width scanning errors.

## Layout & Spacing

The layout is built around a persistent primary command shell with a flexible multi-tier responsive structure.

### Layout Mechanics
- **Primary Shell**: A fixed dark navy sidebar (`#0F172A`) pinned to the left, collapsible from 256px (`sidebar-expanded`) down to 72px (`sidebar-collapsed`).
- **Main Command Canvas**: Dynamic fluid grid conforming to a 12-column system, expanding across high-resolution displays up to a 1920px safe container, with 24px column gutters and 24px outer margins.
- **Inspector / Quick Detail Rail**: Optional right-hand 380px contextual panel that docks alongside main tables for fast tender triage without page transitions.

### Density & Breakpoints
- **Desktop (1280px+)**: Full 12-column grid. Standard 8pt baseline adjusted to 4pt micro-spacing for high-density tabular metadata.
- **Tablet / Laptop (768px - 1279px)**: Sidebar auto-collapses to icon mode (72px). Metric grids collapse from 4 columns to 2 columns. Table scrolls horizontally with pinned primary identifier columns.
- **Mobile (< 768px)**: Off-canvas navigation drawer. Metric ribbons convert into single-column KPI stacks. Complex tables shift to segmented card stacks.

## Elevation & Depth

This system avoids heavy drop shadows in favor of crisp architectural planes, deliberate perimeter definitions, and micro-diffused ambient lift.

- **Level 0 (Base Canvas)**: Flat `#F8FAFC`, non-elevated.
- **Level 1 (Cards, Modules, Tables)**: Pure `#FFFFFF` background with a crisp `1px solid #E2E8F0` border and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hover States, Popovers, Dropdowns)**: Elevated panels bounded by `#CBD5E1` and lifted with `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modals, Command Center Palette, Drawers)**: Deep focus elevation `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)` backed by an ambient backdrop veil of `rgba(15, 23, 42, 0.5)`.

## Shapes

The design uses a clean **Soft (0.25rem / 4px)** baseline shape language to reflect precision, engineering rigor, and maximum tabular real estate.

- **Data Cells, Form Fields, Tables, and Buttons**: Styled with `rounded` (4px / 0.25rem) or `rounded-md` (6px / 0.375rem) to maintain sharp operational edges.
- **Cards, Modals, and Modules**: Capped at `rounded-lg` (8px / 0.5rem).
- **Status Chips, Lifecycle Badges, and Metric Indicators**: Fully pill-shaped (`rounded-full` / 9999px) to visually differentiate status meta-tags from clickable rectangular buttons and input fields.

## Components

### Buttons
- **Primary CTA**: `#0F172A` navy surface with white text, font weight 600, 4px corner radius, hover state `#1E293B`.
- **Accent Action**: `#2563EB` solid fill with white text for positive progression steps ("Submit Bid", "Qualify Lead").
- **Secondary / Outline**: `#FFFFFF` fill with `1px solid #E2E8F0` border, `#0F172A` text, hovering to `#F8FAFC` background with `#CBD5E1` border.
- **Destructive**: `#DC2626` background, white text, 4px radius.

### Rich Status Chips & Badges
- Strict pill architecture (`rounded-full`) with uppercase or semi-bold micro-labels (`label-sm`).
- **Discovery**: Blue background tint (`#EFF6FF`), text `#1D4ED8`, border `1px solid #BFDBFE`.
- **Analysis**: Purple background tint (`#F5F3FF`), text `#6D28D9`, border `1px solid #DDD6FE`.
- **Preparation**: Amber background tint (`#FFFBEB`), text `#B45309`, border `1px solid #FDE68A`.
- **Attention**: Orange background tint (`#FFF7ED`), text `#C2410C`, border `1px solid #FED7AA`.
- **Critical / Urgent**: Red background tint (`#FEF2F2`), text `#B91C1C`, border `1px solid #FECACA`. Pulsing 6px dot indicator for deadlines < 12h.
- **Won / Ready**: Green background tint (`#F0FDF4`), text `#15803D`, border `1px solid #BBF7D0`.

### Cards & Modules
- Clean `#FFFFFF` fill with a `1px solid #E2E8F0` outline and subtle Level 1 ambient lift.
- Header bands integrate tender reference codes set in `code-md` along with the pill status badge and a contextual three-dot action trigger.
- Body incorporates bid valuation, issuing entity, submission deadline countdown, and a structured milestone progress strip.

### Progress Bars & Milestone Trackers
- Base track: 6px high, `rounded-full`, fill `#E2E8F0`.
- Indicator fill: Chromatically paired to stage color (e.g., preparation is `#D97706`, submission-ready is `#16A34A`).
- Accompanied by right-aligned, monospaced tabular percentage readout (`JetBrains Mono`, 11px, weight 600).

### Data Tables & Tender Rows
- Header row uses `#F8FAFC` background, uppercase `11px` typography, `letterSpacing: 0.05em`, color `#64748B`, with explicit sorting toggles.
- Row padding: compact 10px vertical padding; alternating zebra option `#F8FAFC` on hover.
- Cell dividers: `1px solid #F1F5F9`. Critical deadlines feature high-contrast monospaced countdown pills.

### Quick Action Toolbars
- Floating or inline docking bar with `#FFFFFF` background, `rounded-md`, containing icon-only and compact label controls for bulk exports, stage transitions, assignment re-routing, and deadline extensions.