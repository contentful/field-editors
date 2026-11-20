import { MARKS } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';

import { isEmptyRichTextDocument } from './isEmptyRichTextDocument';

const emptyText = { nodeType: 'text', value: '', marks: [], data: {} };
const emptyParagraph = {
  nodeType: 'paragraph',
  data: {},
  content: [emptyText],
};
const document = (...content: unknown[]) => ({ nodeType: 'document', data: {}, content });

describe('isEmptyRichTextDocument', () => {
  it('recognizes the canonical empty document', () => {
    expect(isEmptyRichTextDocument(document(emptyParagraph))).toBe(true);
  });

  it('recognizes documents with multiple empty paragraphs', () => {
    expect(isEmptyRichTextDocument(document(emptyParagraph, emptyParagraph))).toBe(true);
  });

  it.each(Object.values(MARKS))('recognizes empty text with the %s mark', (type) => {
    expect(
      isEmptyRichTextDocument(
        document({ ...emptyParagraph, content: [{ ...emptyText, marks: [{ type }] }] }),
      ),
    ).toBe(true);
  });

  it('recognizes an empty list with multiple formatting marks', () => {
    expect(
      isEmptyRichTextDocument(
        document({
          nodeType: 'unordered-list',
          data: {},
          content: [
            {
              nodeType: 'list-item',
              data: {},
              content: [
                {
                  ...emptyParagraph,
                  content: [
                    { ...emptyText, marks: [{ type: MARKS.BOLD }, { type: MARKS.ITALIC }] },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    ).toBe(true);
  });

  it('recognizes an empty list followed by the editor trailing paragraph', () => {
    const emptyList = {
      nodeType: 'unordered-list',
      data: {},
      content: [{ nodeType: 'list-item', data: {}, content: [emptyParagraph] }],
    };

    expect(isEmptyRichTextDocument(document(emptyList, emptyParagraph))).toBe(true);
  });

  it('recognizes empty nested ordered and unordered lists', () => {
    const nestedList = {
      nodeType: 'ordered-list',
      data: {},
      content: [
        {
          nodeType: 'list-item',
          data: {},
          content: [
            emptyParagraph,
            {
              nodeType: 'unordered-list',
              data: {},
              content: [{ nodeType: 'list-item', data: {}, content: [emptyParagraph] }],
            },
          ],
        },
      ],
    };

    expect(isEmptyRichTextDocument(document(nestedList))).toBe(true);
  });

  it('recognizes a document with no blocks', () => {
    expect(isEmptyRichTextDocument(document())).toBe(true);
  });

  it.each([
    ['whitespace text', document({ ...emptyParagraph, content: [{ ...emptyText, value: ' ' }] })],
    ['nonempty text', document({ ...emptyParagraph, content: [{ ...emptyText, value: 'text' }] })],
    [
      'an unknown mark',
      document({
        ...emptyParagraph,
        content: [{ ...emptyText, marks: [{ type: 'custom-mark' }] }],
      }),
    ],
    [
      'mark metadata',
      document({
        ...emptyParagraph,
        content: [{ ...emptyText, marks: [{ type: MARKS.BOLD, custom: true }] }],
      }),
    ],
    ['an embedded entry', document({ nodeType: 'embedded-entry-block', data: {}, content: [] })],
    ['a horizontal rule', document({ nodeType: 'hr', data: {}, content: [] })],
    ['a table', document({ nodeType: 'table', data: {}, content: [] })],
    ['an empty heading', document({ ...emptyParagraph, nodeType: 'heading-1' })],
    [
      'blank paragraphs around text',
      document(
        emptyParagraph,
        { ...emptyParagraph, content: [{ ...emptyText, value: 'text' }] },
        emptyParagraph,
      ),
    ],
    ['an unknown node', document({ nodeType: 'custom-block', data: {}, content: [] })],
    ['custom node data', document({ ...emptyParagraph, data: { custom: true } })],
    ['extra document data', { ...document(emptyParagraph), data: { custom: true } }],
  ])('preserves %s', (_description, value) => {
    expect(isEmptyRichTextDocument(value)).toBe(false);
  });

  it('preserves invalid or unknown structures', () => {
    expect(isEmptyRichTextDocument(null)).toBe(false);
    expect(isEmptyRichTextDocument({ nodeType: 'document', data: {}, content: [null] })).toBe(
      false,
    );
    expect(
      isEmptyRichTextDocument(
        document({
          nodeType: 'unordered-list',
          data: {},
          content: [{ nodeType: 'list-item', data: {}, content: [] }],
        }),
      ),
    ).toBe(false);
  });
});
