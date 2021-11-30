import { createHyperscript } from 'slate-hyperscript';
import { createText } from '@udecode/plate-test-utils';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

/**
 * Mapping for JSX => Slate Node types
 *
 * Add items as needed.
 */
export const jsx = createHyperscript({
  elements: {
    a: { type: INLINES.HYPERLINK },
    blockquote: { type: BLOCKS.QUOTE },
    h1: { type: BLOCKS.HEADING_1 },
    h2: { type: BLOCKS.HEADING_2 },
    h3: { type: BLOCKS.HEADING_3 },
    h4: { type: BLOCKS.HEADING_4 },
    h5: { type: BLOCKS.HEADING_5 },
    h6: { type: BLOCKS.HEADING_6 },
    li: { type: BLOCKS.LIST_ITEM },
    ol: { type: BLOCKS.OL_LIST },
    p: { type: BLOCKS.PARAGRAPH },
    table: { type: BLOCKS.TABLE },
    td: { type: BLOCKS.TABLE_CELL },
    th: { type: BLOCKS.TABLE_HEADER_CELL },
    tr: { type: BLOCKS.TABLE_ROW },
    ul: { type: BLOCKS.UL_LIST },
    default: { type: BLOCKS.PARAGRAPH },
  },
  creators: {
    htext: createText,
  },
});
