import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { getNodeEntries } from '../../internal/queries';
import { PlatePlugin } from '../../internal/types';

export function createDragAndDropPlugin(): PlatePlugin {
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
    key: 'DragAndDropPlugin',
    handlers: {
      // If true, the next handlers will be skipped.
      onDrop: (editor) => (event) => {
        const [draggingBlock] = Array.from(
          getNodeEntries(editor, {
            match: (node) => DRAGGABLE_TYPES.includes(node.type as string),
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
