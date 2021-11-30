import { createEditor as createSlateEditor } from '@udecode/plate-test-utils';
import { PlateEditor } from '@udecode/plate';
import { NodeEntry } from 'slate';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { slateNodeEntryToText } from './editor';
import { CustomElement } from '../types';

const createEditor = (children: CustomElement[]) =>
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

describe('slateNodeEntryToText', () => {
  it('table', () => {
    const table: CustomElement = {
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
    const entry: NodeEntry = [table, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([
      paragraph('header 1'),
      paragraph('header 2'),
      paragraph('cell 1'),
      paragraph('cell 2'),
    ]);
  });

  it('blockquote', () => {
    const blockquote: CustomElement = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [paragraph('text 1'), paragraph('text 2')],
    };
    const editor = createEditor([blockquote]);
    const entry: NodeEntry = [blockquote, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([paragraph('text 1'), paragraph('text 2')]);
  });

  it('list - UL', () => {
    const ul: CustomElement = {
      data: {},
      isVoid: false,
      type: BLOCKS.UL_LIST,
      children: [
        {
          data: {},
          isVoid: false,
          type: BLOCKS.LIST_ITEM,
          children: [
            {
              type: BLOCKS.UL_LIST,
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
    };
    const editor = createEditor([ul]);
    const entry: NodeEntry = [ul, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([
      paragraph('text 1'),
      paragraph('text 2'),
      paragraph('text 3'),
    ]);
  });

  it('list - OL', () => {
    const ol: CustomElement = {
      data: {},
      isVoid: false,
      type: BLOCKS.OL_LIST,
      children: [
        {
          data: {},
          isVoid: false,
          type: BLOCKS.LIST_ITEM,
          children: [
            {
              type: BLOCKS.OL_LIST,
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
    };
    const editor = createEditor([ol]);
    const entry: NodeEntry = [ol, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([
      paragraph('text 1'),
      paragraph('text 2'),
      paragraph('text 3'),
    ]);
  });

  it('should preserve marks', () => {
    const element: CustomElement = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [
        paragraph('text 1', { bold: true, italic: true }),
        paragraph('text 2', { underline: true, code: true }),
      ],
    };
    const editor = createEditor([element]);
    const entry: NodeEntry = [element, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([
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

    const element: CustomElement = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [paragraphWithLink, paragraph('text 2')],
    };
    const editor = createEditor([element]);
    const entry: NodeEntry = [element, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([paragraphWithLink, paragraph('text 2')]);
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

    const element: CustomElement = {
      data: {},
      isVoid: false,
      type: BLOCKS.QUOTE,
      children: [paragraphWithEmbedded, paragraph('text 2')],
    };
    const editor = createEditor([element]);
    const entry: NodeEntry = [element, [0]];

    expect(slateNodeEntryToText(editor, entry)).toEqual([
      paragraphWithEmbedded,
      paragraph('text 2'),
    ]);
  });
});
