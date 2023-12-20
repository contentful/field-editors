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
