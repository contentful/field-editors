import { isFirstChild } from '@udecode/plate-core';
import { Node, Text } from 'slate';

import { isRootLevel } from '../../helpers/editor';
import { RichTextPlugin } from '../../types';
import { transformVoid } from './transformVoid';

export const createVoidsPlugin = (): RichTextPlugin => ({
  key: 'VoidsPlugin',
  exitBreak: [
    // Can insert before first void block
    {
      hotkey: 'enter',
      before: true,
      query: {
        filter: ([node, path]) => isRootLevel(path) && isFirstChild(path) && !!node.isVoid,
      },
    },
    // Can insert after a void block
    {
      hotkey: 'enter',
      query: {
        filter: ([node, path]) => !isFirstChild(path) && !!node.isVoid,
      },
    },
  ],
  normalizer: [
    {
      match: {
        isVoid: true,
      },
      validNode: (editor, [, path]) => {
        const children = Array.from(Node.children(editor, path));

        if (children.length !== 1) {
          return false;
        }

        const [textNode] = children[0];

        return Text.isText(textNode) && textNode.text === '';
      },
      transform: transformVoid,
    },
  ],
});
