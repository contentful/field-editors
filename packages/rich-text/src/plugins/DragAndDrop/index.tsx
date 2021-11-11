import { Node as SlateNode, Transforms } from 'slate';
import { PlatePlugin } from '@udecode/plate-core';
import { CustomElement } from '../../types';
import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';

export function createDragAndDropPlugin(): PlatePlugin {
  // Elements that don't allow other elements to be dragged into them and which callback should be used
  const DND_BLOCKED_ELEMENTS = {
    [BLOCKS.TABLE]: Transforms.removeNodes,
    [BLOCKS.QUOTE]: Transforms.liftNodes,
  };

  // DND_BLOCKED_ELEMENTS callbacks will run on those elements only
  const DRAGGABLE_TYPES: string[] = [BLOCKS.EMBEDDED_ENTRY, BLOCKS.EMBEDDED_ASSET];

  // HTML node names where dropping should be disabled, usually when using `Transforms.removeNodes` callback
  const ON_DROP_BLOCKED_TYPES = ['TABLE'];

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
    onDrop: () => (event) => {
      /**
       * If true, the next handlers will be skipped.
       * In this case, the element that is being dragged will be copied,
       * two versions of the same element on the document,
       * so we need to remove it above on `normalizeNode`.
       */
      // @ts-expect-error
      return event.nativeEvent.path.some((node) => {
        return ON_DROP_BLOCKED_TYPES.includes(node.nodeName);
      });
    },
  };
}
