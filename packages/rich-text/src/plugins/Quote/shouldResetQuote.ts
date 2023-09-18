import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { isLastChild, hasSingleChild } from '@udecode/plate-common';

import { getAboveNode, getBlockAbove, isAncestorEmpty } from '../../internal/queries';
import { PlateEditor, Ancestor } from '../../internal/types';

/**
 * Returns true if we are:
 * 1) Inside a blockquote
 * 2) With no only one child paragraph/heading and
 * 3) that child is empty
 */
export const shouldResetQuoteOnBackspace = (editor: PlateEditor) => {
  const container = getAboveNode(editor, {
    match: { type: TEXT_CONTAINERS },
    mode: 'lowest',
  });

  if (!container) {
    return false;
  }

  if (!isAncestorEmpty(editor, container[0] as Ancestor)) {
    return false;
  }

  const quote = getBlockAbove(editor, {
    match: { type: BLOCKS.QUOTE },
    mode: 'lowest',
  });

  if (!quote) {
    return false;
  }

  if (hasSingleChild(quote[0]) && isLastChild(quote, container[1])) {
    return true;
  }

  return false;
};
