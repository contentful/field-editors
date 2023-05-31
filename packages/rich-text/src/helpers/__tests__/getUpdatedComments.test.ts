import * as Contentful from '@contentful/rich-text-types';

import { InlineComment } from '../enhanceContentfulDocWithComments';
import { getUpdatedComments } from '../getUpdatedComments';

describe('getUpdatedComments', () => {
  // Example usage
  const contentfulDocument = {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'firstNode',
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'secondNode, with ',
            marks: [],
            data: {
              comment: {
                sys: {
                  id: 'commentId3',
                  linkType: 'Comment',
                  type: 'Link',
                },
              },
            },
          },
          {
            nodeType: 'text',
            value: 'bold',
            marks: [
              {
                type: 'bold',
              },
            ],
            data: {
              comment: {
                sys: {
                  id: 'commentId2',
                  linkType: 'Comment',
                  type: 'Link',
                },
              },
            },
          },
        ],
      },
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'thirdNode',
            marks: [],
            data: {},
          },
        ],
      },
    ],
  } as Contentful.Document;

  const comment: InlineComment = {
    metadata: {
      range: ['content[1].content[1]', 'content[0].content[0]'],
      originalText: 'irure dolor',
    },
    body: 'My comment is this',
    id: 'commentId2',
  };

  it('finds json path', () => {
    const newComments = getUpdatedComments(contentfulDocument, [comment]);
    expect(newComments[0].metadata.range).toContain('content[1].content[1]');
    expect(newComments[0].metadata.range).not.toContain('content[0].content[0]');
    console.log(newComments);
  });
});
