export default {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'embedded-entry-block',
      data: {
        target: {
          sys: {
            id: 'example-entity-id',
            type: 'Link',
            linkType: 'Entry',
          },
        },
      },
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
        {
          nodeType: 'embedded-entry-inline',
          data: {
            target: {
              sys: {
                id: 'example-entity-id',
                type: 'Link',
                linkType: 'Entry',
              },
            },
          },
          content: [],
        },
        {
          nodeType: 'text',
          value: '',
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: 'embedded-asset-block',
      data: {
        target: {
          sys: {
            id: 'example-entity-id',
            type: 'Link',
            linkType: 'Asset',
          },
        },
      },
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
        {
          nodeType: 'asset-hyperlink',
          data: {
            target: {
              sys: {
                id: 'example-entity-id',
                type: 'Link',
                linkType: 'Asset',
              },
            },
          },
          content: [
            {
              nodeType: 'text',
              value: 'an asset',
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
        {
          nodeType: 'entry-hyperlink',
          data: {
            target: {
              sys: {
                id: 'example-entity-id',
                type: 'Link',
                linkType: 'Entry',
              },
            },
          },
          content: [
            {
              nodeType: 'text',
              value: 'an entry',
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
  ],
};
