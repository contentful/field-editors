// This document contains errors that must be solved with normalization:
export default {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: '',
          marks: [],
          data: {},
        },

        // hyperlink with an empty text node
        {
          nodeType: 'hyperlink',
          data: {
            uri: 'https://exmaple.com',
          },
          content: [
            {
              nodeType: 'text',
              value: '',
              marks: [],
              data: {},
            },
          ],
        },

        // Hyperlink without a text node
        {
          nodeType: 'hyperlink',
          data: {
            uri: 'https://exmaple.com',
          },
          content: [],
        },

        // Hyperlink with multiple text nodes without marks
        {
          nodeType: 'hyperlink',
          data: {
            uri: 'https://exmaple.com',
          },
          content: [
            {
              nodeType: 'text',
              value: 'This ',
              marks: [],
              data: {},
            },
            {
              nodeType: 'text',
              value: 'is a ',
              marks: [],
              data: {},
            },
            {
              nodeType: 'text',
              value: 'hyperlink',
              marks: [],
              data: {},
            },
          ],
        },

        {
          nodeType: 'text',
          value: '',
          marks: [],
          data: {},
        },
      ],
    },

    // paragraphs/headings without text nodes
    {
      nodeType: 'paragraph',
      data: {},
      content: [],
    },
    {
      nodeType: 'heading-1',
      data: {},
      content: [],
    },

    // Paragraph with multiple text nodes without marks
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'This is ',
          marks: [],
          data: {},
        },
        {
          nodeType: 'text',
          value: '',
          marks: [],
          data: {},
        },
        {
          nodeType: 'text',
          value: 'a paragraph',
          marks: [],
          data: {},
        },
      ],
    },

    // Custom marks
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'Text with custom marks',
          marks: [
            {
              type: 'bold',
            },
            {
              type: 'superscript',
            },
            {
              type: 'banana',
            },
          ],
          data: {},
        },
      ],
    },

    // blockquote without paragraphs
    {
      nodeType: 'blockquote',
      data: {},
      content: [],
    },

    // ol/ul with empty array of list items
    {
      nodeType: 'unordered-list',
      data: {},
      content: [],
    },
    {
      nodeType: 'ordered-list',
      data: {},
      content: [],
    },

    // list items with empty array of child nodes
    {
      nodeType: 'unordered-list',
      data: {},
      content: [
        {
          nodeType: 'list-item',
          data: {},
          content: [],
        },
      ],
    },

    // Table cell with paragraph without text node
    {
      nodeType: 'table',
      data: {},
      content: [
        {
          nodeType: 'table-row',
          data: {},
          content: [
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [],
                },
              ],
            },
          ],
        },
      ],
    },

    // Table with variable size rows
    {
      nodeType: 'table',
      data: {},
      content: [
        // 1 cell in a row
        {
          nodeType: 'table-row',
          data: {},
          content: [
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'cell #1',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          ],
        },

        // 3 cells in a row
        {
          nodeType: 'table-row',
          data: {},
          content: [
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'cell #2',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'cell #3',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'cell #4',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          ],
        },

        // 2 cells in a row
        {
          nodeType: 'table-row',
          data: {},
          content: [
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'cell #5',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: 'table-cell',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: 'cell #6',
                      marks: [],
                      data: {},
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
};
