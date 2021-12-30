import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getParent } from '@udecode/plate-core';
import { Text } from 'slate';
import { CustomElement } from 'types';

import { INLINE_TYPES } from '../../helpers/editor';
import { transformWrapIn } from '../../helpers/transformers';
import { NormalizerRule } from './types';

const isInline = (node: CustomElement) => INLINE_TYPES.includes(node.type);
const isTextContainer = (node: CustomElement) => TEXT_CONTAINERS.includes(node.type as BLOCKS);

// Base rules are rules that must be enforced at all times regardless
// of which plugins are enabled.
export const baseRules: Required<NormalizerRule>[] = [
  {
    // Wrap orphaned text nodes in a paragraph
    match: Text.isText,
    validNode: (editor, [, path]) => {
      const parent = getParent(editor, path)?.[0] as CustomElement;
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
      const parent = getParent(editor, path)?.[0] as CustomElement;
      return !!parent && isTextContainer(parent);
    },
    transform: transformWrapIn(BLOCKS.PARAGRAPH),
  },
];
