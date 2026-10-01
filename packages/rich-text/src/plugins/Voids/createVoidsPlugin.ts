import { BLOCKS } from '@contentful/rich-text-types';

import { isRootLevel } from '../../helpers/editor';
import { isFirstChildPath, isElement } from '../../internal/queries';
import { PlatePlugin } from '../../internal/types';

export const createVoidsPlugin = (): PlatePlugin => ({
  key: 'VoidsPlugin',
  withOverrides: (editor) => {
    const { insertFragment } = editor;
    editor.insertFragment = (fragment) => {
      // Slate no longer splits the destination paragraph for a fragment made
      // entirely of void blocks. Preserve Contentful's paste/drop behavior.
      if (
        fragment.length > 0 &&
        fragment.every(
          (node) => isElement(node) && editor.api.isBlock(node) && editor.api.isVoid(node)
        )
      ) {
        const block = editor.api.block();
        const replaceEmptyParagraph =
          editor.api.isCollapsed() &&
          block &&
          block[1].length === 1 &&
          block[0].type === BLOCKS.PARAGRAPH &&
          editor.api.isEmpty(block[0]);
        editor.tf.withoutNormalizing(() => {
          if (replaceEmptyParagraph) {
            editor.tf.removeNodes({ at: block[1] });
            editor.tf.insertNodes(fragment, { at: block[1], select: true });
          } else {
            editor.tf.insertNodes(fragment, { select: true });
          }
        });
        return;
      }
      insertFragment(fragment);
    };
    return editor;
  },
  exitBreak: [
    {
      // Inserts a new paragraph *before* a void element if it's the very first
      // node on the editor
      hotkey: 'enter',
      before: true,
      query: {
        filter: ([node, path]) => isRootLevel(path) && isFirstChildPath(path) && !!node.isVoid
      }
    },
    {
      // Inserts a new paragraph on enter when a void element is focused
      hotkey: 'enter',
      // exploit the internal use of Array.slice(0, level + 1) by the exitBreak plugin
      // to stay in the parent element
      level: -2,
      query: {
        filter: ([node, path]) => !(isRootLevel(path) && isFirstChildPath(path)) && !!node.isVoid
      }
    }
  ]
});
