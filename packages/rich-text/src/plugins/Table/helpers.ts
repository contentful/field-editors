import { Editor, Path, Transforms } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { SPEditor } from '@udecode/slate-plugins-core';
import {
  insertTable,
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  deleteTable,
} from '@udecode/slate-plugins-table';
import { getNodeEntryFromSelection } from '../../helpers/editor';
import { CustomElement, CustomSlatePluginOptions } from '../../types';

export enum KEYBOARD_TRIGGERS {
  INSERT_TABLE = ',',
  ADD_COLUMN = 'ArrowRight',
  ADD_ROW = 'ArrowDown',
  DELETE_COLUMN = 'ArrowLeft',
  DELETE_ROW = 'ArrowUp',
  DELETE_SELECTION = 'Backspace',
};

export const getKeyboardEvents = (withTableOptions) => {
  return {
    [KEYBOARD_TRIGGERS.INSERT_TABLE]: (editor) => insertTableWithTrailingParagraph(editor, withTableOptions),
    [KEYBOARD_TRIGGERS.ADD_COLUMN]: (editor) => addColumn(editor, withTableOptions),
    [KEYBOARD_TRIGGERS.ADD_ROW]: (editor) => addRow(editor, withTableOptions),
    [KEYBOARD_TRIGGERS.DELETE_SELECTION]: (editor) => deleteSelection(editor),
    [KEYBOARD_TRIGGERS.DELETE_COLUMN]: deleteElementOrTable(deleteColumn),
    [KEYBOARD_TRIGGERS.DELETE_ROW]: deleteElementOrTable(deleteRow),
  }
};

function getSelectedTableEntry(editor: SPEditor) {
  return getNodeEntryFromSelection(editor, BLOCKS.TABLE);
}

function isSingleCellRow (node: CustomElement): boolean {
  return node.type === BLOCKS.TABLE_ROW && node.children.length === 1
}

function isSingleRowTable (node: CustomElement): boolean {
  return node.type === BLOCKS.TABLE && node.children.length === 1;
}

function isSingleCellTable (node: CustomElement): boolean {
  return isSingleRowTable(node) && isSingleCellRow(node.children[0] as CustomElement);
}

function currentSelectionIsSingleCellTable(editor: SPEditor): boolean {
  const [tableEntry] = getSelectedTableEntry(editor);
  return !!tableEntry && isSingleCellTable(tableEntry);
}

/**
 * Allows deleting rows or columns progressively via the
 * keyboard shortcuts until we get to the last cell, at which
 * point we delete the whole table.
 * 
 * Note that this won't delete the last row if there are still
 * many columns, or the last column if there are still many rows.
 * Only single-cell tables are deleted.
 */
type ElementDeleter = (editor: SPEditor) => void;
function deleteElementOrTable (deleteTableElement: ElementDeleter): ElementDeleter {
  return function deleteTableOrTableElement (editor) {
    if (currentSelectionIsSingleCellTable(editor)) {
      deleteTable(editor);
    } else {
      deleteTableElement(editor);
    }
  }
}

/**
 * Allows progressive deletion using cmd+backspace.
 * 
 * Algorithm is:
 * - delete current column
 * - if there is only one column, delete current row
 * - if there is only one row, delete current column
 * - if we are in a single-cell table, delete the whole table
 * 
 * Alternatively you can always delete a table and its
 * content by selecting the whole table and hitting backspace,
 * like with other elements.
 */
function deleteSelection (editor: SPEditor): void {
  const [table] = getSelectedTableEntry(editor);
  if (!table) return;

  const [firstRow] = table.children as CustomElement[];
  const hasManyRows = !isSingleRowTable(table);
  const hasManyColumns = !isSingleCellRow(firstRow);

  if (hasManyRows && hasManyColumns) {
    deleteColumn(editor);
  } else if (hasManyRows) {
    deleteRow(editor);
  } else if (hasManyColumns) {
    deleteColumn(editor);
  } else {
    deleteTable(editor);
  }
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
  const lastNonTextNodePathIndex = getLastNonTextNodePathIndex(editor, path)
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
function insertTableWithTrailingParagraph(editor: SPEditor, withTableOptions: CustomSlatePluginOptions): void {
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
};
