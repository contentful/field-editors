// copied from plate's source code as they are including an empty paragraph everytime they insert a table
// and we don't want that
import {
  ELEMENT_DEFAULT,
  getEndPoint,
  getPluginType,
  getStartPoint,
  getTEditor,
  hasNode,
  replaceNodeChildren,
  select,
  TElement,
  withoutNormalizing,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { ELEMENT_TABLE, getTableAbove, getTableGridAbove } from '@udecode/plate-table';
import cloneDeep from 'lodash/cloneDeep.js';
import { Path } from 'slate';

import { insertNodes, PlateEditor } from '../../internal';

/**
 * If inserting a table,
 * If block above anchor is a table,
 * - Replace each cell above by the inserted table until out of bounds.
 * - Select the inserted cells.
 */
export const withInsertFragmentTable = (editor: PlateEditor, { options }: WithPlatePlugin) => {
  const { insertFragment } = editor;
  const { disableExpandOnInsert, insertColumn, insertRow } = options;

  const myEditor = getTEditor(editor);

  myEditor.insertFragment = (fragment) => {
    const insertedTable = fragment.find(
      (n) => (n as TElement).type === getPluginType(editor, ELEMENT_TABLE)
    );

    if (!insertedTable) {
      const tableEntry = getTableAbove(editor, {
        at: editor.selection?.anchor,
      });

      if (tableEntry) {
        const cellEntries = getTableGridAbove(editor, {
          format: 'cell',
        });

        if (cellEntries.length > 1) {
          cellEntries.forEach((cellEntry) => {
            if (cellEntry) {
              const [, cellPath] = cellEntry;

              replaceNodeChildren(editor, {
                at: cellPath,
                nodes: cloneDeep(fragment) as any,
              });
            }
          });

          select(editor, {
            anchor: getStartPoint(editor, cellEntries[0][1]),
            focus: getEndPoint(editor, cellEntries.at(-1)![1]),
          });
          return;
        }
      }
    }

    if (insertedTable) {
      const tableEntry = getTableAbove(editor, {
        at: editor.selection?.anchor,
      });

      // inserting inside table
      if (tableEntry) {
        const [cellEntry] = getTableGridAbove(editor, {
          at: editor.selection?.anchor,
          format: 'cell',
        });

        if (cellEntry) {
          withoutNormalizing(editor, () => {
            const [, startCellPath] = cellEntry;
            const cellPath = [...startCellPath];

            const startColIndex = cellPath.at(-1)!;
            let lastCellPath: Path | null = null;

            let initRow = true;
            const insertedRows = (insertedTable as TElement).children as TElement[];
            insertedRows.forEach((row) => {
              cellPath[cellPath.length - 1] = startColIndex;

              // last inserted row
              if (!initRow) {
                const fromRow = cellPath.slice(0, -1);
                cellPath[cellPath.length - 2] += 1;

                if (!hasNode(editor, cellPath)) {
                  if (disableExpandOnInsert) {
                    return;
                  } else {
                    insertRow?.(editor, {
                      fromRow,
                    });
                  }
                }
              }
              initRow = false;

              const insertedCells = row.children as TElement[];
              let initCell = true;

              insertedCells.forEach((cell) => {
                if (!initCell) {
                  const fromCell = [...cellPath];
                  cellPath[cellPath.length - 1] += 1;

                  if (!hasNode(editor, cellPath)) {
                    if (disableExpandOnInsert) {
                      return;
                    } else {
                      insertColumn?.(editor, {
                        fromCell,
                      });
                    }
                  }
                }
                initCell = false;

                replaceNodeChildren(editor, {
                  at: cellPath,
                  nodes: cloneDeep(cell.children as any),
                });

                lastCellPath = [...cellPath];
              });
            });

            if (lastCellPath) {
              select(editor, {
                anchor: getStartPoint(editor, startCellPath),
                focus: getEndPoint(editor, lastCellPath),
              });
            }
          });

          return;
        }
      } else if (fragment.length === 1 && fragment[0].type === ELEMENT_TABLE) {
        // needed to insert as node, otherwise it will be inserted as text
        insertNodes(editor, fragment, {
          removeEmpty: {
            // removes empty paragraph before table
            exclude: [ELEMENT_DEFAULT],
          },
        });
        return;
      }
    }

    insertFragment(fragment);
  };

  return editor;
};
