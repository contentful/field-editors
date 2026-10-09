import * as table from '@platejs/table';
import { onKeyDownTable as onNativeKeyDownTable } from '@platejs/table/react';
import {
  KEYS,
  assignLegacyApi,
  assignLegacyTransforms,
  getEditorPlugin as getSlateEditorPlugin,
} from 'platejs';
import { getEditorPlugin } from 'platejs/react';

import type { PlateEditor } from './types/editor';
import type { PlatePlugin } from './types/plugins';

export * from '@platejs/table';
export const ELEMENT_TABLE = KEYS.table;
export const ELEMENT_TR = KEYS.tr;
export const ELEMENT_TD = KEYS.td;
export const ELEMENT_TH = KEYS.th;
const applyOverride = (
  editor: PlateEditor,
  override: (context: any) => { api?: any; transforms?: any },
) => {
  const overrides = override(getEditorPlugin(editor, table.BaseTablePlugin));
  if (overrides.api) {
    assignLegacyApi(editor, overrides.api);
  }
  if (overrides.transforms) {
    assignLegacyTransforms(editor, overrides.transforms);
  }
  return editor;
};
export const withDeleteTable = (editor: PlateEditor) => {
  const { deleteBackward, deleteForward } = editor;
  editor.deleteBackward = (unit) => {
    if (!table.preventDeleteTableCell(editor, { unit })) deleteBackward(unit);
  };
  editor.deleteForward = (unit) => {
    if (!table.preventDeleteTableCell(editor, { unit, reverse: true })) deleteForward(unit);
  };
  return applyOverride(editor, table.withDeleteTable);
};
export const withGetFragmentTable = (editor: PlateEditor, _plugin?: PlatePlugin) =>
  applyOverride(editor, table.withGetFragmentTable);
export const withInsertFragmentTable = (editor: PlateEditor, _plugin?: PlatePlugin) => {
  const { insertFragment } = editor;
  editor.insertFragment = (fragment) => {
    // Plate registers row/column insertion after our legacy overrides. Resolve
    // its paste handler here so it captures those methods once they exist.
    const context = getSlateEditorPlugin(editor, table.BaseTablePlugin);
    table.withInsertFragmentTable({ ...context, tf: { ...context.tf, insertFragment } }).transforms!
      .insertFragment!(fragment);
  };
  return editor;
};
export const withInsertTextTable = (editor: PlateEditor, _plugin?: PlatePlugin) =>
  applyOverride(editor, table.withInsertTextTable);
export const withSelectionTable = (editor: PlateEditor) =>
  applyOverride(editor, table.withTableCellSelection);
export const withSetFragmentDataTable = (editor: PlateEditor) =>
  applyOverride(editor, table.withSetFragmentDataTable);
export const onKeyDownTable: (
  editor: PlateEditor,
  plugin: PlatePlugin,
) => (event: React.KeyboardEvent) => void =
  (editor: PlateEditor, _plugin: PlatePlugin) => (event: React.KeyboardEvent) =>
    onNativeKeyDownTable({ ...getEditorPlugin(editor, table.BaseTablePlugin), event });
