import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import {
  getBlockAbove,
  getParent,
  HotkeyPlugin,
  KeyboardHandler,
  getLastChildPath,
  WithPlatePlugin,
  getText,
  getAbove,
} from '@udecode/plate-core';
import {
  createTablePlugin as createDefaultTablePlugin,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  onKeyDownTable,
  withTable,
} from '@udecode/plate-table';
import { NodeEntry, Path, Transforms } from 'slate';

import {
  currentSelectionPrecedesTableCell,
  currentSelectionStartsTableCell,
  isRootLevel,
} from '../../helpers/editor';
import { insertEmptyParagraph } from '../../helpers/editor';
import { transformLift, transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { RichTextPlugin, CustomElement, RichTextEditor } from '../../types';
import { addTableTrackingEvents } from './addTableTrackingEvents';
import { Cell } from './components/Cell';
import { HeaderCell } from './components/HeaderCell';
import { Row } from './components/Row';
import { Table } from './components/Table';
import {
  createEmptyTableCells,
  getNoOfMissingTableCellsInRow,
  isNotEmpty,
  isTable,
} from './helpers';

const createTableOnKeyDown: KeyboardHandler<RichTextEditor, HotkeyPlugin> = (editor, plugin) => {
  const defaultHandler = onKeyDownTable(editor, plugin as WithPlatePlugin);

  return (event) => {
    if (
      (event.key === 'Backspace' && currentSelectionStartsTableCell(editor)) ||
      (event.key === 'Delete' && currentSelectionPrecedesTableCell(editor))
    ) {
      // The default behavior here would be to delete the preceding or forthcoming
      // leaf node, in this case a cell or header cell. But we don't want to do that,
      // because it would leave us with a non-standard number of table cells.
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.key === 'Enter') {
      const windowSelection = window.getSelection();

      if (windowSelection) {
        // @ts-expect-error
        const blockType = windowSelection.anchorNode.attributes?.['data-block-type']?.value; // this attribute comes from `plugins/Table/components/Table.tsx`
        const isBeforeTable = blockType === BLOCKS.TABLE;

        if (isBeforeTable) {
          const above = getAbove(editor, { match: { type: BLOCKS.TABLE } });

          if (!above) return;

          const [, tablePath] = above;

          insertEmptyParagraph(editor, { at: tablePath, select: true });

          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    }

    defaultHandler(event);
  };
};

export const createTablePlugin = (): RichTextPlugin =>
  createDefaultTablePlugin({
    type: BLOCKS.TABLE,
    handlers: {
      onKeyDown: createTableOnKeyDown,
    },
    withOverrides: (editor, plugin) => {
      // injects important fixes from plate's original table plugin
      withTable(editor, plugin as WithPlatePlugin<{}, {}>);

      addTableTrackingEvents(editor as RichTextEditor);

      const { insertFragment } = editor;

      editor.insertFragment = (fragments) => {
        // We need to make sure we have a new, empty and clean paragraph in order to paste tables as-is due to how Slate behaves
        // More info: https://github.com/ianstormtaylor/slate/pull/4489 and https://github.com/ianstormtaylor/slate/issues/4542
        const isInsertingTable = fragments.some((fragment) => isTable(fragment as CustomElement));
        const isTableFirstFragment =
          fragments.findIndex((fragment) => isTable(fragment as CustomElement)) === 0;
        const currentLineHasText = getText(editor, editor.selection?.focus.path) !== '';

        if (isInsertingTable && isTableFirstFragment && currentLineHasText) {
          insertEmptyParagraph(editor);
        }

        insertFragment(fragments);
      };

      return editor;
    },
    overrideByKey: {
      [ELEMENT_TABLE]: {
        type: BLOCKS.TABLE,
        component: Table,
        normalizer: [
          {
            validNode: isNotEmpty,
          },
          {
            // Move to root level unless nested
            validNode: (editor, [, path]) => {
              const isNestedTable = !!getBlockAbove(editor, {
                at: path,
                match: {
                  type: [BLOCKS.TABLE_CELL, BLOCKS.TABLE_HEADER_CELL],
                },
              });

              return isRootLevel(path) || isNestedTable;
            },
            transform: transformLift,
          },
          {
            validChildren: CONTAINERS[BLOCKS.TABLE],
          },
        ],
      },
      [ELEMENT_TR]: {
        type: BLOCKS.TABLE_ROW,
        component: Row,
        normalizer: [
          {
            validChildren: CONTAINERS[BLOCKS.TABLE_ROW],
            transform: transformWrapIn(BLOCKS.TABLE_CELL),
          },
          {
            // Remove empty rows
            validNode: isNotEmpty,
          },
          {
            // Parent must be a table
            validNode: (editor, [, path]) => {
              const parent = getParent(editor, path)?.[0];
              return parent && parent.type === BLOCKS.TABLE;
            },
            transform: transformWrapIn(BLOCKS.TABLE),
          },
          {
            // ensure consistent number of cells in each row
            validNode: (editor, entry) => {
              return getNoOfMissingTableCellsInRow(editor, entry) === 0;
            },
            transform: (editor, entry) => {
              const howMany = getNoOfMissingTableCellsInRow(editor, entry);
              const at = Path.next(getLastChildPath(entry as NodeEntry<CustomElement>));

              Transforms.insertNodes(editor, createEmptyTableCells(howMany), {
                at,
              });
            },
          },
        ],
      },
      [ELEMENT_TH]: {
        type: BLOCKS.TABLE_HEADER_CELL,
        component: HeaderCell,
        normalizer: [
          {
            validChildren: CONTAINERS[BLOCKS.TABLE_HEADER_CELL],
            transform: transformParagraphs,
          },
        ],
      },
      [ELEMENT_TD]: {
        type: BLOCKS.TABLE_CELL,
        component: Cell,
        normalizer: [
          {
            validChildren: CONTAINERS[BLOCKS.TABLE_CELL],
            transform: transformParagraphs,
          },
        ],
      },
    } as Record<string, Partial<RichTextPlugin>>,
  });
