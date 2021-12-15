import { Node as SlateNode, Transforms } from 'slate';
import { PlatePlugin } from '@udecode/plate-core';
import { getNodes } from '@udecode/plate-common';
import { BLOCKS, CONTAINERS, INLINES } from '@contentful/rich-text-types';

import { CustomElement } from '../../types';

export function createDragAndDropPlugin(): PlatePlugin {
  // Elements that don't allow other elements to be dragged into them and which callback should be used
  const DND_BLOCKED_ELEMENTS = {
    [BLOCKS.QUOTE]: Transforms.liftNodes,
  };

  const DRAGGABLE_TYPES: string[] = [
    BLOCKS.EMBEDDED_ENTRY,
    BLOCKS.EMBEDDED_ASSET,
    BLOCKS.HR,
    INLINES.EMBEDDED_ENTRY,
  ];

  /**
   * HTML node names where dropping should be allowed
   * Usually for elements where `Transforms.removeNodes` is needed
   * TODO: looking up for html nodes is not the best solution and it won't scale but it works fine for our current cases/elements
   */
  const ON_DROP_ALLOWED_TYPES = {
    TABLE: [INLINES.EMBEDDED_ENTRY],
  };

  return {
    withOverrides: (editor) => {
      const { normalizeNode } = editor;

      editor.normalizeNode = (entry) => {
        const [node, path] = entry;

        Object.keys(DND_BLOCKED_ELEMENTS).forEach((blockedElementType) => {
          const nodeType = (node as CustomElement).type;

          if (SlateNode.isNode(node) && nodeType === blockedElementType) {
            for (const [child, childPath] of SlateNode.children(editor, path)) {
              const childType = (child as CustomElement).type;

              if (!CONTAINERS[blockedElementType]) return;
              if (!CONTAINERS[blockedElementType].includes(childType)) {
                const callback = DND_BLOCKED_ELEMENTS[blockedElementType];
                callback(editor, {
                  at: childPath,
                  match: (matchNode) =>
                    SlateNode.isNode(matchNode) &&
                    DRAGGABLE_TYPES.includes((matchNode as CustomElement).type),
                });

                return;
              }
            }
          }
        });

        normalizeNode(entry);
      };

      return editor;
    },

    // If true, the next handlers will be skipped.
    onDrop: (editor) => (event) => {
      const [draggingBlock] = Array.from(
        getNodes(editor, {
          match: (node) => DRAGGABLE_TYPES.includes(node?.type),
        })
      );
      if (!draggingBlock) return false;

      const [draggingNode] = draggingBlock;

      if (!event.nativeEvent.target) return false;

      // TODO: looking up for html nodes is not the best solution and it won't scale, we need to find a way to know the dropping target slate element
      const dropDisallowed = getParents(event.nativeEvent.target as Node).some((node) => {
        return ON_DROP_ALLOWED_TYPES[node.nodeName]
          ? !ON_DROP_ALLOWED_TYPES[node.nodeName]?.includes(draggingNode.type)
          : false;
      });

      if (!dropDisallowed) {
        // Move the drop event to a new undo batch mitigating the bug where undo not only moves it back,
        // but also undoes a previous action: https://github.com/ianstormtaylor/slate/issues/4694
        editor.history.undos.push([]);
      }

      return dropDisallowed;
    },
  };
}

function getParents(el: Node): Node[] {
  const parents: Node[] = [];

  parents.push(el);
  while (el.parentNode) {
    parents.unshift(el.parentNode);
    el = el.parentNode;
  }

  return parents;
}
