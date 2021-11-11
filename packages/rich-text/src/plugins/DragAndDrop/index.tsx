import { Node as SlateNode, Transforms, Editor } from 'slate';
import { PlatePlugin } from '@udecode/plate-core';
import { CustomElement } from '../../types';
import { BLOCKS, CONTAINERS, INLINES } from '@contentful/rich-text-types';
import { getNodes } from '@udecode/plate-common';

export function createDragAndDropPlugin(): PlatePlugin {
  // Elements that don't allow other elements to be dragged into them and which callback should be used
  const DND_BLOCKED_ELEMENTS = {
    [BLOCKS.TABLE]: Transforms.removeNodes,
    [BLOCKS.QUOTE]: Transforms.liftNodes,
  };

  const DRAGGABLE_TYPES: string[] = [
    BLOCKS.EMBEDDED_ENTRY,
    BLOCKS.EMBEDDED_ASSET,
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
          match: (node) => Editor.isBlock(editor, node) && DRAGGABLE_TYPES.includes(node.type),
        })
      );
      if (!draggingBlock) return false;

      const [draggingNode] = draggingBlock;

      // TODO: looking up for html nodes is not the best solution and it won't scale, we need to find a way to know the dropping target slate element
      // @ts-expect-error
      return event.nativeEvent.path.some((node) => {
        return ON_DROP_ALLOWED_TYPES[node.nodeName]
          ? !ON_DROP_ALLOWED_TYPES[node.nodeName]?.includes(draggingNode.type)
          : false;
      });
    },
  };
}
