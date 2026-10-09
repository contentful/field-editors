import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { entries } from '../__fixtures__/fixtures';

const text = (value: string) => ({ nodeType: 'text', value, marks: [], data: {} });

export const makeDoc = (n: number) => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: Array.from({ length: n }, (_, i) => {
    if (i % 10 === 5) {
      return {
        nodeType: BLOCKS.EMBEDDED_ENTRY,
        data: {
          target: { sys: { id: entries.published.sys.id, type: 'Link', linkType: 'Entry' } },
        },
        content: [],
      };
    }
    return {
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [
        text(`Paragraph ${i} lorem ipsum dolor sit amet `),
        {
          nodeType: INLINES.HYPERLINK,
          data: { uri: 'https://example.com' },
          content: [text('a link')],
        },
        text(' trailing text.'),
      ],
    };
  }),
});
