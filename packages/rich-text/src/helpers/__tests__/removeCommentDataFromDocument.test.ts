import { removeCommentDataFromDocument } from '../removeCommentDataFromDocument';

describe('removeCommentDataFromDocument', () => {
  const contentfulInputWithComment = {
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
  it('Removes comment data from contentful document', () => {
    const expectedOutput = {
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

    const output = removeCommentDataFromDocument(contentfulInputWithComment);

    expect(output).toStrictEqual(expectedOutput);
  });
});