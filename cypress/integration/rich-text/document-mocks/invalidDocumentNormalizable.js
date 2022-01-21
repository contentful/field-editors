// This document contains errors that must be solved with normalization:
// - lists with no items
// - list items with no paragraph

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
          value: 'test',
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: 'paragraph',
      data: {},
      content: [],
    },
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
                  value: 'unordered list first item',
                  marks: [],
                  data: {},
                },
              ],
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
                {
                  nodeType: 'text',
                  value: 'unordered list second item',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        {
          nodeType: 'list-item',
          data: {},
          content: [],
        },
      ],
    },
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
      ],
    },
    {
      nodeType: 'ordered-list',
      data: {},
      content: [],
    },
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
      ],
    },
  ],
};
