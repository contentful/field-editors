import { BLOCKS } from '@contentful/rich-text-types';

import { block, text } from '../../../packages/rich-text/src/helpers/nodeFactory';

export const KEYS = {
  enter: { code: 'Enter', keyCode: 13, which: 13, key: 'Enter' },
  backspace: { code: 'Backspace', keyCode: 8, which: 8, key: 'Backspace' },
  tab: { code: 'Tab', keyCode: 9, which: 9, key: 'Tab' },
  delete: { code: 'Delete', keyCode: 8, which: 8, key: 'Delete' },
};

const buildHelper =
  (type) =>
  (...children) =>
    block(type, {}, ...children);
// Paragraphs
const paragraph = buildHelper(BLOCKS.PARAGRAPH);
export const paragraphWithText = (t) => paragraph(text(t, []));
export const emptyParagraph = () => paragraphWithText('');

// Tables
export const table = buildHelper(BLOCKS.TABLE);
export const row = buildHelper(BLOCKS.TABLE_ROW);
export const cell = buildHelper(BLOCKS.TABLE_CELL);
export const header = buildHelper(BLOCKS.TABLE_HEADER_CELL);
export const emptyCell = () => cell(emptyParagraph());
export const emptyHeader = () => header(emptyParagraph());
export const cellWithText = (t) => cell(paragraphWithText(t));
export const headerWithText = (t) => header(paragraphWithText(t));

// References
export const entryBlock = () =>
  block(BLOCKS.EMBEDDED_ENTRY, {
    target: {
      sys: {
        id: 'published-entry',
        type: 'Link',
        linkType: 'Entry',
      },
    },
  });

export const assetBlock = () =>
  block(BLOCKS.EMBEDDED_ASSET, {
    target: {
      sys: {
        id: 'published_asset',
        type: 'Link',
        linkType: 'Asset',
      },
    },
  });
