# Table cell merging in the Rich Text editor — design

Date: 2026-11-23
Package: `@contentful/field-editor-rich-text` (`packages/rich-text`)

## Intent

Several customers have filed feature requests to merge cells in Rich Text tables. Editors should be able to
merge a rectangular block of cells into one cell (horizontally, vertically, or both) and split a
merged cell back apart, without any existing table operation corrupting a table that contains
merged cells. This is a customer-facing feature, so it must be robust in everyday editing, not a
demo.

## Current state (what exists today)

- The Contentful rich-text schema already supports spans: `TableCell.data` /
  `TableHeaderCell.data` accept `colspan?: number` and `rowspan?: number`
  (`@contentful/rich-text-types` `nodeTypes.d.ts`).
- `components/Cell.tsx` and `components/HeaderCell.tsx` already spread `element.data` onto the
  `<td>`/`<th>`, so spans render correctly once present.
- Nothing else is span-aware:
  - The `ELEMENT_TR` normalizer in `plugins/Table/createTablePlugin.ts` uses
    `getNoOfMissingTableCellsInRow` (`plugins/Table/helpers.ts`), which compares **child counts**
    per row. A row containing a `colspan` cell, or a row "under" a `rowspan` cell, is treated as
    short and padded with extra empty cells. This likely already corrupts content whose spans
    were set via the API.
  - `actions/addRow.ts`, `actions/addColumn.ts`, Plate's `deleteRow` / `deleteColumn`
    (used from `components/TableActions.tsx`) and `actions/setHeader.ts` all operate on child
    indices.
  - Plate's table internals (`@platejs/table` 53.x — cell selection via `withTableCellSelection`,
    keyboard navigation via `onKeyDownTable`) read spans through `api.table.getColSpan` /
    `api.table.getRowSpan`, which look at top-level `colSpan` / `attributes.colspan`, **not**
    `data.colspan`.
- Plate ships `mergeTableCells` / `splitTableCell`, but they write top-level `colSpan`/`rowSpan`,
  which `@contentful/contentful-slatejs-adapter` does not persist (only `data` survives).

## Goals

1. **Merge cells:** with the cursor in a cell, "Merge right" / "Merge down" table-menu actions
   merge it with its neighbour, writing `data.colspan` / `data.rowspan`. Repeated use builds
   any rectangular block.
2. **Split cell:** with the cursor in a merged cell, a "Split cell" action restores a 1×1 grid
   for that area.
3. **Span-safety:** normalization, add/delete row, add/delete column and the header toggle all
   behave correctly on tables with spans.
4. **Existing content with spans** (e.g. created via the CMA) loads without being altered, other
   than repairing genuinely invalid spans.
5. **Ships to everyone.** No feature flag or opt-in (decided by the team).

## Non-goals

- Drag-to-select multi-cell merging. That's a follow-up (see "Why not drag-select in v1").
- Span-aware copy/paste. Pasting external HTML with `colspan`/`rowspan` doesn't keep the spans,
  and pasting a block of cells into a table with merged cells still uses the existing
  index-based paste path. The normalizer keeps the table structurally valid afterwards. This is a
  known v1 limitation. _(Our call.)_
- Span-aware Shift+arrow multi-cell selection.
- Column resizing or any other new table features.
- Changes to delivery renderers (`rich-text-react-renderer`, `rich-text-html-renderer`, etc.).
- Merging across tables or with nested tables.

## Anti-goals (failure even if it "works")

- Any existing table action silently adding, dropping or misplacing cells in a table with spans.
- Storing span information anywhere other than `data.colspan` / `data.rowspan` (it would be lost
  on save).
- Changing documents that don't use spans. A table without spans must produce byte-identical
  output to today.

## Approaches considered

- **A. Reuse Plate's `mergeTableCells`/`splitTableCell` plus a translation layer.** Point Plate's
  span getters at `data`, then after each merge move the top-level `colSpan`/`rowSpan` into `data`.
  Less code, but it depends on Plate internals (field names, cached `_cellIndices`), and a missed
  translation silently loses spans on save. Rejected.
- **B. Our own span-aware grid helper (chosen).** A single helper maps a table to a
  (row, col) → cell grid. Merge, split, the normalizer and all row/column actions are built on it.
  Spans are written directly to `data`. More code, but no translation layer and easy to unit-test.
- **C. Like B, but with single-cell "Merge right" / "Merge down" actions instead of a multi-cell
  selection.** Simpler UX, but merging large blocks takes many clicks. Kept as a fallback UX if
  multi-cell selection proves unreliable; it can reuse B's helpers unchanged.

The user chose **B**. After the builder review found that multi-cell selection isn't
span-aware here (below), the team chose **B's grid helper and span-safety with C's menu
actions** for v1.

### Why not drag-select in v1

Our table plugin sets `disableMerge: true` (`internal/pluginFactories.ts`). The editor runs
with `nodeId: false` (`internal/pluginAdapter.ts`), and Plate's `_cellIndices` cache is keyed
by node id. Several Plate span queries (`hasMergedCells`, `getSelectedCellsBoundingBox`,
`getTableMergeGridByRange`) call module-level `getColSpan`/`getRowSpan` directly, so they can't
be overridden. Span-aware drag-selection would mean either writing our own selection logic or
turning on Plate's merge mode and node ids. The second reroutes Plate's row/column transforms
and risks ids leaking into saved output. Neither belongs in v1.

## Design

### 1. Grid helper (`plugins/Table/grid.ts`, new)

A pure function, `getTableGrid(tableNode) → TableGrid`:

- `TableGrid.cells[r][c]` → `{ rowIndex, cellIndex, origin: [r0, c0], colspan, rowspan }`, where
  `rowIndex`/`cellIndex` are the Slate child indices of the cell that **owns** the slot, and
  `origin` is that cell's top-left grid position.
- `TableGrid.width` = max grid row width; `TableGrid.height` = number of rows.
- Read spans with a single `getSpan(cell)` helper that reads `data.colspan`/`data.rowspan` and
  treats missing, non-integer or `< 1` values as 1.
- Overlaps (a cell whose slot is already taken by a rowspan from above) are resolved by placing
  the cell in the next free slot. That is the standard HTML table algorithm, so the editor shows
  what browsers show.

All other features consume this helper. It must be fully unit-tested (Vitest), including irregular
and invalid inputs.

### 2. Normalization (replace the child-count logic)

In the `ELEMENT_TR` / `ELEMENT_TABLE` normalizers in `createTablePlugin.ts`:

- **Missing slots:** pad each row with empty `TABLE_CELL`s so that every grid row has `width`
  occupied slots (replacing `getNoOfMissingTableCellsInRow`). Padding cells go at the end of the row.
- **Table width** = the widest grid row, spans included. Rows shorter than that are padded. A
  wide `colspan` is **never** shrunk: if one row has a single `colspan: 3` cell and the other
  rows have 2 cells, the other rows get padded to 3 (matching how browsers render it). _(Our call.)_
- **Invalid spans:** clamp a `rowspan` that runs past the last row. Remove `colspan`/`rowspan`
  keys whose value is 1 or invalid (non-integer, `< 1`), so tables without spans stay clean
  (anti-goal 3).
- Normalization must be a no-op on valid content, including content with spans.

### 3. Plate integration

No changes to Plate options. Keep `disableMerge: true` and `nodeId: false`. Tab/Shift+Tab
navigation keeps using Plate's existing path-based behaviour, which moves between cells in
document order and works with spans. Shift+arrow multi-cell selection isn't span-aware (non-goal).

### 4. Merge right / Merge down (`actions/mergeCells.ts`, new)

Both work from the cell holding the cursor (the "current cell"), using the grid helper.

- **Merge right is enabled when:** there's a cell immediately to the right in grid space
  (the slot at column `c0 + colspan` in the current cell's top row), and that cell has the same
  top row **and** the same `rowspan` as the current cell, so the result is a rectangle.
- **Merge down is enabled when:** there's a cell immediately below (the slot at row
  `r0 + rowspan` in the current cell's left column), and that cell has the same left column
  **and** the same `colspan`.
- **Header rule:** if the table header is enabled, Merge down from the header row into a body row
  is disabled. _(Our call: HTML allows it, but mixing `th` and `td` into one cell has no clean
  result.)_ Merge right inside the header row is fine.
- **Result:** the current cell stays, with `colspan` (right) or `rowspan` (down) increased by
  the neighbour's span. Key omitted when its value is 1. The neighbour cell is removed.
- **Content:** current cell's children, followed by the neighbour's children if it isn't empty.
  If both are empty, a single empty paragraph. _(Our call, matching what Plate and Google Docs do.)_
- **Selection after:** a collapsed cursor at the end of the merged cell's content.
- **Tracking:** new `RichTextTrackingActionName` values `'mergeTableCellRight'` and
  `'mergeTableCellDown'`, with `{ tableSize }` like the existing table actions.
- The core should be a generic "merge a rectangular block of cells" function, so a later
  drag-select feature can reuse it. Merge right/down are thin wrappers around it.

### 5. Split cell (`actions/splitCell.ts`, new)

- **Enabled when:** the cursor (or a single-cell selection) is in a cell with colspan or rowspan > 1.
- **Result:** the cell becomes 1×1 (span keys removed). Empty cells are inserted into every other
  grid slot it covered, at the correct child index in each affected row. Inserted cells use the
  same type as their row (`th` in the header row when the header is enabled).
- **Content:** stays in the top-left cell.
- **Tracking:** `'splitTableCell'`.

### 6. Span-aware row/column actions

These replace or wrap the current index-based actions (Plate's `deleteRow`/`deleteColumn` included,
and replace them in `TableActions.tsx`):

- **Add row above/below:** the new row gets one cell per grid slot. If a slot belongs to a cell
  whose `rowspan` crosses the insertion point, that cell's `rowspan` grows by 1 and no cell is
  inserted for that slot. A rowspan cell whose top or bottom edge sits exactly at the insertion
  point is not extended.
- **Add column left/right:** the same logic for `colspan`. Each row gets one cell, unless a
  `colspan` cell crosses the insertion point, in which case its `colspan` grows by 1.
- **Delete row:** cells whose `rowspan` crosses the row shrink by 1. A merged cell that **starts**
  in the deleted row and spans further down moves to the next row, at the grid-correct index, with
  `rowspan - 1` and its content kept. _(Our call: deleting a row shouldn't destroy content that
  visually belongs to the rows below.)_ Other cells in the row are removed.
- **Delete column:** the same logic for `colspan`. A cell starting in the deleted column with
  `colspan > 1` stays in place with `colspan - 1`.
- **Header toggle (`setHeader`):** unchanged behaviour (it switches the types of row 0's cells),
  but `isTableHeaderEnabled` must keep working when row 0 contains spanning cells. A `th` with
  `rowspan > 1` that reaches into body rows is allowed (valid HTML). Nothing is split.
- **"Add row above" disabled-ness:** unchanged (disabled in the header row).

### 7. Table menu UI (`components/TableActions.tsx`)

- New section between the add actions and the header toggle: **"Merge right"**,
  **"Merge down"** and **"Split cell"**, each disabled when its precondition fails. All stay
  visible so the feature is discoverable. The existing per-cell menu trigger is enough, since no
  multi-cell selection is involved.
- New strings **must** use Lingui `t` with a default `message` (repo guardrail). Existing table
  menu strings are not localised today. Don't migrate them as part of this work.

### 8. Testing

- **Vitest unit tests** (alongside `plugins/Table/__tests__/`) for: the grid helper (regular,
  colspan, rowspan, mixed, invalid/overlapping spans); the normalizer (no-op on valid span
  content, pads around wide colspans, repairs invalid spans, untouched output for span-free
  tables); merge right/down (enablement rules, header rule, content concatenation); split; each
  row/column action on tables with spans; and pasting into a span table leaves a valid grid.
- **Cypress component tests** (`cypress/component/rich-text/`): merge right; merge down; split;
  add/delete a row/column through a merged cell; and the saved document contains
  `data.colspan`/`data.rowspan`.
- Verification: `yarn build && yarn lint && yarn tsc && yarn test:ci` (CI builds before testing).

### 9. Release notes

Merged content now reaches delivery. The changelog/PR should state that front-end renderers must
honour `data.colspan`/`data.rowspan` to display merged tables correctly.

## Left to the builder

- Internal structure and naming of the grid helper and actions.
- Exact menu ordering within the new section and icon choices (if any).
- Whether invalid-span repair lives in the row or the table normalizer.
