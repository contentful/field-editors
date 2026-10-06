import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';

import { isRootLevel } from '../../helpers/editor';
import { transformLift, transformParagraphs, transformWrapIn } from '../../helpers/transformers';
import { createTablePlugin as createDefaultTablePlugin } from '../../internal/pluginFactories';
import {
  getParentNode,
  getBlockAbove,
  getLastChildPath,
  getNextPath,
} from '../../internal/queries';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  withDeleteTable,
  withGetFragmentTable,
  withInsertTextTable,
  withSelectionTable,
  withSetFragmentDataTable,
  withInsertFragmentTable,
} from '../../internal/table';
import { insertNodes } from '../../internal/transforms';
import { PlatePlugin } from '../../internal/types';
import { Cell } from './components/Cell';
import { HeaderCell } from './components/HeaderCell';
import { Row } from './components/Row';
import { Table } from './components/Table';
import { createEmptyTableCells, getNoOfMissingTableCellsInRow, isNotEmpty } from './helpers';
import { insertTableFragment } from './insertTableFragment';
import { onKeyDownTable } from './onKeyDownTable';
import { addTableTrackingEvents, withInvalidCellChildrenTracking } from './tableTracking';
import { withInsertFragmentTableOverride } from './withInsertFragmentTableOverride';

export const createTablePlugin = (): PlatePlugin =>
  createDefaultTablePlugin({
    type: BLOCKS.TABLE,
    handlers: {
      onKeyDown: onKeyDownTable,
    },
    withOverrides: (editor, plugin) => {
      const { normalizeNode } = editor;
      // injects important fixes from plate's original table plugin
      editor = withDeleteTable(editor);
      editor = withGetFragmentTable(editor, plugin);
      editor = withInsertFragmentTable(editor, plugin);
      // overrides insertFragment to handle table insertion to not add empty paragraph before table
      editor = withInsertFragmentTableOverride(editor);
      editor = withInsertTextTable(editor, plugin);
      editor = withSelectionTable(editor);
      editor = withSetFragmentDataTable(editor);

      // Resets all normalization rules added by @platejs/table as
      // they conflict with our own
      editor.normalizeNode = normalizeNode;

      addTableTrackingEvents(editor);

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
              // Nested tables are handled by another normalization
              // rule in a the table cell level
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
              const parent = getParentNode(editor, path)?.[0];
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
              const at = getNextPath(getLastChildPath(entry));

              insertNodes(editor, createEmptyTableCells(howMany), {
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
    } as Record<string, Partial<PlatePlugin>>,
  });
