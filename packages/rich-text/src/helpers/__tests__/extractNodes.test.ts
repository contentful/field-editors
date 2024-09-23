import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { createEditor as createSlateEditor } from '@udecode/plate-test-utils';

import { Element, PlateEditor, Path } from '../../internal/types';
import { extractParagraphs } from '../extractNodes';

const createEditor = (children: Element[]) =>
  createSlateEditor('test-editor', {}, children) as PlateEditor;

type Text = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  data?: Record<string, unknown>;
};
type Inline = {
  children: Text[];
  type: INLINES;
  data: Record<string, unknown>;
};
type TextOrInline = Text | Inline;
const buildParagraph = (children: TextOrInline[] = []) => ({
  type: BLOCKS.PARAGRAPH,
  data: {},
  isVoid: false,
  children: children.map((child) => ({ data: {}, ...child })),
});
const paragraph = (text = '', marks = {}) => buildParagraph([{ text, ...marks }]);

type List = BLOCKS.OL_LIST | BLOCKS.UL_LIST;
const buildList = (type: List = BLOCKS.UL_LIST, secondType: List = BLOCKS.UL_LIST): Element => ({
  data: {},
  isVoid: false,
  type,
  children: [
    {
      data: {},
      isVoid: false,
      type: BLOCKS.LIST_ITEM,
      children: [
        {
          type: secondType,
          isVoid: false,
          data: {},
          children: [
            {
              data: {},
              isVoid: false,
              type: BLOCKS.LIST_ITEM,
              children: [paragraph('text 1')],
            },
          ],
        },
      ],
    },
    {
      data: {},
      isVoid: false,
      type: BLOCKS.LIST_ITEM,
      children: [paragraph('text 2')],
    },
    {
      data: {},
      isVoid: false,
      type: BLOCKS.LIST_ITEM,
      children: [paragraph('text 3')],
    },
  ],
});

describe('extractParagraphs', () => {
  it('table', () => {
    const table: Element = {
      data: {},
      isVoid: false,
      type: BLOCKS.TABLE,
      children: [
        {
          type: BLOCKS.TABLE_ROW,
          data: {},
          isVoid: false,
          children: [
            {
              type: BLOCKS.TABLE_HEADER_CELL,
              data: {},
              isVoid: false,
              children: [paragraph('header 1')],
            },
            {
              type: BLOCKS.TABLE_HEADER_CELL,
              data: {},
              isVoid: false,
              children: [paragraph('header 2')],
            },
          ],
        },
        {
          type: BLOCKS.TABLE_ROW,
          data: {},
          isVoid: false,
          children: [
            {
              type: BLOCKS.TABLE_CELL,
              data: {},
              isVoid: false,
              children: [paragraph('cell 1')],
            },
            {
              type: BLOCKS.TABLE_CELL,
              data: {},
              isVoid: false,
              children: [paragraph('cell 2')],
            },
          ],
        },
      ],
    };
    const editor = createEditor([table]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([
      paragraph('header 1'),
      paragraph('header 2'),
      paragraph('cell 1'),
      paragraph('cell 2'),
    ]);
  });

  it('blockquote', () => {
    const blockquote: Element = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [paragraph('text 1'), paragraph('text 2')],
    };
    const editor = createEditor([blockquote]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([paragraph('text 1'), paragraph('text 2')]);
  });

  it('list - UL', () => {
    const ul: Element = buildList(BLOCKS.UL_LIST, BLOCKS.OL_LIST);
    const editor = createEditor([ul]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([
      paragraph('text 1'),
      paragraph('text 2'),
      paragraph('text 3'),
    ]);
  });

  it('list - OL', () => {
    const ol: Element = buildList(BLOCKS.OL_LIST, BLOCKS.UL_LIST);
    const editor = createEditor([ol]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([
      paragraph('text 1'),
      paragraph('text 2'),
      paragraph('text 3'),
    ]);
  });

  it('should preserve marks', () => {
    const element: Element = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [
        paragraph('text 1', { bold: true, italic: true }),
        paragraph('text 2', { underline: true, code: true }),
      ],
    };
    const editor = createEditor([element]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([
      paragraph('text 1', { bold: true, italic: true }),
      paragraph('text 2', { underline: true, code: true }),
    ]);
  });

  it('should preserve hyperlinks', () => {
    const paragraphWithLink = buildParagraph([
      { text: 'text 1 ' },
      {
        type: INLINES.HYPERLINK,
        children: [{ text: 'with link' }],
        data: { uri: 'https://link.com' },
      },
    ]);

    const element: Element = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [paragraphWithLink, paragraph('text 2')],
    };
    const editor = createEditor([element]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([paragraphWithLink, paragraph('text 2')]);
  });

  it('should preserve embedded inline entries', () => {
    const paragraphWithEmbedded = buildParagraph([
      { text: 'text 1 ' },
      {
        type: INLINES.EMBEDDED_ENTRY,
        children: [{ text: '' }],
        data: { target: { sys: { id: 'inline-id', linkType: 'Entry', type: 'Link' } } },
      },
    ]);

    const element: Element = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [paragraphWithEmbedded, paragraph('text 2')],
    };
    const editor = createEditor([element]);
    const path: Path = [0];

    expect(extractParagraphs(editor, path)).toEqual([paragraphWithEmbedded, paragraph('text 2')]);
  });
});
