import * as Contentful from '@contentful/rich-text-types';

import { enhanceContentfulDocWithComments } from '../enhanceContentfulDocWithComments';

describe('enhanceContentfulDocWithComments', () => {
  const JSONPATH1 = 'content[0].content[1]';
  // would there be a jsonpath2?
  const comment = {
    metadata: {
      range: [JSONPATH1],
      originalText: 'irure dolor',
    },
    body: 'My comment is this',
    id: 'commentId',
  };
  const contentfulInput = {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute ',
            marks: [],
            data: {},
          },
          {
            nodeType: 'text',
            value: 'irure dolor', // here is where the comment would go
            marks: [],
            data: {},
          },
          {
            nodeType: 'text',
            value:
              ' in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };

  it('adds comments using json path ', () => {
    const enhancedContentfulOutput = {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute ',
              marks: [],
              data: {},
            },
            {
              nodeType: 'text',
              value: 'irure dolor', // here is where the comment would go
              marks: [],
              data: {
                comment: {
                  sys: {
                    id: 'commentId',
                    linkType: 'Comment',
                    type: 'Link',
                  },
                },
              },
            },
            {
              nodeType: 'text',
              value:
                ' in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    };

    const output = enhanceContentfulDocWithComments(
      contentfulInput as unknown as Contentful.Document,
      [comment]
    );
    expect(output).toStrictEqual(enhancedContentfulOutput);
  });
});
