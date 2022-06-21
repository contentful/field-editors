import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { getBlockAbove, getParent, getLastChildPath, WithPlatePlugin } from '@udecode/plate-core';
import {
  createTablePlugin as createDefaultTablePlugin,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  withTable,
} from '@udecode/plate-table';
import { NodeEntry, Path, Transforms } from 'slate';

import { isRootLevel } from '../../helpers/editor';
import { transformLift, transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { RichTextPlugin, CustomElement, RichTextEditor } from '../../types';
import { Cell } from './components/Cell';
import { HeaderCell } from './components/HeaderCell';
import { Row } from './components/Row';
import { Table } from './components/Table';
import { createEmptyTableCells, getNoOfMissingTableCellsInRow, isNotEmpty } from './helpers';
import { insertTableFragment } from './insertTableFragment';
import { onKeyDownTable } from './onKeyDownTable';
import { addTableTrackingEvents, withInvalidCellChildrenTracking } from './tableTracking';

export const createTablePlugin = (): RichTextPlugin =>
  createDefaultTablePlugin({
    type: BLOCKS.TABLE,
    handlers: {
      onKeyDown: onKeyDownTable,
    },
    withOverrides: (editor, plugin) => {
      // injects important fixes from plate's original table plugin
      withTable(editor, plugin as WithPlatePlugin<{}, {}>);

      addTableTrackingEvents(editor as RichTextEditor);

      editor.insertFragment = insertTableFragment(editor);

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
            transform: withInvalidCellChildrenTracking(transformParagraphs),
          },
        ],
      },
      [ELEMENT_TD]: {
        type: BLOCKS.TABLE_CELL,
        component: Cell,
        normalizer: [
          {
            validChildren: CONTAINERS[BLOCKS.TABLE_CELL],
            transform: withInvalidCellChildrenTracking(transformParagraphs),
          },
        ],
      },
    } as Record<string, Partial<RichTextPlugin>>,
  });
