# Table Cell Merging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let editors merge table cells (Merge right / Merge down) and split them again in the Rich Text editor, and make every existing table operation span-safe.

**Architecture:** A pure grid helper (`plugins/Table/grid.ts`) maps a table node to a (row, col) → owning-cell grid, with spans read from `data.colspan`/`data.rowspan`. The normalizer, merge, split, add/delete row/column and `getTableSize` all use it. Actions read the grid once, then apply Slate transforms (`setNodes`/`insertNodes`/`removeNodes`/`moveNodes`) inside `withoutNormalizing`.

**Tech Stack:** TypeScript, React, Plate 53 / Slate, `@contentful/rich-text-types`, Vitest (unit, `@jsx jsx` hyperscript), Cypress component tests, Lingui `t` macro, Forma 36 `Menu`.

**Spec:** `docs/superpowers/specs/2026-11-23-table-cell-merging-design.md`

## Global Constraints

- Spans are stored **only** in `data.colspan` / `data.rowspan`. Never top-level `colSpan`/`rowSpan`.
- Omit a span key whose value is 1. Tables without spans must serialize exactly as today.
- Valid content (including content with spans) must not be changed by normalization. A wide `colspan` is never shrunk; other rows are padded instead. Only a `rowspan` past the last row is clamped, and invalid values (non-integer, `< 1`) are removed.
- Don't change Plate options: keep `disableMerge: true` (`internal/pluginFactories.ts`) and `nodeId: false` (`internal/pluginAdapter.ts`). Never call Plate's `mergeTableCells`/`splitTableCell`.
- With the table header enabled, merging a header-row cell **down** into a body row is not allowed.
- Merge content order: the current cell's children, then the neighbour's children unless the neighbour is empty (a single empty paragraph). Both empty → one empty paragraph.
- New user-facing strings use `t` from `@lingui/core/macro` with an `id` and a default `message`, following `dialogs/HypelinkDialog/HyperlinkDialog.tsx`. Don't migrate the existing menu strings.
- Path safety: when one action touches several rows, apply mutations bottom row first and, within a row, rightmost cell first. Compute everything from a single grid snapshot taken before mutating.
- Unit tests live in `packages/rich-text/src/plugins/Table/__tests__/` and follow `listsInTableCells.test.tsx` (`/** @jsx jsx */`, `createTestEditor`, `assertOutput`). Spans in fixtures are written `<htd data={{ colspan: 2 }}>`.
- Per-task check: `cd packages/rich-text && yarn vitest run src/plugins/Table && yarn tsc && yarn lint`.

## Review Focus

1. **Undo after merge/split/delete-row:** one `editor.undo()` restores the exact previous table. Every action must run in a single `withoutNormalizing` batch. Pinned in Tasks 3 and 4.
2. **Cells holding lists or several paragraphs (lists in cells just shipped):** merging keeps the lists intact and in order. Pinned in Task 3.
3. **Tab navigation through a table with merged cells** visits every cell once and in order, without skipping or getting stuck. Pinned in Task 3.
4. **Delete row with the cursor in a cell that spans several rows:** it deletes the cell's **origin** row (the Slate parent row), and the cell moves down with `rowspan - 1`. Pinned in Task 6.
5. **Add row directly below the last row a rowspan cell covers:** the rowspan is **not** extended (the insertion point is on its edge). Pinned in Task 5.

---

### Task 1: Grid helper

**Files:**

- Create: `packages/rich-text/src/plugins/Table/grid.ts`
- Modify: `packages/rich-text/src/test-utils/hyperscript.d.ts` (`htd` and `hth` accept `data?: { colspan?: number; rowspan?: number }`)
- Test: `packages/rich-text/src/plugins/Table/__tests__/grid.test.ts`

**Interfaces:**

- Produces:
  - `getSpan(cell: Element): { colspan: number; rowspan: number }`. Reads `cell.data`; missing, non-integer or `< 1` → 1.
  - `spanData(data: object | undefined, span: { colspan: number; rowspan: number }): object`. Returns `data` with `colspan`/`rowspan` set, and the keys omitted when they equal 1.
  - `type GridSlot = { rowIndex: number; cellIndex: number; origin: [number, number]; colspan: number; rowspan: number }`. `rowIndex`/`cellIndex` are the owning cell's Slate child indices.
  - `type TableGrid = { slots: (GridSlot | undefined)[][]; width: number; height: number }`. `slots[r][c]`; `undefined` = an unfilled slot (a short row). `width` = widest row; `height` = row count.
  - `getTableGrid(table: Element): TableGrid`. Uses the HTML table algorithm: each cell takes the next free slot in its row, and a rowspan reaching past the last row only fills slots that exist.
  - `getCellSlot(grid: TableGrid, rowIndex: number, cellIndex: number): GridSlot`. The origin slot of a given cell.
  - `getInsertIndex(grid: TableGrid, row: number, col: number): number`. The Slate child index at which to insert a new cell so it lands at grid column `col` in row `row` (= the number of cells whose origin is in `row` with origin column `< col`).

- [ ] **Step 1: Write failing tests** in `grid.test.ts` using plain node objects. Cover:
  - 2×2 plain → `width 2, height 2`, `slots[1][1]` = `{rowIndex:1, cellIndex:1, origin:[1,1], colspan:1, rowspan:1}`
  - row 0 `[A colspan 2]`, row 1 `[B, C]` → `slots[0][0]` and `slots[0][1]` both have origin `[0,0]`; `width 2`
  - row 0 `[A rowspan 2, B]`, row 1 `[C]` → `slots[1][0].origin` = `[0,0]`; `slots[1][1]` = `{rowIndex:1, cellIndex:0, origin:[1,1]}`
  - short row: row 0 `[A, B, C]`, row 1 `[D]` → `slots[1][1]` and `slots[1][2]` are `undefined`; `width 3`
  - wide colspan: row 0 `[A colspan 3]`, row 1 `[B, C]` → `width 3`, `slots[1][2]` `undefined`
  - `getSpan` on `{data:{colspan: 0}}`, `{colspan: 1.5}`, `{colspan: '2'}`, and `{}` → all `{colspan:1,rowspan:1}`
  - `spanData({foo:1}, {colspan:1,rowspan:2})` → `{foo:1, rowspan:2}` (no `colspan` key)
  - `getInsertIndex` with row 0 `[A rowspan 2, B, C]`, row 1 `[D, E]`: `(1, 0)` → 0, `(1, 1)` → 0, `(1, 2)` → 1

- [ ] **Step 2: Run** `cd packages/rich-text && yarn vitest run src/plugins/Table/__tests__/grid.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `grid.ts`** and the `hyperscript.d.ts` typing.
- [ ] **Step 4: Run** the same command. Expected: PASS. Then `yarn tsc`.
- [ ] **Step 5: Commit** `feat(rich-text): add span-aware table grid helper`

### Task 2: Span-aware normalization and table size

**Files:**

- Modify: `packages/rich-text/src/plugins/Table/helpers.ts` (`getNoOfMissingTableCellsInRow`)
- Modify: `packages/rich-text/src/plugins/Table/createTablePlugin.ts` (`ELEMENT_TABLE` normalizer list)
- Modify: `packages/rich-text/src/helpers/editor.ts:149` (`getTableSize`)
- Test: `packages/rich-text/src/plugins/Table/__tests__/spanNormalization.test.tsx`

**Interfaces:**

- Consumes: `getTableGrid`, `getSpan`, `spanData` (Task 1)
- Produces: `getNoOfMissingTableCellsInRow(editor, rowEntry): number`, same signature, now `grid.width - occupiedSlotsInRow`, where occupied slots include those covered by rowspans from above. `getTableSize(table)` returns `numColumns = grid.width`.

- [ ] **Step 1: Write failing tests:**
  - `leaves valid colspan content unchanged`: row 0 `[A colspan 2]`, row 1 `[B, C]`. Output equals input.
  - `leaves valid rowspan content unchanged`: row 0 `[A rowspan 2, B]`, row 1 `[C]`. Output equals input (today this wrongly pads row 1).
  - `pads other rows around a wide colspan`: row 0 `[A colspan 3]`, row 1 `[B, C]` → row 1 gets one empty `htd` appended; `A` keeps `colspan: 3`.
  - `clamps rowspan past the last row`: 2 rows, `A rowspan 5` → `rowspan: 2`.
  - `removes invalid and redundant span keys`: `data={{ colspan: 1, rowspan: 0 }}` → `data={{}}`.
  - `does not change span-free tables`: the existing 2×2 fixture round-trips unchanged.
  - `header toggle works with spans`: with row 0 `[A colspan 2]`, `setHeader(editor, true)` makes A an `hth` that keeps `colspan: 2`, and `isTableHeaderEnabled` returns `true`.
  - `getTableSize` with row 0 `[A colspan 2]`, row 1 `[B, C]` → `{ numRows: 2, numColumns: 2 }`.

  To exercise normalization, use `createTestEditor({ input })` then `normalize(editor, { force: true })` (check `test-utils/createTestEditor.ts` for the existing way other normalization tests do it, and use that).

- [ ] **Step 2: Run** `yarn vitest run src/plugins/Table/__tests__/spanNormalization.test.tsx`. Expected: FAIL on the rowspan, wide-colspan, clamp and invalid-key cases.
- [ ] **Step 3: Implement.** Rewrite `getNoOfMissingTableCellsInRow` on the grid. Add an `ELEMENT_TABLE` normalizer rule (`validNode`: every cell's span data is clean and no rowspan passes `grid.height`; `transform`: `setNodes` the cleaned `data` via `spanData`) **before** the existing `validChildren` rule. Rewrite `getTableSize` on the grid.
- [ ] **Step 4: Run** the Table test folder. Expected: PASS, including the existing `createTablePlugin.test.tsx`, `helpers.test.tsx` and `listsInTableCells.test.tsx`.
- [ ] **Step 5: Commit** `fix(rich-text): make table normalization respect colspan and rowspan`

### Task 3: Merge right / Merge down

**Files:**

- Create: `packages/rich-text/src/plugins/Table/actions/mergeCells.ts`
- Modify: `packages/rich-text/src/plugins/Table/actions/index.ts` (export it)
- Test: `packages/rich-text/src/plugins/Table/__tests__/mergeCells.test.tsx`

**Interfaces:**

- Consumes: Task 1 helpers; `isTableHeaderEnabled` (`helpers.ts`)
- Produces:
  - `type CellRect = { row: number; col: number; rowspan: number; colspan: number }` (grid coordinates)
  - `mergeCellBlock(editor: PlateEditor, tablePath: Path, rect: CellRect): void`. Generic: merges every cell fully inside `rect` into the cell at `rect`'s top-left. The caller guarantees no cell sticks out of `rect`. Content goes in reading order and empty cells are skipped (Global Constraints). The cursor ends at the end of the merged cell. Kept generic for future drag-select.
  - `canMergeRight(editor: PlateEditor): boolean`, `canMergeDown(editor: PlateEditor): boolean`. Rules from spec §4: the neighbour slot exists; for right, the same top row and `rowspan`; for down, the same left column and `colspan`; Merge down is disabled from the header row when the header is enabled.
  - `mergeCellRight(editor: PlateEditor): void`, `mergeCellDown(editor: PlateEditor): void`. No-ops when the matching `can*` is false; otherwise call `mergeCellBlock` with the current cell's rect extended by the neighbour.

- [ ] **Step 1: Write failing tests** (cursor marked with `<cursor />`):
  - `merges right`: row `[A|, B]` (cursor in A) → `[A colspan 2]` holding paragraphs `A` then `B`; cursor at the end of `B`.
  - `merges down`: rows `[A|, X]`, `[B, Y]` → row 0 `[A rowspan 2, X]`, row 1 `[Y]`.
  - `skips empty neighbour content`: merging into an empty B leaves only A's paragraph.
  - `keeps lists when merging` (Review Focus 2): A holds `<hul>` with two items, B holds `<hol>` → the merged cell holds the ul followed by the ol, unchanged.
  - `repeated merges build a 2x2 block`: merge right then merge down on a 2×2 → a single cell `colspan 2, rowspan 2`, with row 1 empty of cells; the table stays valid after normalization.
  - `canMergeRight is false` in the last column, and when the right neighbour has a different rowspan.
  - `canMergeDown is false` in the last row; from a header-row cell when the header is enabled; and when the cell below has a different colspan.
  - `undo restores the original table` (Review Focus 1): merge right, then `editor.undo()` → equals the input.
  - `Tab visits every cell in a merged table` (Review Focus 3): table row 0 `[A colspan 2]`, row 1 `[B, C]`, cursor in A. Fire Tab three times using the `fireTab` helper pattern from `listsInTableCells.test.tsx`. The cursor goes through B, then C, and never lands outside the table or repeats.
- [ ] **Step 2: Run** `yarn vitest run src/plugins/Table/__tests__/mergeCells.test.tsx`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `mergeCells.ts`.** Inside `withoutNormalizing`: collect the cells in `rect` from the grid; move non-empty children of the other cells (reading order) to the end of the top-left cell with `moveNodes`; remove the now-redundant cells bottom-right first; set `data` via `spanData`; remove the top-left cell's leading empty paragraph only if it was empty and received content; select the end. If the Tab test fails because of Plate's index-based navigation, fix it in `onKeyDownTable.ts` using the grid, without changing Plate options.
- [ ] **Step 4: Run** the Table test folder. Expected: PASS.
- [ ] **Step 5: Commit** `feat(rich-text): merge table cells right and down`

### Task 4: Split cell

**Files:**

- Create: `packages/rich-text/src/plugins/Table/actions/splitCell.ts`
- Modify: `packages/rich-text/src/plugins/Table/actions/index.ts`
- Test: `packages/rich-text/src/plugins/Table/__tests__/splitCell.test.tsx`

**Interfaces:**

- Consumes: Task 1 helpers (`getInsertIndex`), `isTableHeaderEnabled`
- Produces: `canSplitCell(editor: PlateEditor): boolean` (true when the current cell has colspan or rowspan > 1); `splitCell(editor: PlateEditor): void`.

- [ ] **Step 1: Write failing tests:**
  - `splits a colspan cell`: `[A colspan 2]`, `[B, C]` → `[A, empty]`, `[B, C]`; content stays in A; A's data is `{}`.
  - `splits a rowspan cell`: `[A rowspan 2, X]`, `[Y]` → `[A, X]`, `[empty, Y]` (the empty cell is inserted at child index 0 of row 1).
  - `splits a 2x2 block`: `[A colspan 2 rowspan 2, X]`, `[Y]` → 3×3 with empty cells in the right positions.
  - `uses header cells in the header row`: header enabled, `[A(th) colspan 2]` → `[A(th), empty(th)]`.
  - `canSplitCell is false on a 1x1 cell`.
  - `undo restores the merged cell` (Review Focus 1).
- [ ] **Step 2: Run** `yarn vitest run src/plugins/Table/__tests__/splitCell.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** (inside `withoutNormalizing`, mutate rows bottom-up, insert at `getInsertIndex` computed from the pre-split grid, using the cell type `TABLE_HEADER_CELL` for row 0 when the header is enabled and `TABLE_CELL` otherwise; then clear the spans via `spanData`).
- [ ] **Step 4: Run** the Table test folder. Expected: PASS.
- [ ] **Step 5: Commit** `feat(rich-text): split merged table cells`

### Task 5: Span-aware add row / add column

**Files:**

- Modify: `packages/rich-text/src/plugins/Table/actions/addRow.ts`
- Modify: `packages/rich-text/src/plugins/Table/actions/addColumn.ts`
- Test: `packages/rich-text/src/plugins/Table/__tests__/spanAddRowColumn.test.tsx`

**Interfaces:**

- Consumes: Task 1 helpers
- Produces: unchanged exports `addRowAbove`, `addRowBelow`, `addColumnLeft`, `addColumnRight` (same signatures; the cursor placement stays as today: the first cell of the new row / the new column's top cell).

Rules: the insertion line is the top edge of the current cell (above / left) or its bottom/right edge (below / right) in grid space. A cell crossing the line strictly gets its rowspan/colspan increased by 1 and no new cell for its slots. A cell whose edge is on the line is untouched, and its slots get new cells.

- [ ] **Step 1: Write failing tests:**
  - `add row below through a rowspan`: `[A rowspan 2, B]`, `[C]`, cursor in B → a new row is inserted after row 0; A becomes `rowspan 3`; the new row has 1 cell.
  - `add row below a rowspan's last row does not extend it` (Review Focus 5): same table, cursor in C → A stays `rowspan 2`; the new row has 2 cells.
  - `add column right through a colspan`: `[A colspan 2]`, `[B, C]`, cursor in B → A becomes `colspan 3`; row 1 is `[B, new, C]`.
  - `add column with header enabled` puts an `hth` in the header row only where a new cell is created.
  - The existing span-free add row/column cypress and unit behaviour is unchanged (run the existing tests).
- [ ] **Step 2: Run** `yarn vitest run src/plugins/Table/__tests__/spanAddRowColumn.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** both actions on the grid. The new row's cell count is `width − slots covered by extended cells`. For columns, insert in each row at `getInsertIndex(grid, r, lineCol)`, skipping rows whose slot at the line belongs to an extended cell.
- [ ] **Step 4: Run** the Table test folder. Expected: PASS.
- [ ] **Step 5: Commit** `fix(rich-text): keep merged cells intact when adding rows and columns`

### Task 6: Span-aware delete row / delete column

**Files:**

- Create: `packages/rich-text/src/plugins/Table/actions/deleteRowColumn.ts`
- Modify: `packages/rich-text/src/plugins/Table/actions/index.ts`
- Modify: `packages/rich-text/src/plugins/Table/components/TableActions.tsx` (import `deleteRow`/`deleteColumn` from `../actions` instead of `../../../internal/table`)
- Test: `packages/rich-text/src/plugins/Table/__tests__/spanDeleteRowColumn.test.tsx`

**Interfaces:**

- Consumes: Task 1 helpers
- Produces: `deleteRow(editor: PlateEditor): void`, `deleteColumn(editor: PlateEditor): void`. These replace Plate's in the menu. The target row is the current cell's **origin** row (its Slate parent); the target column is the current cell's origin column. Deleting the last row/column deletes the table (the same as Plate's behaviour today; check it and match it).

Rules (spec §6): a cell crossing the deleted row from above gets `rowspan − 1`. A cell starting in the row with `rowspan > 1` moves to the next row at `getInsertIndex(grid, r+1, c0)`, keeping its content, with `rowspan − 1`. Every other cell in the row is removed with it. Columns work the same way with colspan, except a cell starting in the column with `colspan > 1` stays where it is with `colspan − 1`. After deletion, place the cursor at the start of the cell now occupying the same grid slot (or the slot above/left if it was the last row/column).

- [ ] **Step 1: Write failing tests:**
  - `delete row through a rowspan`: `[A rowspan 2, B]`, `[C]`, cursor in C → `[A, B]` with A `rowspan` removed.
  - `delete a row whose cell spans down` (Review Focus 4): same table, cursor in A → one row `[A, C]`; A has content intact and no rowspan.
  - `delete column through a colspan`: `[A colspan 2]`, `[B, C]`, cursor in C → `[A]`, `[B]`; A has no colspan.
  - `delete column where the colspan starts`: same table, cursor in B → `[A]`, `[C]`.
  - `span-free delete row/column` behaves exactly as before (2×2 fixture).
  - `undo restores the table after delete row`.
- [ ] **Step 2: Run** `yarn vitest run src/plugins/Table/__tests__/spanDeleteRowColumn.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** and switch `TableActions.tsx` to the new imports.
- [ ] **Step 4: Run** the Table test folder and `yarn tsc`. Expected: PASS.
- [ ] **Step 5: Commit** `fix(rich-text): keep merged cells intact when deleting rows and columns`

### Task 7: Table menu, tracking and i18n

**Files:**

- Modify: `packages/rich-text/src/plugins/Table/components/TableActions.tsx`
- Modify: `packages/rich-text/src/plugins/Tracking/createTrackingPlugin.ts` (`RichTextTrackingActionName` gets `'mergeTableCellRight' | 'mergeTableCellDown' | 'splitTableCell'` under `// Tables`)
- Test: `cypress/component/rich-text/RichTextEditor.Tables.spec.ts` (new `describe('Merging cells')` inside `Table Actions`)

**Interfaces:**

- Consumes: `canMergeRight`, `canMergeDown`, `mergeCellRight`, `mergeCellDown`, `canSplitCell`, `splitCell` (Tasks 3–4)
- Produces: menu items with test ids `cf-table-actions-merge-right`, `cf-table-actions-merge-down`, `cf-table-actions-split-cell`

- [ ] **Step 1: Write failing cypress tests** following the existing `Table Actions` tests in the spec file:
  - `merges right`: insert table, type into the first two cells, open the menu, click Merge right. The saved document's first cell has `data: { colspan: 2 }` and both paragraphs.
  - `merges down`: the same with `rowspan: 2`.
  - `splits a merged cell`: after a merge, click Split cell. The document is back to 2 cells with `data: {}`.
  - `disables Merge right in the last column` and `disables Split cell on a plain cell`.
  - `tracks merge`: the `onViewportAction` spy is called with `'mergeTableCellRight'` and `{ tableSize }` (follow how existing table-action tracking is asserted in the spec, if any; otherwise assert via the onAction stub the spec already sets up).
- [ ] **Step 2: Run** `yarn build` then the rich-text component spec (see `CONTRIBUTING.md` for the exact cypress command). Expected: FAIL (items missing).
- [ ] **Step 3: Implement.** Add a `Menu.Divider` and the three `Menu.Item`s between "Add column right" and the header toggle, with `disabled={!canX(editor)}` computed like `canInsertRowAbove`. Labels use `t({ id: 'FieldEditors.RichText.Table.MergeRight', message: 'Merge right' })`, `…MergeDown` / `'Merge down'` and `…SplitCell` / `'Split cell'`. Route them through the existing `action(...)` wrapper: widen its `type` parameter to `'insert' | 'remove' | 'merge' | 'split'`, and give it an explicit tracking-name override so the names match the ones above exactly.
- [ ] **Step 4: Run** `yarn build` and the cypress spec again. Expected: PASS. Run `cd packages/rich-text && yarn lint && yarn tsc`.
- [ ] **Step 5: Commit** `feat(rich-text): add merge and split actions to the table menu`

### Task 8: Full verification

- [ ] **Step 1: Run** `yarn && yarn build && yarn lint && yarn tsc && yarn test:ci` from the repo root. Expected: all green.
- [ ] **Step 2:** Manually exercise in Storybook / the dev app (`run` skill): merge, split, add/delete rows and columns through merged cells, undo, then reload the saved value. Confirm nothing shifts.
- [ ] **Step 3:** Draft the PR description. It must state that delivery renderers need to honour `data.colspan`/`data.rowspan`, and list the v1 limitations: no drag-select merging, no span-aware paste, Shift+arrow selection is not span-aware.
