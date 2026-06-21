# Keehoo ERP Hub — UI/UX & Design System Specification

**Stack:** TanStack Start · React 19 · Tailwind CSS v4 · shadcn/ui  
**Audience:** Product, design, and engineering  
**Version:** 1.0

---

## 1. Design Principles

### 1.1 Density without clutter
Operational users process hundreds of rows per session. Default to **compact** spacing (32–36px row height, 13px table text). Whitespace is earned — use it for hierarchy, not decoration. Group related controls; avoid orphan buttons.

**UI decisions:** Single unified panel per workflow (banner → filters → table → pagination). No floating card stacks.

### 1.2 Progressive disclosure
Show the minimum viable context first; reveal detail on demand via drawers, expandable rows, and secondary panels. Never force multi-step modals for simple edits.

**UI decisions:** List → drawer detail → inline approve. Settings use `FormSection` accordion groups.

### 1.3 Command-center efficiency
Keyboard-first flows: ⌘K palette, tab order through filters, `j/k` row navigation (future), bulk actions on selection. Mouse paths ≤ 2 clicks for approve/reject.

**UI decisions:** Global search in topbar; batch actions appear only when rows selected.

### 1.4 Calm confidence
Neutral surfaces dominate (80%+). Indigo/violet reserved for primary actions, focus, active nav, and AI. No gradients on data surfaces. Motion is fast and functional.

**UI decisions:** Status via semantic pills, not full-row color floods.

### 1.5 Accessibility-first
Contrast, focus visibility, and screen reader labels are non-negotiable — not retrofitted. Tables expose sort state; forms bind errors to fields.

**UI decisions:** Visible focus rings (`--color-ring`); `aria-sort` on headers; live regions for toast/batch results.

---

## 2. Color System (oklch)

Tokens live in `src/styles/tokens.css`. **Never hardcode hex in components.**

### 2.1 Background hierarchy

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-bg-app` | L: 0.975 | D: 0.19 | Page canvas |
| `--color-bg-surface` | L: 0.995 | D: 0.25 | Topbar, sidebar |
| `--color-bg-card` | L: 1.0 | D: 0.25 | Panels, tables |
| `--color-bg-elevated` | L: 1.0 | D: 0.30 | Popovers, dropdowns |
| `--color-bg-muted` | L: 0.955 | D: 0.28 | Table header, zebra |
| `--color-bg-inset` | L: 0.94 | D: 0.22 | Code blocks, wells |

### 2.2 Foreground hierarchy

| Token | Use |
|-------|-----|
| `--color-fg-primary` | Titles, primary cell data |
| `--color-fg-secondary` | Descriptions, secondary columns |
| `--color-fg-muted` | Labels, metadata, age columns |
| `--color-fg-disabled` | Disabled controls |
| `--color-fg-inverse` | Text on primary buttons |

### 2.3 Semantic colors

| Role | Light oklch | Dark oklch | Subtle bg |
|------|-------------|------------|-----------|
| Primary | 0.52 0.19 270 | 0.58 0.20 270 | — |
| AI | 0.58 0.18 295 | 0.62 0.18 295 | `--color-ai-subtle` |
| Success | 0.62 0.17 155 | 0.68 0.17 155 | `--color-success-subtle` |
| Warning | 0.72 0.16 75 | 0.78 0.14 75 | `--color-warning-subtle` |
| Info | 0.68 0.14 230 | 0.72 0.12 230 | `--color-info-subtle` |
| Destructive | 0.58 0.22 25 | 0.62 0.22 25 | `--color-destructive-subtle` |

### 2.4 Borders

- **Soft:** dividers inside panels  
- **Default:** panel outlines, inputs  
- **Strong:** focus-adjacent emphasis  

Dark mode uses **alpha white borders** (not gray hex) for optical consistency.

### 2.5 Charts & data viz

Use `--color-chart-1` … `--color-chart-6` (categorical).  
- Never encode meaning by color alone — pair with labels/patterns.  
- Positive trends: success; negative: destructive; neutral: muted.  
- Grid lines: `--color-divider` at 40% opacity.

### 2.6 Dark mode inversion rules

1. **Do not** invert lightness linearly — preserve surface steps (4 levels).  
2. **Reduce** shadow opacity; increase border alpha instead.  
3. **Desaturate** subtle backgrounds (~30% less chroma).  
4. **Keep** semantic hues stable; adjust lightness for contrast.  
5. **Primary** gets +0.06 lightness in dark for button legibility.  
6. Activate via `[data-theme="keehoo"]` or `.dark` on `<html>`.

---

## 3. Typography

### 3.1 Font families

| Role | Family | Why |
|------|--------|-----|
| UI | IBM Plex Sans (+ Geist fallback) | Enterprise legibility, not overused Inter-default |
| Data / ID / Code | IBM Plex Mono | Tabular IDs, amounts, JSON |

### 3.2 Type scale

| Token | Size | Weight | Line height | Use |
|-------|------|--------|-------------|-----|
| `text-2xs` | 10px | 500 | 1.35 | Micro badges, keyboard hints |
| `text-label` | 12px | 500 | 1.35 | Column headers, form labels |
| `text-table` | 13px | 500 | 1.4 | Table body (default density) |
| `text-body` | 14px | 400 | 1.5 | Body, buttons, inputs |
| `text-body-lg` | 16px | 400 | 1.5 | Long-form, relaxed density |
| `text-section` | 18px | 600 | 1.35 | Card titles, section headers |
| `text-h3` | 22px | 600 | 1.25 | Module subtitles |
| `text-h2` | 28px | 600 | 1.2 | Page titles (operational) |
| `text-h1` | 32px | 700 | 1.15 | Primary page titles |
| `text-hero` | 48px | 700 | 1.1 | Marketing only — not in ERP shell |

### 3.3 Usage rules

- **Headings:** Sentence case in app chrome; uppercase only for 12px labels.  
- **Tabular data:** `font-mono` + `tabular-nums` for IDs, amounts, dates.  
- **Table headers:** `text-label`, uppercase, muted color — never bold body size.  
- **Max line length:** 72ch for descriptions; table cells truncate with tooltip.

---

## 4. Layout & Spacing

### 4.1 Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px — tokens `--space-1` through `--space-16`.

### 4.2 Page shell

```
┌─ Topbar 64px ─────────────────────────────────────────┐
├─ Sidebar 264px ─┬─ Main (padding 32px) ─────────────┤
│                  │  WorkspacePage                     │
│                  │  └─ Panel (unified)                │
├──────────────────┴─ Status strip 36px ────────────────┤
```

Components: `src/components/keehoo/` (alias target: `src/components/shell/`)

### 4.3 Density modes

| Mode | Row height | Cell padding | Font |
|------|------------|--------------|------|
| Compact (default) | 36px | 8px 16px | 13px |
| Relaxed | 48px | 14px 16px | 14px |

Empty states and marketing use relaxed; ERP tables default compact.

### 4.4 Grid

12-column `.enterprise-grid`, gap 16px. Stat widgets span `col-span-3`; filters `col-span-12`.

### 4.5 Responsive breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `<768px` | Sidebar → drawer; table scroll |
| `768–1023px` | Hide tertiary columns |
| `1024–1279px` | Full sidebar, hide requester |
| `≥1280px` | Full layout |

---

## 5. Component Library

### 5.1 Buttons

| Variant | Use |
|---------|-----|
| **Primary** | One per view: Submit, Batch approve, Save |
| **Secondary** | Export, Filter apply — outline on surface |
| **Ghost** | Toolbar icons, pagination, table row actions |
| **Destructive** | Delete, Reject — requires confirmation |
| **Icon-only** | 32×32 in tables; must have `aria-label` |

Height: **36px** default (`h-9`); 32px in dense toolbars.

### 5.2 Inputs & forms

- Height 36px; label above field (`text-label`).  
- Error: border destructive + message below (`role="alert"`).  
- Groups: `FormSection` with title + 16px internal gap.  
- Date/range: popover calendar; never native picker in dense tables.

### 5.3 Tables

- `Table variant="workspace"` — sticky header, sort buttons, selection column.  
- Hover: muted overlay 4%; selected: primary 8% tint.  
- Status: dot + uppercase pill in semantic subtle bg.  
- Inline actions: ghost icon cluster at row end (visible on hover/focus).

### 5.4 Cards & stat widgets

- Border + `--shadow-panel`; no glass.  
- Stat: label (12px muted) → value (22px semibold tabular) → delta pill.  
- Left accent bar 4px for KPI category color.

### 5.5 Overlays

| Pattern | Use |
|---------|-----|
| **Modal** | Destructive confirm, short forms ≤5 fields |
| **Drawer (480px)** | Record detail, approval context |
| **Command palette** | ⌘K — search, navigate, run workflow |
| **Toast** | Async success/failure; 4s auto dismiss |
| **Dropdown** | Row actions, user menu |

### 5.6 Navigation

- **Tabs:** underline active indicator; counts in muted pills.  
- **Breadcrumbs:** `Module · Submodule` — 12px uppercase muted.  
- **Pagination:** "Showing X–Y of Z" + numbered pages.

### 5.7 Feedback

- **Empty:** icon + one-line reason + primary action.  
- **Skeleton:** table row placeholders; no shimmer > 1.5s.

---

## 6. Iconography

- **Library:** Lucide (stroke 1.5–2px).  
- **Sizes:** 14px inline label; 16px buttons/nav; 20px empty states.  
- **Color:** inherit `currentColor`; semantic only for status dots.  
- **Don't:** decorative icons in every column header; animated icons in tables.

---

## 7. Motion & Micro-interactions

| Token | Value |
|-------|-------|
| Fast | 120ms |
| Normal | 200ms |
| Slow | 320ms |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |

- **Hover:** background only — no scale on rows.  
- **Focus:** instant ring — no animation.  
- **Drawer:** slide 200ms; overlay fade 120ms.  
- **Command palette:** scale 0.98→1 + fade 120ms.  
- **`prefers-reduced-motion`:** disable transitions (see tokens.css).

---

## 8. Accessibility

| Requirement | Standard |
|-------------|----------|
| Text contrast | WCAG 2.2 AA (4.5:1 body, 3:1 large) |
| Focus | 2px ring `--color-ring`; never `outline: none` without replacement |
| Keyboard | All actions reachable; roving tabindex in tables |
| Screen readers | `aria-label` on icon buttons; `aria-sort` on headers |
| Forms | `aria-invalid`, `aria-describedby` for errors |
| Motion | `prefers-reduced-motion` respected |

---

## 9. ERP-Specific Patterns

### 9.1 Approval queue (canonical screen)

`WorkspacePage` → tabs by status → AI hint (optional) → filters → table → batch approve → status bar.

### 9.2 Module consistency

Finance, HR, CRM, Procurement share: same shell, same table variant, same drawer width, same status pill vocabulary.

### 9.3 AI integration

- **Passive:** runtime indicator in topbar.  
- **Active:** `ai-hint` banner max 1 per view; ⌘K suggestions.  
- **Never:** full-screen chat as default landing.

### 9.4 Global search & launcher

Topbar search + app grid (module switcher). Results grouped: Workflows · Records · People · Settings.

---

## 10. Before / After Examples

### Example A — Finance approval table

**Before:** Floating white cards, 48px row height, rainbow status badges, actions buried in ⋮ menu, no bulk approve.

**After:** Unified dark panel, 36px rows, monospace IDs, AI bottleneck banner, filters inline, checkbox + Batch approve, sticky headers, status strip with workflow engine state.

### Example B — Employee directory

**Before:** Card grid of employees, 3 columns, search on separate page, no density control.

**After:** Compact table (Name · Dept · Role · Manager · Status · Last active), saved views ("My team", "Onboarding"), drawer for profile on row click, Export in header.

### Example C — Analytics dashboard

**Before:** Large gradient hero, 6 oversized chart cards with drop shadows, no drill-down.

**After:** 12-col grid: 4 KPI stat widgets (compact) → 2 chart panels using `--color-chart-*` → table of anomalies below with "Investigate" drawer link. No gradients on chart backgrounds.

---

## 11. File Deliverables

| File | Action |
|------|--------|
| `src/styles/tokens.css` | **Create** — oklch semantic tokens (light + dark) |
| `src/index.css` | **Update** — `@import "./styles/tokens.css"` |
| `src/styles.css` | **Create** — Tailwind v4 entry (future migration) |
| `src/components/shell/` | **Alias/create** — `KeehooShell`, `Topbar`, `Sidebar`, `StatusBar` |
| `src/components/workspace/` | **Keep** — `WorkspacePage`, `FormSection`, `WorkspaceStatusBar` |
| `src/components/ui/*.tsx` | **Audit** — shadcn primitives use semantic tokens only |
| `docs/ERP-DESIGN-SYSTEM-SPEC.md` | **This file** |
| `docs/KEEHOO-DESIGN-SYSTEM.md` | **Reference** — quick token lookup |

### Live reference routes

- Dark operational: `/keehoo`  
- Light service queue: `/business-connect/services/list`

---

## 12. Implementation checklist

- [ ] Import `tokens.css` in app entry  
- [ ] Migrate hardcoded `bg-white`, `text-2xl font-bold` to tokens  
- [ ] All tables use `variant="workspace"`  
- [ ] All module pages use `WorkspacePage` shell  
- [ ] ⌘K command palette component  
- [ ] `prefers-reduced-motion` verified  
- [ ] Contrast audit on dark theme (primary on surface)
