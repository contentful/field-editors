import { isFirstChild } from '@udecode/plate-core';
import { Node, Text } from 'slate';

import { isRootLevel } from '../../helpers/editor';
import { RichTextPlugin } from '../../types';
import { transformVoid } from './transformVoid';

export const createVoidsPlugin = (): RichTextPlugin => ({
  key: 'VoidsPlugin',
  exitBreak: [
    {
      // Inserts a new paragraph *before* a void element if it's the very first
      // node on the editor
      hotkey: 'enter',
      before: true,
      query: {
        filter: ([node, path]) => isRootLevel(path) && isFirstChild(path) && !!node.isVoid,
      },
    },
    {
      // Inserts a new paragraph on enter when a void element is focused
      hotkey: 'enter',
      // exploit the internal use of Array.slice(0, level + 1) by the exitBreak plugin
      // to stay in the parent element
      level: -2,
      query: {
        filter: ([node, path]) => !(isRootLevel(path) && isFirstChild(path)) && !!node.isVoid,
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
