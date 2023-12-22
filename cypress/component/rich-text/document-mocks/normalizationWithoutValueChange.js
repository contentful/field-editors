export default {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        { nodeType: 'text', value: '', marks: [], data: {} },
        {
          nodeType: 'hyperlink',
          data: { uri: 'https://exmaple.com' },
          content: [{ nodeType: 'text', value: 'This is a hyperlink', marks: [], data: {} }],
        },
        { nodeType: 'text', value: '', marks: [], data: {} },
      ],
    },
    {
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
    },
    {
      nodeType: 'heading-1',
      data: {},
      content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
    },
    {
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', value: 'This is a paragraph', marks: [], data: {} }],
    },
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'Text with custom marks',
          marks: [{ type: 'bold' }, { type: 'superscript' }, { type: 'banana' }],
          data: {},
        },
      ],
    },
    {
      nodeType: 'blockquote',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
        },
      ],
    },
    {
      nodeType: 'unordered-list',
      data: {},
      content: [
        {
          nodeType: 'list-item',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
            },
          ],
        },
      ],
    },
    {
      nodeType: 'ordered-list',
      data: {},
      content: [
        {
          nodeType: 'list-item',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
            },
          ],
        },
      ],
    },
    {
      nodeType: 'unordered-list',
      data: {},
      content: [
        {
          nodeType: 'list-item',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
            },
          ],
        },
        {
          nodeType: 'list-item',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                { nodeType: 'text', value: 'paragraph inside list item', marks: [], data: {} },
              ],
            },
            {
              nodeType: 'unordered-list',
              data: {},
              content: [
                {
                  nodeType: 'list-item',
                  data: {},
                  content: [
                    {
                      nodeType: 'paragraph',
                      data: {},
                      content: [
                        {
                          nodeType: 'text',
                          value: 'paragraph inside a nested list',
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              nodeType: 'blockquote',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    { nodeType: 'text', value: 'blockquote inside list item', marks: [], data: {} },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
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
                  content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
                },
              ],
            },
          ],
        },
      ],
    },
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
                  content: [{ nodeType: 'text', value: 'cell #1', marks: [], data: {} }],
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
                  content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
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
                  content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
                },
              ],
            },
          ],
        },
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
                  content: [{ nodeType: 'text', value: 'cell #2', marks: [], data: {} }],
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
                  content: [{ nodeType: 'text', value: 'cell #3', marks: [], data: {} }],
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
                  content: [{ nodeType: 'text', value: 'cell #4', marks: [], data: {} }],
                },
              ],
            },
          ],
        },
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
                  content: [{ nodeType: 'text', value: 'cell #5', marks: [], data: {} }],
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
                  content: [{ nodeType: 'text', value: 'cell #6', marks: [], data: {} }],
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
                  content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', value: 'end', marks: [], data: {} }],
    },
  ],
};
