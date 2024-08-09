import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { INLINE_TYPES } from '../../helpers/editor';
import { transformWrapIn } from '../../helpers/transformers';
import { getParentNode, isText } from '../../internal/queries';
import { insertText } from '../../internal/transforms';
import { Element } from '../../internal/types';
import { NormalizerRule } from './types';

const isInline = (node: Element) => INLINE_TYPES.includes(node.type);
const isTextContainer = (node: Element) => TEXT_CONTAINERS.includes(node.type as BLOCKS);

// Base rules are rules that must be enforced at all times regardless
// of which plugins are enabled.
export const baseRules: Required<NormalizerRule>[] = [
  {
    // Wrap orphaned text nodes in a paragraph
    match: isText,
    validNode: (editor, [, path]) => {
      const parent = getParentNode(editor, path)?.[0] as Element;
      return !!parent && (isTextContainer(parent) || isInline(parent) || editor.isVoid(parent));
    },
    transform: (editor, entry) => {
      return transformWrapIn(BLOCKS.PARAGRAPH)(editor, entry);
    },
  },
  {
    // Wrap orphaned inline nodes in a paragraph,
    match: {
      type: INLINE_TYPES,
    },
    validNode: (editor, [, path]) => {
      const parent = getParentNode(editor, path)?.[0] as Element;
      return !!parent && isTextContainer(parent);
    },
    transform: transformWrapIn(BLOCKS.PARAGRAPH),
  },
  {
    // Replaces `\r` as it causes issues with scroll position and focus
    match: isText,
    validNode: (_editor, [node]) => typeof node.text === 'string' && !node.text.includes('\r'),
    transform: (editor, [node, path]) => {
      return insertText(editor, (node.text as string).replace(/\r/g, ''), { at: path });
    },
  },
];
