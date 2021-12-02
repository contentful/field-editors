import { createHyperscript, HyperscriptCreators } from 'slate-hyperscript';
import { createText } from '@udecode/plate-test-utils';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

type Creator = HyperscriptCreators[0];

const voidChildren = [{ text: '' }];

const createCode: Creator = (_, attrs, children) => {
  return createText('text', { code: true, ...attrs }, children);
};

const createHyperlink = (_, attrs, children) => {
  const data: any = {};
  let type: string = INLINES.HYPERLINK;

  if (attrs.uri) {
    data.uri = attrs.uri;
    type = INLINES.HYPERLINK;
  }

  if (attrs.asset) {
    type = INLINES.ASSET_HYPERLINK;
    data.target = {
      sys: { id: attrs.asset, type: 'Link', linkType: 'Asset' },
    };
  }

  if (attrs.entry) {
    type = INLINES.ENTRY_HYPERLINK;
    data.target = {
      sys: { id: attrs.entry, type: 'Link', linkType: 'Entry' },
    };
  }

  return { type, data, children };
};

const createInlineEntry = (_, attrs) => {
  return {
    type: INLINES.EMBEDDED_ENTRY,
    data: {
      target: {
        sys: { id: attrs.id, type: 'Link', linkType: 'Entry' },
      },
    },
    children: voidChildren,
  };
};

/**
 * Mapping for JSX => Slate Node types
 *
 * Add items as needed.
 */
export const jsx = createHyperscript({
  elements: {
    hblockquote: { type: BLOCKS.QUOTE, data: {} },
    hh1: { type: BLOCKS.HEADING_1, data: {} },
    hh2: { type: BLOCKS.HEADING_2, data: {} },
    hh3: { type: BLOCKS.HEADING_3, data: {} },
    hh4: { type: BLOCKS.HEADING_4, data: {} },
    hh5: { type: BLOCKS.HEADING_5, data: {} },
    hh6: { type: BLOCKS.HEADING_6, data: {} },
    hli: { type: BLOCKS.LIST_ITEM, data: {} },
    hol: { type: BLOCKS.OL_LIST, data: {} },
    hp: { type: BLOCKS.PARAGRAPH, data: {} },
    htable: { type: BLOCKS.TABLE, data: {} },
    htd: { type: BLOCKS.TABLE_CELL, data: {} },
    hth: { type: BLOCKS.TABLE_HEADER_CELL, data: {} },
    htr: { type: BLOCKS.TABLE_ROW, data: {} },
    hul: { type: BLOCKS.UL_LIST, data: {} },
    hdefault: { type: BLOCKS.PARAGRAPH, data: {} },
  },
  creators: {
    hlink: createHyperlink,
    htext: createText,
    hcode: createCode,
    hinlineEntry: createInlineEntry,
  },
});
