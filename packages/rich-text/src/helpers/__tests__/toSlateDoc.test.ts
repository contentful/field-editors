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
          isVoid: false,
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
          isVoid: false,
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
          isVoid: false,
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
          isVoid: false,
        },
      ],
    },
    {
      title: 'inlines without surrounding text',
      input: document(
        block(
          BLOCKS.PARAGRAPH,
          {},
          inline(INLINES.EMBEDDED_ENTRY),
          inline(INLINES.EMBEDDED_RESOURCE),
        ),
      ),
      expected: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            {
              type: INLINES.EMBEDDED_ENTRY,
              data: {},
              children: [{ text: '' }],
              isVoid: true,
            },
            { text: '' },
            {
              type: INLINES.EMBEDDED_RESOURCE,
              data: {},
              children: [{ text: '' }],
              isVoid: true,
            },
            { text: '' },
          ],
          data: {},
          isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
                },
              ],
              isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
                },
              ],
              isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
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
                      isVoid: false,
                    },
                  ],
                  isVoid: false,
                },
              ],
              isVoid: false,
            },
          ],
          isVoid: false,
        },
        {
          type: 'paragraph',
          data: {},
          children: [
            {
              text: '',
            },
          ],
          isVoid: false,
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
              isVoid: false,
            },
          ],
          isVoid: false,
        },
        {
          type: 'paragraph',
          data: {},
          children: [
            {
              text: '',
            },
          ],
          isVoid: false,
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
              isVoid: false,
            },
          ],
          isVoid: false,
        },
        {
          type: 'paragraph',
          data: {},
          children: [
            {
              text: '',
            },
          ],
          isVoid: false,
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
                  isVoid: false,
                },
              ],
              isVoid: false,
            },
          ],
          isVoid: false,
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
                  isVoid: false,
                },
              ],
              isVoid: false,
            },
          ],
          isVoid: false,
        },
        {
          type: 'paragraph',
          data: {},
          children: [
            {
              text: '',
            },
          ],
          isVoid: false,
        },
      ],
    },
    {
      title: 'list of embedded entry blocks',
      input: document(
        block(BLOCKS.EMBEDDED_ENTRY, {
          target: {
            sys: {
              id: '4jo9APjyJs31WugGbV0E42',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        }),
        block(BLOCKS.EMBEDDED_ENTRY, {
          target: {
            sys: {
              id: '2bwp9MdklBd4WVLGm1Fngy',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        }),
        block(BLOCKS.EMBEDDED_ENTRY, {
          target: {
            sys: {
              id: '73qAHseh6G40k7ndmON5OD',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        }),
        block(BLOCKS.EMBEDDED_ENTRY, {
          target: {
            sys: {
              id: '7FYYiCprd5VwItrHH3nNJj',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        }),
        block(BLOCKS.PARAGRAPH, {}, text('')),
        block(BLOCKS.PARAGRAPH, {}, text('')),
      ),
      expected: [
        {
          type: 'embedded-entry-block',
          children: [{ text: '' }],
          data: {
            target: {
              sys: {
                id: '4jo9APjyJs31WugGbV0E42',
                type: 'Link',
                linkType: 'Entry',
              },
            },
          },
          isVoid: true,
        },
        {
          type: 'embedded-entry-block',
          children: [{ text: '' }],
          data: {
            target: {
              sys: {
                id: '2bwp9MdklBd4WVLGm1Fngy',
                type: 'Link',
                linkType: 'Entry',
              },
            },
          },
          isVoid: true,
        },
        {
          type: 'embedded-entry-block',
          children: [{ text: '' }],
          data: {
            target: {
              sys: {
                id: '73qAHseh6G40k7ndmON5OD',
                type: 'Link',
                linkType: 'Entry',
              },
            },
          },
          isVoid: true,
        },
        {
          type: 'embedded-entry-block',
          children: [{ text: '' }],
          data: {
            target: {
              sys: {
                id: '7FYYiCprd5VwItrHH3nNJj',
                type: 'Link',
                linkType: 'Entry',
              },
            },
          },
          isVoid: true,
        },
        {
          type: 'paragraph',
          children: [{ text: '', data: {} }],
          data: {},
          isVoid: false,
        },
        {
          type: 'paragraph',
          children: [{ text: '', data: {} }],
          data: {},
          isVoid: false,
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
