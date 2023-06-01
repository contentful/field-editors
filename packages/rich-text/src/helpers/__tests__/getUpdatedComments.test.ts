import * as Contentful from '@contentful/rich-text-types';
import { InlineComment } from 'RichTextEditor';

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
            marks: [{ type: 'inline-comment' }],
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
                type: 'inline-comment',
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
    sys: {
      id: 'commentId2',
    },
  };

  const mockSdk = {
    get: () => [comment],
    update: () => console.log('Updating'),
    delete: () => console.log('Deleting'),
    create: () => console.log('Deleting'),
  };

  it('finds json path', () => {
    const newComments = getUpdatedComments(contentfulDocument, mockSdk);
    expect(newComments[0].metadata.range).toContain('content[1].content[1]');
    expect(newComments[0].metadata.range).not.toContain('content[0].content[0]');
  });
});
