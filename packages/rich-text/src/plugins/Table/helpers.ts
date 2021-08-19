import { Editor, Path, Transforms } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { SPEditor } from '@udecode/slate-plugins-core';
import {
  insertTable,
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TD,
  ELEMENT_TR,
} from '@udecode/slate-plugins-table';
import { getNodeEntryFromSelection, isBlockSelected } from '../../helpers/editor';
import { CustomSlatePluginOptions } from '../../types';

function getSelectedTableEntry(editor: SPEditor) {
  return getNodeEntryFromSelection(editor, BLOCKS.TABLE);
}

function getLastNonTextNodePathIndex(editor: SPEditor, path: Path): number {
  const [lastNode] = Editor.node(editor, path);
  const indexOffset = Object.hasOwnProperty.call(lastNode, 'text') ? 2 : 1;
  return path.length - indexOffset;
}

/**
 * Builds a path object to return a paragraph trailing a newly inserted
 * table, based on the editor's current focus path.
 *
 * If there is no selection, returns false.
 *
 * (This is consisent with other plugins - we don't do element inserts
 * unless the editor is focused)
 */
function getTrailingParagraphInsertPath(editor: SPEditor): Path | false {
  if (!editor.selection) return false;
  const { path } = editor.selection.focus;
  const lastNonTextNodePathIndex = getLastNonTextNodePathIndex(editor, path);
  return path.slice(0, lastNonTextNodePathIndex).concat(path[lastNonTextNodePathIndex] + 2);
}

/**
 * Sets the UI focus to the first cell of the selected table.
 *
 * This is necessary because udecode's plugin sets the focus to the
 * _last_ cell of the table after selection, which is weird.
 */
function moveToFirstCellFromSelectedTable(editor) {
  const [, tablePath] = getSelectedTableEntry(editor);
  if (!tablePath) return;
  const firstTableCellPath = tablePath.concat([
    0, // -> row
    0, // -> cell
    0, // -> paragraph
    0, // -> text node
  ]);
  const anchor = { path: firstTableCellPath, offset: 0 };
  Transforms.setSelection(editor, { anchor, focus: anchor });
}

/**
 * This is necessary to work around a bug with the slate UI as
 * currently implemented, where nothing can be inserted after
 * a table unless there's a trailing paragraph (or another element)
 * after the table.
 *
 * This is not ideal, since editors will not always want a trailing
 * paragraph at the end of their content.
 *
 * TODO: Allow creating a paragraph after a table if the editor
 * has selected the space outside the table. (Unfortunately
 * the `path` can't distinguish between this region and the last
 * character of the last cell of the table, so some UI hackery
 * may be necessary to accomplish this.)
 */
export function insertTableWithTrailingParagraph(
  editor: SPEditor,
  withTableOptions: CustomSlatePluginOptions
): void {
  const insertPath = getTrailingParagraphInsertPath(editor);
  if (!insertPath) return;
  const isTableCellSelected = getSelectedTableEntry(editor).length;
  if (isTableCellSelected) return;

  insertTable(editor, withTableOptions);
  moveToFirstCellFromSelectedTable(editor);
  const paragraph = {
    type: BLOCKS.PARAGRAPH,
    data: {},
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, paragraph, { at: insertPath });
}

export function isTableActive(editor: SPEditor) {
  const tableElements = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];
  return tableElements.some((el) => isBlockSelected(editor, el));
}
