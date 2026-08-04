---
version: alpha
name: Netsim ERP
description: >-
  A warm, precise, data-dense interface for Turkish manufacturing and ERP
  workflows. Cream canvas and white work surfaces reduce glare; navy establishes
  information hierarchy; orange is a controlled operational accent. The product
  should feel trustworthy, fast, and engineered rather than decorative.

colors:
  primary: "#ff4800"
  primary-hover: "#c93700"
  primary-pressed: "#9f2800"
  primary-soft: "#fff1eb"
  canvas: "#f8f5ee"
  surface: "#ffffff"
  surface-subtle: "#fffefa"
  row-alternate: "#fcfcfa"
  ink: "#1f1f1f"
  ink-strong: "#213343"
  ink-data: "#27384b"
  ink-muted: "#516f90"
  border: "#cbd6e2"
  border-strong: "#99acc0"
  border-soft: "#e4e9ed"
  focus: "#2f7579"
  destructive: "#d9002b"
  warning-surface: "#fff3e8"
  warning-border: "#ff8f59"
  warning-ink: "#7a3216"
  row-hover: "#fff4ef"
  row-selected: "#ffe4d8"
  overlay: "rgba(25, 39, 51, 0.72)"

typography:
  page-title:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 58px
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: -0.045em
  page-title-mobile:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 40px
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: -0.04em
  dialog-title:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 21px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: -0.02em
  panel-title:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 16px
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: 0em
  body:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  body-compact:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
  label:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 12px
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: 0em
  table-header:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 10px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: 0.055em
  table-body:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0em
  data-code:
    fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Consolas, monospace'
    fontSize: 11px
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: 0em
  badge:
    fontFamily: '"Geist Variable", "Helvetica Neue", Arial, sans-serif'
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0em

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px

spacing:
  micro: 2px
  xs: 4px
  sm: 8px
  compact: 12px
  md: 16px
  lg: 24px
  panel: 28px
  xl: 32px
  page: 56px

components:
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    width: 1500px
  page-title:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.page-title}"
  work-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 28px
  panel-header:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.panel-title}"
    height: 58px
    padding: 12px
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: 42px
    padding: 10px
  field-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.label}"
  field-border:
    backgroundColor: "{colors.border-strong}"
    size: 1px
  divider:
    backgroundColor: "{colors.border}"
    size: 1px
  divider-soft:
    backgroundColor: "{colors.border-soft}"
    size: 1px
  brand-accent:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 42px
    padding: 12px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 42px
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 42px
    padding: 12px
  button-secondary-hover:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-hover}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 42px
    padding: 12px
  focus-indicator:
    backgroundColor: "{colors.focus}"
    size: 3px
  table-header:
    backgroundColor: "{colors.ink-strong}"
    textColor: "{colors.surface}"
    typography: "{typography.table-header}"
    height: 42px
    padding: 10px
  table-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-data}"
    typography: "{typography.table-body}"
    height: 42px
    padding: 10px
  table-row-alternate:
    backgroundColor: "{colors.row-alternate}"
    textColor: "{colors.ink-data}"
    typography: "{typography.table-body}"
    height: 42px
    padding: 10px
  table-row-hover:
    backgroundColor: "{colors.row-hover}"
    textColor: "{colors.ink-data}"
    typography: "{typography.table-body}"
    height: 42px
    padding: 10px
  table-row-selected:
    backgroundColor: "{colors.row-selected}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.table-body}"
    height: 42px
    padding: 10px
  lookup-row-selected:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    typography: "{typography.table-body}"
    height: 38px
    padding: 10px
  data-code:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.data-code}"
  muted-copy:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-compact}"
  level-badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-hover}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: 4px
  warning:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning-ink}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.md}"
    padding: 12px
  warning-edge:
    backgroundColor: "{colors.warning-border}"
    size: 1px
  destructive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.destructive}"
    typography: "{typography.body-compact}"
  modal-backdrop:
    backgroundColor: "{colors.overlay}"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    width: 1080px
  modal-header:
    backgroundColor: "{colors.ink-strong}"
    textColor: "{colors.surface}"
    typography: "{typography.dialog-title}"
    padding: 22px
---

# Netsim ERP Workbench Design System

## Overview

Netsim is a Turkish manufacturing and ERP workbench. Its current primary job is
to help an operations user choose a stock item and variant, set unit, quantity,
and costing method, then inspect a hierarchical product tree with cost data.
Future screens should feel like they belong to the same operational product,
even when their business task is different.

The design direction is **warm industrial precision**:

- Warm cream surrounds the work area and makes long sessions less clinical.
- White panels behave like clean sheets placed on that canvas.
- Deep navy gives dense operational data a stable, trustworthy structure.
- Orange marks the action or state that deserves immediate attention.
- Compact type, rows, and controls respect expert users who scan more than they
  read.

The memorable signature is the contrast between the warm page and the
engineered navy table header, with orange appearing only at decisive
interaction points and along the product-tree hierarchy. This is an ERP tool,
not a marketing site and not a generic analytics dashboard.

This file is the visual source of truth for coding agents. The machine-readable
front matter follows Google's
[DESIGN.md format](https://github.com/google-labs-code/design.md). Existing
business behavior, API contracts, database vocabulary, and Turkish domain terms
remain the source of truth for product logic.

### Agent interpretation order

When instructions conflict, use this order:

1. The user's explicit request for the current task.
2. Existing business behavior and data contracts.
3. This file's design intent, tokens, and guardrails.
4. Existing reusable components and local conventions.
5. Framework defaults.

Do not invent a new visual direction just because a new screen introduces a new
workflow. Extend this system deliberately.

## Colors

The palette has one vivid accent and a quiet hierarchy of warm and cool
neutrals.

- **Orange `#ff4800`:** brand voltage, small highlights, progress, tree
  affordances, active icons, and visual emphasis. Avoid using it as a large
  background.
- **Dark orange `#c93700`:** accessible filled actions with white text and
  strong selected states.
- **Pressed orange `#9f2800`:** active/pressed state for filled actions.
- **Cream `#f8f5ee`:** the page floor. Do not replace it with gray or pure
  white.
- **White `#ffffff`:** panels, cards, inputs, popovers, and table rows.
- **Navy `#213343`:** page structure, headings, table headers, modal headers,
  and high-confidence labels.
- **Data ink `#27384b`:** dense table values.
- **Muted blue `#516f90`:** supporting text, metadata, and placeholders.
- **Teal `#2f7579`:** focus only. It is deliberately separate from orange so
  keyboard focus is unmistakable.

Orange must communicate hierarchy, not decoration. A view normally has one
filled primary action. Secondary actions are white with a cool border. Pale
orange is appropriate for hover and selected-row surfaces because it preserves
readability.

### Contrast rule

Bright orange `#ff4800` with white text is only 3.40:1 and does not meet WCAG AA
for normal-size text. New UI must use one of these pairings:

- `#c93700` with white text for a filled button or selected lookup row.
- `#ff4800` with near-black `#1f1f1f` for a bright brand chip or accent surface.
- `#ff4800` as a border, icon, underline, or non-text highlight over a light
  surface.

Do not propagate an older bright-orange/white combination into new components.

## Typography

Use **Geist Variable** for the entire interface. The project already ships it
through `@fontsource-variable/geist`. The consistency of one family is
intentional: hierarchy comes from size, weight, spacing, and placement rather
than decorative font mixing.

- Page titles are bold but not black: weight 650, tight tracking, and a compact
  line-height. Use the large title only once per page.
- Panel and dialog titles also use weight 650.
- Labels are 12px/650 and remain in sentence case.
- Table headers are 10px/650, uppercase, and slightly tracked. This treatment is
  reserved for tabular column labels.
- Table data is 12px. Supporting table metadata may be 11px.
- Stock codes and other identifiers use the mono stack. Do not use monospace
  for names, descriptions, currency, or general body copy.
- Numeric cells are right-aligned. Text, codes, and units are left-aligned.

Use Turkish interface copy. Prefer short, operational labels and active verbs:
`Ağacı bul`, `Genişlet`, `Daralt`, `Seç`, `Vazgeç`. Keep the same action name
through button, loading, success, and error states. Do not translate established
database identifiers into user-facing labels without product context.

## Layout

The desktop layout is a centered workbench, not an edge-to-edge dashboard.

- Maximum page width: 1500px.
- Page padding: `34px clamp(20px, 4vw, 56px) 56px`.
- Primary panels: white, 1px border, 16px radius.
- Search/filter panel padding: 28px.
- Major vertical gaps: 18–20px.
- Control height: 42px.
- Table row and main table-header height: 42px.
- Modal lookup-row height: 38px.

### Responsive behavior

- Above 1100px, the search panel uses four deliberate columns: two compact
  170px columns, one flexible data-selection column, and a 218px action column.
- From 861px through 1100px, use the existing 12-column layout and rebalance
  spans; do not merely scale the desktop grid.
- At 860px and below, stock, variant, and costing fields span the full width;
  unit and quantity share a row; tree controls and primary action span the full
  width.
- At 560px and below, all form fields stack, page gutters become 14px, and the
  lookup dialog becomes a bottom sheet with rounded top corners.

The product table is intentionally data-dense and horizontally scrollable. Keep
its meaningful minimum width (currently 1260px), sticky header, and complete
column set instead of crushing columns into unreadable mobile cards. Horizontal
scroll is the correct responsive behavior for this expert workflow.

Hierarchy is structural:

- Search criteria come before results.
- Global tree actions sit next to the primary query action.
- The results panel contains a quiet title strip and the table.
- Product-tree depth is shown through aligned branch guides, indentation, and
  expand/collapse controls—not through repeated nested cards.

## Elevation & Depth

Most depth is created through surface color and borders, not shadows.

- Cream page → white panel is the main elevation step.
- `#cbd6e2` outlines panels and separates major regions.
- `#e4e9ed` separates rows and subtle internal regions.
- Inputs use the stronger `#99acc0` edge so controls remain visible on white.
- Cards and tables stay flat. Do not add floating-card shadows.
- A primary button may use only the existing subtle 1px vertical shadow.
- The modal is the one strong elevation moment: navy-tinted backdrop, 3px blur,
  and a deep `0 28px 80px rgba(8, 20, 30, 0.35)` shadow.

Animation is functional and restrained:

- Modal entry: 150ms ease-out with a 10px rise and a 0.99→1 scale.
- Loading spinner: 800ms linear rotation.
- Normal hover/focus transitions: 120–180ms.
- Respect `prefers-reduced-motion`; remove modal transforms and avoid decorative
  motion.

Do not introduce gradients, glassmorphism, glowing shadows, parallax, or
ambient animation.

## Shapes

The shape language is a two-level system:

- **8px:** inputs, buttons, notices, small control groups, and interactive
  rectangles.
- **16px:** major panels, cards, dialogs, and the mobile bottom sheet.
- **4px:** compact data badges only.
- **Full pill:** status dots or circular counters only, never general buttons or
  containers.

Use 1px borders. Avoid nesting multiple 16px cards inside one another; when a
table fills a panel, its internal card should flatten to 0 radius so the outer
panel owns the silhouette.

Icons come from Lucide. Default icon size is 16px; compact tree controls may use
12px icons inside a 24px target. Icons clarify actions but do not replace
visible labels for primary or unfamiliar actions. Do not use emoji as interface
icons.

## Components

### Page header

Use one short title with no decorative eyebrow, breadcrumb, gradient, or hero
illustration unless the workflow genuinely requires navigation context. The
current `Ürün Ağacı` title is the correct model: distinctive typography with
quiet surroundings.

### Search and filter panel

Treat search criteria as one operational sentence arranged across the grid.
Labels stay above fields. Lookup fields are read-only inputs with an ellipsis
button at the trailing edge. Dependent fields are visibly disabled until their
prerequisite is selected.

The primary action belongs at the end of the form and names the result it
produces. While loading, keep the button width stable, show a spinner, and use a
specific progressive label such as `Bulunuyor...`.

### Buttons

- Primary: dark orange fill, white label, 42px high, 8px radius.
- Secondary: white fill, cool border, navy label.
- Compact icon: square, minimum 24px target, visible focus state, accessible
  name.
- Disabled: preserve the component shape; use reduced opacity and
  `not-allowed`.
- Destructive: reserve red for actions that truly delete, remove, or cause
  irreversible loss.

One screen region should not have multiple filled orange buttons competing for
attention.

### Data tables

- Use semantic table elements for genuinely tabular data.
- Keep headers sticky when the body scrolls.
- Navy headers use white uppercase 10px labels.
- Zebra striping is extremely subtle; hover and selection use pale orange.
- Right-align quantities, prices, totals, costs, percentages, and other numeric
  measures.
- Use `font-variant-numeric: tabular-nums` when columns contain comparable
  numbers.
- Truncate long values only when the full value is available by title, tooltip,
  detail view, or accessible name.
- A selected row must expose `aria-selected` where the interaction model
  supports it and must not rely on color alone.

For the product tree, preserve the aligned branch geometry. The tree guides,
chevrons, indentation, and row selection are one system; do not replace them
with decorative nested cards or disconnected indentation.

### Lookup dialog

Desktop dialogs are centered and capped at 1080px wide and 740px high. The navy
header contains title, short supporting description, and close control. Search
sits in a cream toolbar with a visible record count.

Required interaction:

- Move focus into the dialog on open and keep focus contained.
- Close on Escape and backdrop click.
- Restore focus to the opener on close.
- Support pointer selection, Enter to confirm, and Space to select a row.
- Disable `Seç` until a row is selected.
- On narrow screens, render as a bottom sheet without changing the task flow.

### Notices and states

Use inline notices directly below the action area. A notice explains what
happened and, when possible, what the user can do next. Do not apologize, use
vague copy, or show raw API/SQL errors.

Every data surface needs purposeful states:

- Loading: say what is loading and preserve the surrounding layout.
- Empty before query: explain the action that will produce results.
- Empty after query: state that no matching record was found.
- Error: identify the failed task and a safe recovery step.

## Do's and Don'ts

### Do

- Reuse the existing shadcn/Base UI primitives in `src/components/ui` before
  introducing another component library.
- Keep semantic shadcn theme variables in `src/index.css`; map product-specific
  aliases in the app stylesheet when that makes roles clearer. This follows
  [shadcn's CSS-variable theming model](https://ui.shadcn.com/docs/theming).
- Use the existing Geist and Lucide dependencies.
- Preserve dense, scan-friendly information layouts for expert users.
- Keep orange scarce and purposeful.
- Add visible `:focus-visible` treatment to every interactive element.
- Meet WCAG 2.2 AA contrast for text and meaningful UI boundaries.
- Keep pointer targets at least 24×24px; prefer the established 42px control
  height for primary form actions.
- Test keyboard-only use, 200% zoom/reflow, long Turkish labels, loading, empty,
  error, hover, selected, and disabled states.
- Validate changes with `pnpm run lint` and `pnpm run build`.
- Visually review at approximately 1440px, 1024px, and 390px widths.

### Don't

- Do not turn application pages into marketing landing pages.
- Do not add a sidebar, KPI-card row, breadcrumbs, tabs, or filters unless the
  information architecture requires them.
- Do not use gradients, glass effects, neon colors, or oversized shadows.
- Do not replace the cream canvas with generic gray.
- Do not use giant rounded cards for every group or pills for ordinary actions.
- Do not use orange for large panels, long text, or multiple competing CTAs.
- Do not hide important data columns just to avoid mobile horizontal scrolling.
- Do not invent a dark mode from the generic `.dark` defaults. The product is
  light-only until a complete, tested dark palette is explicitly requested.
- Do not introduce a second type family for decoration.
- Do not change Turkish domain vocabulary, numeric meaning, or data hierarchy
  to make a layout look cleaner.
- Do not ship a component with mouse-only behavior, invisible focus, or
  color-only state.

### Accessibility baseline

Use the W3C guidance for
[text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
and
[minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
as the minimum standard. These are quality requirements, not optional polish.
