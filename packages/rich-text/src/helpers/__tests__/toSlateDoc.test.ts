import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import type { Element } from '../../internal';
import { block, document, inline, text } from '../nodeFactory';
import { toSlateDoc } from '../toSlateDoc';

describe('toSlateDoc', () => {
  const cases: { title: string; input: any; expected: Element[] }[] = [
    {
      title: 'undefined documents',
      input: undefined,
      expected: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
          data: {},
        },
      ],
    },
    {
      title: 'empty documents',
      input: document(),
      expected: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
          data: {},
        },
      ],
    },
    {
      title: 'empty hyperlinks',
      input: document(
        block(
          BLOCKS.PARAGRAPH,
          {},
          inline(INLINES.HYPERLINK),
          inline(INLINES.HYPERLINK, {}, text('')),
        ),
      ),
      expected: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
          data: {},
        },
      ],
    },
    {
      title: 'adjacent text nodes with identical marks',
      input: document(
        block(
          BLOCKS.PARAGRAPH,
          {},
          text('This '),
          text(''),
          text('should be one '),
          text('text node.'),
          text(' but this is unique.', [{ type: 'bold' }]),
          text(' and this should be merged ', [{ type: 'italic' }]),
          text('with this.', [{ type: 'italic' }]),
        ),
      ),
      expected: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'This should be one text node.',
              data: {},
            },
            {
              text: ' but this is unique.',
              bold: true,
              data: {},
            },
            {
              text: ' and this should be merged with this.',
              italic: true,
              data: {},
            },
          ],
          data: {},
        },
      ],
    },
    {
      title: 'uneven tables',
      input: document(
        block(
          'table',
          {},
          // 1 cell in row #1
          block(
            'table-row',
            {},
            block('table-header-cell', {}, block('paragraph', {}, text('cell #1'))),
          ),
          // 3 cells in row #2
          block(
            'table-row',
            {},
            block('table-cell', {}, block('paragraph', {}, text('cell #1'))),
            block('table-cell', {}, block('paragraph', {}, text('cell #2'))),
            block('table-cell', {}, block('paragraph', {}, text('cell #3'))),
          ),
          // 2 cells in row #3
          block(
            'table-row',
            {},
            block('table-cell', {}, block('paragraph', {}, text('cell #1'))),
            block('table-cell', {}, block('paragraph', {}, text('cell #2'))),
          ),
        ),
      ),
      expected: [
        {
          type: 'table',
          data: {},
          children: [
            {
              type: 'table-row',
              data: {},
              children: [
                {
                  type: 'table-header-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: 'cell #1',
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-header-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: '',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-header-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: '',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'table-row',
              data: {},
              children: [
                {
                  type: 'table-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: 'cell #1',
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: 'cell #2',
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: 'cell #3',
                          data: {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'table-row',
              data: {},
              children: [
                {
                  type: 'table-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: 'cell #1',
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: 'cell #2',
                          data: {},
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'table-cell',
                  data: {},
                  children: [
                    {
                      type: 'paragraph',
                      data: {},
                      children: [
                        {
                          text: '',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'empty blockquotes',
      input: document(block(BLOCKS.QUOTE, {})),
      expected: [
        {
          type: 'blockquote',
          data: {},
          children: [
            {
              type: 'paragraph',
              data: {},
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
    {
      title: 'empty list items',
      input: document(block(BLOCKS.LIST_ITEM, {})),
      expected: [
        {
          type: 'list-item',
          data: {},
          children: [
            {
              type: 'paragraph',
              data: {},
              children: [{ text: '' }],
            },
          ],
        },
      ],
    },
    {
      title: 'empty lists',
      input: document(block(BLOCKS.UL_LIST, {}), block(BLOCKS.OL_LIST, {})),
      expected: [
        {
          type: 'unordered-list',
          data: {},
          children: [
            {
              type: 'list-item',
              data: {},
              children: [
                {
                  type: 'paragraph',
                  data: {},
                  children: [{ text: '' }],
                },
              ],
            },
          ],
        },
        {
          type: 'ordered-list',
          data: {},
          children: [
            {
              type: 'list-item',
              data: {},
              children: [
                {
                  type: 'paragraph',
                  data: {},
                  children: [{ text: '' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  cases.forEach(({ title, input, expected }) => {
    it(`should normalize ${title}`, () => {
      const out = toSlateDoc(input);
      expect(out).toEqual(expected);
    });
  });
});
