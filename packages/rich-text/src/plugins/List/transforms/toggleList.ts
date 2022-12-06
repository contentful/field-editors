/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS } from '@contentful/rich-text-types';
import {
  ELEMENT_DEFAULT,
  findNode,
  getNodes,
  getPluginType,
  isCollapsed,
  isRangeAcrossBlocks,
  PlateEditor,
  setNodes,
  TElement,
  wrapNodes,
} from '@udecode/plate-core';
import { ELEMENT_LIC } from '@udecode/plate-list';
import { getListItemEntry } from '@udecode/plate-list';
import { Editor, Node, NodeEntry, Range } from 'slate';

import { unwrapList } from './unwrapList';

const listTypes = [BLOCKS.UL_LIST, BLOCKS.OL_LIST] as string[];

export const toggleList = (editor: PlateEditor, { type }: { type: string }) =>
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
  Editor.withoutNormalizing(editor, () => {
    if (!editor.selection) {
      return;
    }

    if (isCollapsed(editor.selection) || !isRangeAcrossBlocks(editor)) {
      // selection is collapsed
      const res = getListItemEntry(editor);

      if (res) {
        const { list } = res;
        if (list[0].type !== type) {
          setNodes(
            editor,
            { type },
            {
              at: editor.selection,
              // eslint-disable-next-line -- TODO: check this
              // @ts-ignore
              match: (n) => listTypes.includes(n.type),
              mode: 'lowest',
            }
          );
        } else {
          unwrapList(editor);
        }
      } else {
        const list = { type, children: [], data: {} };
        wrapNodes(editor, list);

        const nodes = [
          ...getNodes(editor, {
            // eslint-disable-next-line -- TODO: check this
            // @ts-ignore
            match: { type: getPluginType(editor, ELEMENT_DEFAULT) },
          }),
        ];

        const listItem = {
          type: BLOCKS.LIST_ITEM,
          children: [],
          data: {},
        };

        for (const [, path] of nodes) {
          wrapNodes(editor, listItem, {
            at: path,
          });
        }
      }
    } else {
      // selection is a range

      const [startPoint, endPoint] = Range.edges(editor.selection);
      const commonEntry = Node.common(
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        editor,
        startPoint.path,
        endPoint.path
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
      ) as NodeEntry<TElement>;

      if (
        listTypes.includes((commonEntry[0] as TElement).type) ||
        commonEntry[0].type === BLOCKS.LIST_ITEM
      ) {
        let listType = commonEntry[0].type;
        if (commonEntry[0].type === BLOCKS.LIST_ITEM) {
          // eslint-disable-next-line -- TODO: check this
          // @ts-ignore
          listType = (Editor.parent(editor, commonEntry[1])[0] as TElement).type;
        }
        if (listType !== type) {
          const startList = findNode(editor, {
            at: Range.start(editor.selection),
            match: { type: listTypes },
            mode: 'lowest',
          });

          const endList = findNode(editor, {
            at: Range.end(editor.selection),
            match: { type: listTypes },
            mode: 'lowest',
          });

          if (!startList || !endList) {
            return;
          }

          const rangeLength = Math.min(startList[1].length, endList[1].length);
          setNodes(
            editor,
            { type },
            {
              at: editor.selection,
              // eslint-disable-next-line -- TODO: check this
              // @ts-ignore
              match: (n, path) => listTypes.includes(n.type) && path.length >= rangeLength,
              mode: 'all',
            }
          );
        } else {
          unwrapList(editor);
        }
      } else {
        const rootPathLength = commonEntry[1].length;
        const nodes = (
          Array.from(
            getNodes(editor, {
              // eslint-disable-next-line -- TODO: check this
              // @ts-ignore
              mode: 'all',
            })
            // eslint-disable-next-line -- TODO: check this
            // @ts-ignore
          ) as NodeEntry<TElement>[]
        )
          .filter(([, path]) => path.length === rootPathLength + 1)
          .reverse();

        nodes.forEach((n) => {
          if (listTypes.includes(n[0].type)) {
            setNodes(editor, { type }, { at: n[1] });
          } else {
            setNodes(editor, { type: getPluginType(editor, ELEMENT_LIC) }, { at: n[1] });

            const listItem = {
              type: BLOCKS.LIST_ITEM,
              children: [],
              data: {},
            };

            wrapNodes(editor, listItem, {
              at: n[1],
            });

            const list = { type, children: [], data: {} };
            wrapNodes(editor, list, { at: n[1] });
          }
        });
      }
    }
  });
