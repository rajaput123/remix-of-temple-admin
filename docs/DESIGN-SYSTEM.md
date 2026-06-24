# UI Design System Guide

**Product:** DigiDevalaya admin (Business Connect · Temple modules)  
**Purpose:** Single reference for UI — color, typography, spacing, layout, and components. Keeps every screen visually consistent.

**Principles**

| Principle | Definition |
|-----------|------------|
| **Density** | Compact operational UI — readable at a glance, no wasted space |
| **Calm surfaces** | White/card backgrounds; color for actions, status, and navigation |
| **Semantic color** | Named tokens (`primary`, `muted`, `success`) — not one-off hex values |
| **One panel per workflow** | Header → optional KPIs → filters → table → optional status bar |
| **Progressive disclosure** | List first; detail in drawer or sheet |

**Token & style sources**

| Item | Location |
|------|----------|
| Design tokens | `src/styles/tokens.css` |
| Global styles + UI utilities | `src/index.css` |
| Theme mapping | `tailwind.config.ts` |
| Page layout components | `src/components/workspace/*` |
| UI components | `src/components/ui/*` |

**Related specs:** [TABLE-PAGE-SPEC.md](./TABLE-PAGE-SPEC.md) · [ERP-DESIGN-SYSTEM-SPEC.md](./ERP-DESIGN-SYSTEM-SPEC.md)

---

## Standard list screen

Anatomy every data list should follow (top → bottom):

1. **Page header** — eyebrow, title (18px max), description, primary action (top right)
2. **KPI row** (optional) — 2–4 stat cards
3. **Filter strip** — search + dropdowns on one row
4. **Data table** — edge-to-edge, compact rows
5. **Pagination** — footer below table
6. **Status bar** (optional) — fixed bottom workflow strip

**Visual rules for this pattern**

- Surfaces: `bg-card` on white canvas; borders `border-border`
- Primary action: one blue button per view; height **36px**
- Filter controls: height **28px**, 12px label text
- Table row height: **~36px**; status shown as pill, not row fill

**Reference screens**

| Pattern | Route |
|---------|-------|
| KPI + filters + table | `/business-connect/crm` |
| Service listing | `/business-connect/services/list` |
| Tabs + bookings | `/business-connect/bookings` |

**Implementation reference:** `src/pages/business/crm/CustomersList.tsx`

**Layout wireframe**

```
┌─ Eyebrow (10px uppercase, muted) ─────────────────── [Primary 36px] ─┐
│  Page title (18px semibold)                                          │
│  Description (12px muted)                                            │
├─ [ KPI ] [ KPI ] [ KPI ] [ KPI ]  ← optional, 12px gap              │
├─ Search · Filter · Filter · Filter   ← 28px controls, 12px text     │
├─ TABLE ─────────────────────────────────────────────────────────────│
│  ID · Name/phone · … · Status pill · …                               │
├─ Pagination (12px) ─────────────────────────────────────────────────│
└─ Status bar (36px, optional, fixed bottom) ──────────────────────────┘
```

---

## Design tokens

Tokens are the shared vocabulary for color, type, and space. All UI must use token names so a theme change updates every screen.

```
tokens.css  →  index.css  →  tailwind.config  →  UI classes
--primary      utilities     bg-primary          applied in screens
--muted        .text-workspace-*  text-muted-foreground
```

| Layer | Role |
|-------|------|
| `tokens.css` | Defines `--primary`, `--muted`, `--success`, spacing, motion |
| `index.css` | Workspace & sidebar typography utilities |
| `tailwind.config.ts` | Exposes tokens as `bg-primary`, `text-foreground`, etc. |

**Rule:** Update the design system in `tokens.css` — never patch individual screens with custom hex colors.

---

## Color

### Core palette

These are **HSL triplets** stored as `--token` and used as `hsl(var(--token))`.

| CSS variable | Approx. color | Tailwind classes | Use when |
|--------------|---------------|------------------|----------|
| `--background` | White `#FFFFFF` | `bg-background` | App canvas behind panels |
| `--foreground` | Near-black `#1A1F2E` | `text-foreground` | Titles, primary body text |
| `--card` | White | `bg-card` | Workspace panels, KPI cards |
| `--muted` | Light gray `#EEF0F3` | `bg-muted` | Zebra rows, search field fill |
| `--muted-foreground` | Gray `#6B7280` | `text-muted-foreground` | Descriptions, secondary columns |
| `--border` | Gray `#DDE1E6` | `border-border` | Dividers, inputs, card edges |
| `--primary` | Blue `#2563EB` | `bg-primary`, `text-primary` | Primary buttons, links, IDs |
| `--primary-foreground` | White | `text-primary-foreground` | Text on solid primary buttons |
| `--ring` | Blue (focus) | `ring-ring` | Focus rings |
| `--destructive` | Red | `bg-destructive`, `text-destructive` | Delete, errors |

**Sidebar-specific** (module nav only):

| Variable | Tailwind | Use |
|----------|----------|-----|
| `--sidebar-background` | `bg-sidebar` | Sidebar panel |
| `--sidebar-accent` | `bg-sidebar-accent` | Active nav item background |
| `--sidebar-foreground` | `text-sidebar-foreground` | Nav labels |

### Status colors

For enums (Active, Draft, Failed, etc.) use **`StatusPill`** — do not paint whole table rows.

| Meaning | `StatusPill` tone | Underlying classes |
|---------|-------------------|-------------------|
| Active / success | `success` | `bg-success/10 text-success` |
| Draft / pending | `warning` | `bg-warning/10 text-warning` |
| Scheduled / info | `info` | `bg-info/10 text-info` |
| Failed / urgent | `destructive` | `bg-destructive/10 text-destructive` |
| Inactive / archived | `neutral` | `bg-muted text-muted-foreground` |

**Status → tone mapping** (example: CRM)

| Label | Pill tone |
|-------|-----------|
| Active | `success` |
| Lead | `warning` |
| Inactive | `neutral` |

Component: **StatusPill** — height 20px, 10px semibold text, dot + label.  
File: `src/components/ui/status-pill.tsx`

### Color — do / don't

| Avoid | Use instead |
|-------|-------------|
| `text-blue-600`, `bg-green-100` | `text-primary`, `bg-success/10` |
| Row background per status | `StatusPill` in status column |
| Hub card gradients | Flat `bg-card` + `border-border` |
| Hardcoded hex on screens | Semantic tokens |

Hub module cards (Temple Hub / Business Hub) may use decorative gradients. **Operational tables and forms stay flat.**

### Dark mode

Activated via `dark` class or `data-theme="keehoo"` on the document root. Token overrides live in `tokens.css`. Same semantic names apply in light and dark.

---

## Typography

### Font families

| Role | Font | Size / style |
|------|------|--------------|
| UI text | **Inter** | 400–700 weights; default for all labels and body |
| Data (IDs, money, counts) | **IBM Plex Mono** | Tabular figures; never use for paragraphs |

### Type scale (workspace shell)

Utility classes in `src/index.css` (`text-workspace-*`).

| Class | Renders as | Use on |
|-------|------------|--------|
| `text-workspace-eyebrow` | 10px bold uppercase muted | Breadcrumb above title (`CRM`, `Services · List`) |
| `text-workspace-title` | 18px semibold | Page title (max size in shell) |
| `text-workspace-desc` | 12px muted | Subtitle under title |
| `text-workspace-section` | 14px semibold | In-card section headings |
| `text-workspace-label` | 10px bold uppercase muted | Form field labels |
| `text-workspace-body` | 14px regular | Paragraph text in panels |
| `text-workspace-muted` | 14px muted | Secondary paragraph |
| `text-workspace-mono` | 12px mono tabular | Inline codes, amounts |

**Page header content** (via `WorkspacePage`):

| Slot | Example | Style |
|------|---------|-------|
| Eyebrow | `CRM` | 10px uppercase muted |
| Title | `Customers` | 18px semibold |
| Description | `Manage customer records.` | 12px muted |

### Table typography

| Element | Classes |
|---------|---------|
| Column header | `text-[10px] font-bold uppercase tracking-wider` |
| Primary cell line | `cell-primary` (inside `.table-workspace`) |
| Secondary cell line | `cell-secondary` |
| ID column | `font-mono text-[11px] text-primary truncate` |
| Money / count | `font-mono text-xs tabular-nums` |
| Status | `<StatusPill />` (10px semibold inside) |

**Two-line table cell** (e.g. name + phone):

| Line | Size | Weight | Color |
|------|------|--------|-------|
| Primary | 12–14px | Medium | Foreground |
| Secondary | 11px | Regular | Muted |

Both lines truncate with ellipsis when space is tight; full value on hover.

### Typography rules

- **No `text-2xl` / `text-3xl`** on module pages — shell titles cap at `text-lg` (18px).
- **Uppercase** only for eyebrows, table headers, and field labels — not sentence titles.
- **`tabular-nums`** on all numeric columns (counts, currency, dates).
- **`truncate` + `title={value}`** on long text so hover shows full value.

---

## Spacing

### Base unit: 4px

Use Tailwind spacing scale (each step = 4px × n):

| Class | Pixels | Typical use |
|-------|--------|-------------|
| `p-1` / `gap-1` | 4px | Tight icon gaps |
| `p-2` / `gap-2` | 8px | Filter strip control gap |
| `p-3` / `gap-3` | 12px | KPI card padding, grid gap |
| `p-4` / `gap-4` | 16px | Section padding (`px-4`) |
| `p-6` | 24px | Page header horizontal (`px-6`) |

CSS variables `--space-1` … `--space-16` in `tokens.css` mirror this scale.

### Application shell layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TempleLayout                                                     │
│ ┌──────────────┬──────────────────────────────────────────────┐ │
│ │ Sidebar      │  <main> contentClassName="px-4 pb-4 pt-3"   │ │
│ │ 240px wide   │  ┌────────────────────────────────────────┐  │ │
│ │ (64px mini)  │  │ WorkspacePage (bleed: -mx-4)           │  │ │
│ │              │  │  Header → KPIs → FilterStrip → Table   │  │ │
│ │              │  └────────────────────────────────────────┘  │ │
│ └──────────────┴──────────────────────────────────────────────┘ │
│ Status bar (36px, fixed bottom) — only when statusBar prop set  │
└─────────────────────────────────────────────────────────────────┘
```

| Token / setting | Value | Notes |
|-----------------|-------|-------|
| `--shell-sidebar-width` | `240px` | `64px` when collapsed |
| `contentClassName` | `px-4 pb-4 pt-3` | Set on module layouts (`CRMLayout`, etc.) |
| `WorkspacePage` `bleed` | `-mx-4` (default `true`) | Cancels main padding so table is edge-to-edge |
| `--shell-statusbar-height` | `0` → `2.25rem` (36px) | Set automatically when `statusBar` prop is passed |

**Important:** Pass `statusBar={<WorkspaceStatusBar />}` **inside** `WorkspacePage`, not as a sibling. `WorkspacePage` toggles `data-status-bar="true"` on `<html>` and reserves bottom space.

### Page zones (padding reference)

| Zone | Padding / size |
|------|----------------|
| Page header | `px-6 pt-4 pb-3` |
| Header action buttons | `h-9`, `text-xs`, `gap-1.5` |
| KPI row | `px-4 pb-3`, grid `gap-3`, card `p-3` |
| Filter strip | `px-4 py-3`, inner `gap-2` |
| Filter input / select | `h-7 text-xs` |
| Table body cells | `py-1.5` (~36px row height) |
| Pagination footer | `px-4 py-2 text-xs` |

### Control height cheat sheet

| Control | Height class |
|---------|--------------|
| Toolbar button | `h-9` with `size="sm"` |
| Filter input / select | `h-7` |
| Status pill | `h-5` (built into `StatusPill`) |
| Sidebar search | `h-8` (`.sidebar-search`) |

Keep all controls on the same strip at the **same height** — mixed `h-8` / `h-10` looks broken.

---

## Borders, radius, shadows

| Token / class | Value | Use |
|---------------|-------|-----|
| `--radius` | `0.75rem` (12px) | Base; drives `rounded-lg` via Tailwind |
| `rounded-md` | ~6px | Buttons, inputs |
| `rounded-lg` | ~8px | KPI cards, dialogs |
| `border border-border` | 1px neutral | Cards, panels, table borders |
| Active sidebar item | `border-l-2 border-l-primary` | Left accent on current route |

**Shadows:** workspace tables are flat (`shadow-none`). Hub/marketing cards may use `shadow-sm`. Do not add heavy shadows to data tables.

---

## Motion

| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 120ms | Button hover, status bar links |
| `--duration-normal` | 200ms | Sidebar nav hover |
| `--duration-slow` | 320ms | Panel transitions |

Hover on table rows: **background color only** — no scale or lift.  
`prefers-reduced-motion` zeroes durations in `tokens.css`.

---

## UI components

### Page shell — `WorkspacePage`

Standard frame for module screens. File: `src/components/workspace/WorkspacePage.tsx`

| Region | Spec |
|--------|------|
| Header padding | 24px horizontal · 16px top · 12px bottom |
| Eyebrow | Optional trail above title |
| Title + description | Left; actions aligned top-right |
| Tabs | Optional; 36px tab height |
| Content | Full width; table bleeds to panel edges |
| Status bar slot | Optional 36px strip; pins to viewport bottom |

### Data table — `WorkspaceTable`

File: `src/components/workspace/WorkspaceTable.tsx`

| Behavior | Spec |
|----------|------|
| Row height | ~36px |
| Header | Sticky; 10px uppercase |
| Row interaction | Click opens detail drawer/sheet |
| Empty state | Icon + title + description + optional action |
| Pagination | 12px footer, border-top |
| Horizontal scroll | When columns exceed viewport (min ~1040px) |

### Filter strip — `FilterStrip`

Single row above table: search field + filter dropdowns. All controls **28px** height, **12px** text, **8px** gap between controls.

### Module layout — `TempleLayout`

Fixed **240px** sidebar (64px collapsed) + scrollable main area. Main padding: **16px** horizontal, **12px** top, **16px** bottom.

### Buttons

| Variant | Use | Size |
|---------|-----|------|
| Primary (blue fill) | One main action per screen | 36px height, 12px text |
| Outline | Secondary actions (Cancel, Export) | 36px height |
| Ghost | Tertiary / icon-adjacent actions | 36px height |

### Form controls

`Input`, `Select`, `Badge`, `Card`, `Dialog`, `Sheet`, `Tabs` — shadcn/ui set under `src/components/ui/`.

### Icons (Lucide)

| Context | Size |
|---------|------|
| Inside toolbar button | 14px |
| Sidebar / navigation | 16px |
| KPI card accent | 16px, muted color |

Stroke weight: 1.5px default.

---

## KPI cards

| Property | Spec |
|----------|------|
| Grid | 2 columns mobile · 4 columns desktop |
| Gap | 12px between cards |
| Card | White surface, 1px border, 12px radius, 12px padding |
| Icon | 16px, muted, above value |
| Value | 20px bold |
| Label | 11px muted |
| Section margin | 16px horizontal; 12px below before filters |

---

## Accessibility

- Icon-only controls need a text label (`aria-label`)
- Status must include text, not color alone — use `StatusPill` with a readable label
- Focus state: visible ring in primary blue (`ring-ring`)
- Table pages: meaningful page title and table label for screen readers
- Status bar: announced as live status region

---

## Consistency — do / don't

| Do | Don't |
|----|-------|
| Semantic tokens (`primary`, `muted`, `border`) | Random palette colors (`blue-600`, `#2563eb`) |
| `StatusPill` for status column | Full-row background by status |
| Page title max **18px** (`text-lg`) | `text-2xl` / `text-3xl` in module shell |
| Toolbar buttons **36px**; filters **28px** | Mixed control heights on same strip |
| Flat `bg-card` tables and forms | Gradients on data tables |
| `font-mono` + `tabular-nums` for IDs and money | Decorative fonts in data columns |
| KPI spacing per CRM reference | Negative margin pulling cards under header |

---

## File map

| File | What's inside |
|------|----------------|
| `src/styles/tokens.css` | All CSS variables (color, space, motion, dark theme) |
| `src/index.css` | Font imports, `.text-workspace-*`, `.table-workspace`, `.sidebar-*`, shell height |
| `tailwind.config.ts` | Maps `--primary` etc. to `bg-primary`, `text-muted-foreground`, … |
| `src/components/workspace/WorkspacePage.tsx` | Page header + bleed + status bar hook |
| `src/components/workspace/WorkspaceTable.tsx` | Paginated workspace table |
| `src/components/workspace/FilterStrip.tsx` | Filter bar |
| `src/components/ui/status-pill.tsx` | Status badges |
| `src/components/ui/button.tsx` | Button variants/sizes |
| `src/pages/business/crm/CustomersList.tsx` | Reference list screen |
| `docs/TABLE-PAGE-SPEC.md` | Table page spacing spec |

---

## Updating the design system

When brand or UI rules change:

1. Edit tokens in `src/styles/tokens.css` (`--primary`, `--muted`, status colors, spacing).
2. Register new semantic colors in `tailwind.config.ts` if needed.
3. Verify on: CRM list, one dialog, sidebar active state, all `StatusPill` tones.
4. Do not override tokens on individual screens.

---

*UI Design System Guide v1.2 — DigiDevalaya admin shell.*
