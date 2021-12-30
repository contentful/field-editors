import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import {
  getBlockAbove,
  getParent,
  HotkeyPlugin,
  KeyboardHandler,
  getLastChildPath,
} from '@udecode/plate-core';
import {
  createTablePlugin as createDefaultTablePlugin,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  onKeyDownTable,
} from '@udecode/plate-table';
import { NodeEntry, Path, Transforms } from 'slate';

import {
  currentSelectionPrecedesTableCell,
  currentSelectionStartsTableCell,
  isRootLevel,
} from '../../helpers/editor';
import { transformLift, transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { TrackingProvider } from '../../TrackingProvider';
import { RichTextPlugin, CustomElement } from '../../types';
import { addTableTrackingEvents } from './addTableTrackingEvents';
import { Cell } from './components/Cell';
import { HeaderCell } from './components/HeaderCell';
import { Row } from './components/Row';
import { Table } from './components/Table';
import { createEmptyTableCells, getNoOfMissingTableCellsInRow, isNotEmpty } from './helpers';

const createTableOnKeyDown: KeyboardHandler<{}, HotkeyPlugin> = (editor, plugin) => {
  const defaultHandler = onKeyDownTable(editor, plugin);

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

    defaultHandler(event);
  };
};

export const createTablePlugin = (tracking: TrackingProvider): RichTextPlugin =>
  createDefaultTablePlugin({
    type: BLOCKS.TABLE,
    handlers: {
      onKeyDown: createTableOnKeyDown,
    },
    withOverrides: (editor) => {
      addTableTrackingEvents(editor, tracking);

      const { insertFragment } = editor;

      editor.insertFragment = (fragments) => {
        // We need to make sure we have a new, empty and clean paragraph in order to paste tables as-is due to how Slate behaves
        // More info: https://github.com/ianstormtaylor/slate/pull/4489 and https://github.com/ianstormtaylor/slate/issues/4542
        const fragmentHasTable = fragments.some(
          (fragment) => (fragment as CustomElement).type === BLOCKS.TABLE
        );
        if (fragmentHasTable) {
          const emptyParagraph: CustomElement = {
            type: BLOCKS.PARAGRAPH,
            children: [{ text: '' }],
            data: {},
            isVoid: false,
          };
          Transforms.insertNodes(editor, emptyParagraph);
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
