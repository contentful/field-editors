import { BLOCKS, INLINES, TOP_LEVEL_BLOCKS, VOID_BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
const inlines = Object.values(INLINES).map((type)=>({
        type
    }));
export default {
    document: {
        nodes: [
            {
                types: TOP_LEVEL_BLOCKS.map((type)=>({
                        type
                    }))
            }
        ]
    },
    blocks: {
        [BLOCKS.PARAGRAPH]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [BLOCKS.HEADING_1]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [BLOCKS.HEADING_2]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [BLOCKS.HEADING_3]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [BLOCKS.HEADING_4]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [BLOCKS.HEADING_5]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [BLOCKS.HEADING_6]: {
            nodes: [
                {
                    match: [
                        ...inlines,
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        ...VOID_BLOCKS.reduce((blocks, nodeType)=>({
                ...blocks,
                [nodeType]: {
                    isVoid: true
                }
            }), {}),
        [BLOCKS.QUOTE]: {
            nodes: [
                {
                    match: [
                        CONTAINERS[BLOCKS.QUOTE].map((type)=>({
                                type
                            }))
                    ],
                    min: 1
                }
            ],
            normalize: (editor, error)=>{
                if (error.code === 'child_type_invalid') {
                    return editor.unwrapBlockByKey(error.node.key, BLOCKS.QUOTE);
                }
            }
        }
    },
    inlines: {
        [INLINES.HYPERLINK]: {
            nodes: [
                {
                    match: [
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [INLINES.ENTRY_HYPERLINK]: {
            nodes: [
                {
                    match: [
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [INLINES.RESOURCE_HYPERLINK]: {
            nodes: [
                {
                    match: [
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [INLINES.ASSET_HYPERLINK]: {
            nodes: [
                {
                    match: [
                        {
                            object: 'text'
                        }
                    ]
                }
            ]
        },
        [INLINES.EMBEDDED_ENTRY]: {
            isVoid: true
        },
        [INLINES.EMBEDDED_RESOURCE]: {
            isVoid: true
        }
    }
};
