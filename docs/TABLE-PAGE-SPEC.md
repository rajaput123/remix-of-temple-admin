# Table & Main Content Page — Design Spec

Use this when building or refining any data-table page (Approvals, Transactions, Employees, Requests, Accounts) in the Keehoo ERP shell.

**Reference implementation:** `/business-connect/services/list`  
**Components:** `src/components/workspace/*`, `src/components/ui/table.tsx`, `src/components/ui/status-pill.tsx`

---

## 1. Page Frame & Spacing Grid

Base unit: **4px**. Everything snaps to multiples of 4 (4, 8, 12, 16, 24, 32).

Page anatomy (top → bottom), **no outer page padding** — the shell already clips:

```
┌─ PageHeader (shrink-0, border-b)
│   • px-6  pt-4 pb-3                    ← header block
│   • eyebrow → title (mt-1) → desc (mt-0.5)
│   • tabs row: px-6, h-9 tabs, -mb-px
├─ AI / context banner (optional)
│   • mx-4 mt-4, rounded-lg, px-4 py-2.5
├─ Filter strip (border-b)
│   • px-4 py-3, gap-2, h-7 controls
├─ Table region (flex-1, overflow-auto)
│   • sticky thead, no outer padding — table goes edge-to-edge
└─ Pagination footer (border-t, bg-card)
    • px-4 py-2, text-xs
└─ Status strip (optional, fixed bottom)
    • Viewport-fixed via `WorkspacePage statusBar` — stays pinned while table scrolls
    • Content area gets `pb-9` so pagination is not covered
```

**Important:** Pass `statusBar={...}` to `WorkspacePage`. Do not render as a sibling — it will overlap pagination. The strip uses `fixed bottom-0` aligned to the main content area (`--shell-main-left` from `TempleLayout`).

### Vertical rhythm

| Transition | Rule |
|------------|------|
| Header → banner | `mt-4` on banner |
| Banner → filter | Filter strip provides its own `py-3` |
| Filter → table | Zero gap (`border-b` on strip is the divider) |
| Table → footer | Zero gap (`border-t` on footer is the divider) |

Never stack two `border-b` elements without a section in between.

### Horizontal rhythm

| Zone | Padding |
|------|---------|
| Header content | `px-6` |
| Everything below header | `px-4` (banner uses `mx-4`) |
| Table cells | `px-3`; checkbox column `px-4 w-8` |

Use `WorkspacePage` with `bleed` to counteract parent layout padding (`-mx-8 -my-6`).

---

## 2. Typography Scale

| Role | Size | Weight | Tracking | Color |
|------|------|--------|----------|-------|
| Eyebrow | 10px | 700 | 0.14em uppercase | muted |
| Page title | 18px (`text-lg`) | 600 | tight | foreground |
| Description | 12px | 400 | normal | muted |
| Tab label | 12px | 500 | normal | muted → foreground |
| Tab count | 10px mono | 500 | — | muted / primary/15 |
| Table header | 10px | 700 | wider uppercase | muted |
| Table cell | 12px | 400 | normal | foreground |
| ID / amount / age | 11–12px mono | 400 | tabular-nums | primary / foreground / muted |
| Status pill | 10px | 600 | — | tone-driven |

**Fonts:** Inter (UI), IBM Plex Mono (IDs, amounts, timestamps).

**Rules:** Never above `text-lg` in shell. Numbers always `font-mono tabular-nums`. Uppercase reserved for eyebrows, table headers, density toggle.

---

## 3. Table Anatomy

- **Container:** `TableRegion` — `flex-1 overflow-auto scrollbar-thin`
- **Table:** `variant="workspace" container={false}` — `min-w-[900px] border-collapse`
- **Header:** sticky `top-0 bg-card border-b z-10`; cells `px-3 py-2.5`
- **Body:** `divide-y divide-border`; rows `hover:bg-surface`, selected `bg-primary/5`
- **Density:** compact `py-2` (~32px), relaxed `py-3` (~40px) via `.table-workspace-relaxed`
- **Empty:** centered `py-16`, icon `size-8`, title `text-sm`, hint `text-xs`, one primary action
- **Keyboard:** row `tabIndex={0}`, Enter/Space opens drawer; checkbox is separate focus stop

---

## 4. Components Map

| Spec section | Component |
|--------------|-----------|
| Page shell | `WorkspacePage` |
| AI banner | `AiInsightBanner` |
| Filters | `FilterStrip`, `FilterSelectionActions`, `DensityToggle` |
| Table scroll | `TableRegion` |
| Pagination | `TablePaginationFooter` |
| Status pills | `StatusPill` |
| Table primitives | `Table variant="workspace"` |

---

## 5. Colors

Semantic tokens only: `bg-background`, `bg-card`, `bg-surface`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`, `border-border`, tone tokens (`success`, `warning`, `info`, `destructive`).

Tints: `/5`, `/10`, `/15`, `/20` for hover, selected, banners — never `/50+` on backgrounds.

---

## 6. Motion & Accessibility

- Row hover: `transition-colors duration-[120ms]` only
- Tab underline: `border-b-2`, no layout shift
- Drawer: 200ms ease-out; respect `prefers-reduced-motion`
- Focus ring: 2px `--color-ring`; sortable headers use `aria-sort`
- Min touch target: 28px (`h-7`) for dense controls; 36px+ for primary CTAs

---

## 7. File Deliverables

| File | Purpose |
|------|---------|
| `src/components/workspace/WorkspacePage.tsx` | Page header + tabs + flex column |
| `src/components/workspace/AiInsightBanner.tsx` | Single AI/context banner |
| `src/components/workspace/FilterStrip.tsx` | Filter bar + density toggle |
| `src/components/workspace/TableRegion.tsx` | Scrollable table container |
| `src/components/workspace/TablePaginationFooter.tsx` | Footer pagination |
| `src/components/ui/table.tsx` | `variant="workspace"` table primitives |
| `src/components/ui/status-pill.tsx` | Semantic tone pills |
| `src/styles/tokens.css` | `--surface`, `--surface-2` tokens |
---

## 8. Sidebar Typography

Shared classes in `src/index.css`:

| Class | Spec |
|-------|------|
| `.sidebar-brand` | Module title — `text-sm font-semibold tracking-tight` |
| `.sidebar-section-label` | Group headers — `10px uppercase tracking-[0.14em]` |
| `.sidebar-nav-item` | Primary nav — `text-xs font-medium` |
| `.sidebar-nav-nested` | Nested nav — `text-xs font-normal` |
| `.sidebar-quick-link` | Quick actions — `text-xs font-medium` |
| `.sidebar-profile-name` | Footer profile — `text-xs font-medium` |
| `.sidebar-search` | Search input — `h-8 text-xs` |
| `.sidebar-badge` | Count badges — `10px font-mono` |

Applied in `TempleLayout`, `DomainLayout`, `TenantLayout`, `OnboardingLayout`.
