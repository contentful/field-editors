import { BLOCKS } from '@contentful/rich-text-types';

import { block, text } from '../../../packages/rich-text/src/helpers/nodeFactory';

const buildHelper =
  (type) =>
  (...children) =>
    block(type, {}, ...children);
const paragraph = buildHelper(BLOCKS.PARAGRAPH);
export const paragraphWithText = (t) => paragraph(text(t, []));
export const emptyParagraph = () => paragraphWithText('');

export const KEYS = {
  enter: { code: 'Enter', keyCode: 13, which: 13, key: 'Enter' },
  backspace: { code: 'Backspace', keyCode: 8, which: 8, key: 'Backspace' },
};

// Tables
export const table = buildHelper(BLOCKS.TABLE);
export const row = buildHelper(BLOCKS.TABLE_ROW);
export const cell = buildHelper(BLOCKS.TABLE_CELL);
export const header = buildHelper(BLOCKS.TABLE_HEADER_CELL);
export const emptyCell = () => cell(emptyParagraph());
export const emptyHeader = () => header(emptyParagraph());
export const cellWithText = (t) => cell(paragraphWithText(t));
export const headerWithText = (t) => header(paragraphWithText(t));
