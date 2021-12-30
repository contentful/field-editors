import { Transforms } from 'slate';
import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { getBlockAbove, HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
import {
  createTablePlugin as createDefaultTablePlugin,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  onKeyDownTable,
} from '@udecode/plate-table';

import { TrackingProvider } from '../../TrackingProvider';
import {
  currentSelectionPrecedesTableCell,
  currentSelectionStartsTableCell,
  isRootLevel,
} from '../../helpers/editor';
import { RichTextPlugin, CustomElement } from '../../types';
import { transformLift, transformParagraphs } from '../../helpers/transformers';
import { Table } from './components/Table';
import { Row } from './components/Row';
import { HeaderCell } from './components/HeaderCell';
import { Cell } from './components/Cell';
import { addTableTrackingEvents } from './addTableTrackingEvents';

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
