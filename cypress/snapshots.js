module.exports = {
  'Rich Text Editor': {
    Lists: {
      'supports pasting of a simple list': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                          value: 'item #1',
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
                          value: 'item #2',
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
        },
      },
      'pastes texts inside lists': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                          value: 'Hello world!',
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
        },
      },
      'pastes elements inside links': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                          value: 'This is a ',
                          marks: [],
                          data: {},
                        },
                        {
                          nodeType: 'hyperlink',
                          data: {
                            uri: 'https://example.com',
                          },
                          content: [
                            {
                              nodeType: 'text',
                              value: 'link',
                              marks: [],
                              data: {},
                            },
                          ],
                        },
                        {
                          nodeType: 'text',
                          value: ' and an inline entry: ',
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
                  ],
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
          ],
        },
      },
      'pastes list items as new lists inside lists': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                          value: 'Hello',
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
                                  value: 'world!',
                                  marks: [
                                    {
                                      type: 'bold',
                                    },
                                  ],
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
        },
      },
      'confers the parent list type upon list items pasted within lists': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                      content: [
                        {
                          nodeType: 'text',
                          value: 'Hello',
                          marks: [],
                          data: {},
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
                              content: [
                                {
                                  nodeType: 'text',
                                  value: 'world!',
                                  marks: [
                                    {
                                      type: 'bold',
                                    },
                                  ],
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
        },
      },
      'pastes orphaned list items as unordered lists': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                          value: 'Hello',
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
                                  value: 'world!',
                                  marks: [
                                    {
                                      type: 'bold',
                                    },
                                  ],
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
        },
      },
      'pastes only the text content of other blocks': {
        1: {
          nodeType: 'document',
          data: {},
          content: [
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
                          value: 'Item #1',
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
                          value: 'Header 1',
                          marks: [
                            {
                              type: 'bold',
                            },
                          ],
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
                          value: 'Header 2 (',
                          marks: [],
                          data: {},
                        },
                        {
                          nodeType: 'hyperlink',
                          data: {
                            uri: 'https://example.com',
                          },
                          content: [
                            {
                              nodeType: 'text',
                              value: 'with link',
                              marks: [],
                              data: {},
                            },
                          ],
                        },
                        {
                          nodeType: 'text',
                          value: ')',
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
                          value: 'Cell 1',
                          marks: [
                            {
                              type: 'bold',
                            },
                          ],
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
                          value: 'Cell 2',
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
        },
      },
    },
  },
  __version: '8.7.0',
};
