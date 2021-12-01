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
    a: { type: INLINES.HYPERLINK, data: {} },
    blockquote: { type: BLOCKS.QUOTE, data: {} },
    h1: { type: BLOCKS.HEADING_1, data: {} },
    h2: { type: BLOCKS.HEADING_2, data: {} },
    h3: { type: BLOCKS.HEADING_3, data: {} },
    h4: { type: BLOCKS.HEADING_4, data: {} },
    h5: { type: BLOCKS.HEADING_5, data: {} },
    h6: { type: BLOCKS.HEADING_6, data: {} },
    li: { type: BLOCKS.LIST_ITEM, data: {} },
    ol: { type: BLOCKS.OL_LIST, data: {} },
    p: { type: BLOCKS.PARAGRAPH, data: {} },
    table: { type: BLOCKS.TABLE, data: {} },
    td: { type: BLOCKS.TABLE_CELL, data: {} },
    th: { type: BLOCKS.TABLE_HEADER_CELL, data: {} },
    tr: { type: BLOCKS.TABLE_ROW, data: {} },
    ul: { type: BLOCKS.UL_LIST, data: {} },
    default: { type: BLOCKS.PARAGRAPH, data: {} },
  },
  creators: {
    htext: createText,
  },
});
