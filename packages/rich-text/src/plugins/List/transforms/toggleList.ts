import { BLOCKS } from '@contentful/rich-text-types';
import {
  ELEMENT_DEFAULT,
  findNode,
  getAbove,
  getNodes,
  getPluginType,
  isCollapsed,
  isRangeAcrossBlocks,
  PlateEditor,
  setNodes,
  TElement,
  unwrapNodes,
  wrapNodes,
} from '@udecode/plate-core';
import { ELEMENT_LIC } from '@udecode/plate-list';
import { getListItemEntry } from '@udecode/plate-list';
import { Editor, Node, NodeEntry, Path, Range } from 'slate';

const listTypes = [BLOCKS.UL_LIST, BLOCKS.OL_LIST] as string[];

const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
  Editor.withoutNormalizing(editor, () => {
    do {
      unwrapNodes(editor, {
        at,
        match: { type: BLOCKS.LIST_ITEM },
        split: true,
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: listTypes,
        },
        split: true,
      });
    } while (getAbove(editor, { match: { type: listTypes, at } }));
  });
};

export const toggleList = (editor: PlateEditor, { type }: { type: string }) =>
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
      const commonEntry = Node.common(editor, startPoint.path, endPoint.path);

      if (
        listTypes.includes((commonEntry[0] as TElement).type) ||
        (commonEntry[0] as TElement).type === BLOCKS.LIST_ITEM
      ) {
        if ((commonEntry[0] as TElement).type !== type) {
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
              mode: 'all',
            })
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
