// @ts-nocheck
import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { WithOverride } from '@udecode/plate-core';
import { getAboveNode } from '@udecode/plate-core';
import { BaseRange, BaseSelection, Element, Node, Point, Transforms } from 'slate';

import { RichTextEditor } from '../../types';

export const withQuote: WithOverride<RichTextEditor> = (editor) => {
  const { insertFragment } = editor;

  editor.insertFragment = (fragment) => {
    const startingNode = fragment.length && fragment[0];
    const startsWithBlockquote =
      Element.isElement(startingNode) && startingNode.type === BLOCKS.QUOTE;

    const containerEntry = getAboveNode(editor, {
      match: {
        type: TEXT_CONTAINERS,
      },
    });
    const containerIsNotEmpty = containerEntry && Node.string(containerEntry[0]) !== '';

    if (startsWithBlockquote && containerIsNotEmpty) {
      const { selection } = editor;
      const isContentSelected = (selection: BaseSelection): selection is BaseRange =>
        !!selection && Point.compare(selection.anchor, selection.focus) !== 0;
      // if something is selected (highlighted) we replace the selection
      if (isContentSelected(selection)) {
        Transforms.delete(editor, { at: selection });
      }

      // get the cursor entry again, it may be different after deletion
      const containerEntry = getAboveNode(editor, {
        match: {
          type: TEXT_CONTAINERS,
        },
      });

      const containerIsNotEmpty = containerEntry && Node.string(containerEntry[0]) !== '';

      if (containerIsNotEmpty) {
        Transforms.insertNodes(editor, fragment);
        return;
      }
    }

    insertFragment(fragment);
  };

  return editor;
};
