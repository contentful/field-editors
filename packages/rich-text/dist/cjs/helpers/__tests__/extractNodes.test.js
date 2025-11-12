"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platetestutils = require("@udecode/plate-test-utils");
const _extractNodes = require("../extractNodes");
const createEditor = (children)=>(0, _platetestutils.createEditor)('test-editor', {}, children);
const buildParagraph = (children = [])=>({
        type: _richtexttypes.BLOCKS.PARAGRAPH,
        data: {},
        isVoid: false,
        children: children.map((child)=>({
                data: {},
                ...child
            }))
    });
const paragraph = (text = '', marks = {})=>buildParagraph([
        {
            text,
            ...marks
        }
    ]);
const buildList = (type = _richtexttypes.BLOCKS.UL_LIST, secondType = _richtexttypes.BLOCKS.UL_LIST)=>({
        data: {},
        isVoid: false,
        type,
        children: [
            {
                data: {},
                isVoid: false,
                type: _richtexttypes.BLOCKS.LIST_ITEM,
                children: [
                    {
                        type: secondType,
                        isVoid: false,
                        data: {},
                        children: [
                            {
                                data: {},
                                isVoid: false,
                                type: _richtexttypes.BLOCKS.LIST_ITEM,
                                children: [
                                    paragraph('text 1')
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                data: {},
                isVoid: false,
                type: _richtexttypes.BLOCKS.LIST_ITEM,
                children: [
                    paragraph('text 2')
                ]
            },
            {
                data: {},
                isVoid: false,
                type: _richtexttypes.BLOCKS.LIST_ITEM,
                children: [
                    paragraph('text 3')
                ]
            }
        ]
    });
describe('extractParagraphs', ()=>{
    it('table', ()=>{
        const table = {
            data: {},
            isVoid: false,
            type: _richtexttypes.BLOCKS.TABLE,
            children: [
                {
                    type: _richtexttypes.BLOCKS.TABLE_ROW,
                    data: {},
                    isVoid: false,
                    children: [
                        {
                            type: _richtexttypes.BLOCKS.TABLE_HEADER_CELL,
                            data: {},
                            isVoid: false,
                            children: [
                                paragraph('header 1')
                            ]
                        },
                        {
                            type: _richtexttypes.BLOCKS.TABLE_HEADER_CELL,
                            data: {},
                            isVoid: false,
                            children: [
                                paragraph('header 2')
                            ]
                        }
                    ]
                },
                {
                    type: _richtexttypes.BLOCKS.TABLE_ROW,
                    data: {},
                    isVoid: false,
                    children: [
                        {
                            type: _richtexttypes.BLOCKS.TABLE_CELL,
                            data: {},
                            isVoid: false,
                            children: [
                                paragraph('cell 1')
                            ]
                        },
                        {
                            type: _richtexttypes.BLOCKS.TABLE_CELL,
                            data: {},
                            isVoid: false,
                            children: [
                                paragraph('cell 2')
                            ]
                        }
                    ]
                }
            ]
        };
        const editor = createEditor([
            table
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraph('header 1'),
            paragraph('header 2'),
            paragraph('cell 1'),
            paragraph('cell 2')
        ]);
    });
    it('blockquote', ()=>{
        const blockquote = {
            data: {},
            isVoid: false,
            type: _richtexttypes.BLOCKS.QUOTE,
            children: [
                paragraph('text 1'),
                paragraph('text 2')
            ]
        };
        const editor = createEditor([
            blockquote
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraph('text 1'),
            paragraph('text 2')
        ]);
    });
    it('list - UL', ()=>{
        const ul = buildList(_richtexttypes.BLOCKS.UL_LIST, _richtexttypes.BLOCKS.OL_LIST);
        const editor = createEditor([
            ul
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraph('text 1'),
            paragraph('text 2'),
            paragraph('text 3')
        ]);
    });
    it('list - OL', ()=>{
        const ol = buildList(_richtexttypes.BLOCKS.OL_LIST, _richtexttypes.BLOCKS.UL_LIST);
        const editor = createEditor([
            ol
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraph('text 1'),
            paragraph('text 2'),
            paragraph('text 3')
        ]);
    });
    it('should preserve marks', ()=>{
        const element = {
            data: {},
            isVoid: false,
            type: _richtexttypes.BLOCKS.QUOTE,
            children: [
                paragraph('text 1', {
                    bold: true,
                    italic: true
                }),
                paragraph('text 2', {
                    underline: true,
                    code: true
                })
            ]
        };
        const editor = createEditor([
            element
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraph('text 1', {
                bold: true,
                italic: true
            }),
            paragraph('text 2', {
                underline: true,
                code: true
            })
        ]);
    });
    it('should preserve hyperlinks', ()=>{
        const paragraphWithLink = buildParagraph([
            {
                text: 'text 1 '
            },
            {
                type: _richtexttypes.INLINES.HYPERLINK,
                children: [
                    {
                        text: 'with link'
                    }
                ],
                data: {
                    uri: 'https://link.com'
                }
            }
        ]);
        const element = {
            data: {},
            isVoid: false,
            type: _richtexttypes.BLOCKS.QUOTE,
            children: [
                paragraphWithLink,
                paragraph('text 2')
            ]
        };
        const editor = createEditor([
            element
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraphWithLink,
            paragraph('text 2')
        ]);
    });
    it('should preserve embedded inline entries', ()=>{
        const paragraphWithEmbedded = buildParagraph([
            {
                text: 'text 1 '
            },
            {
                type: _richtexttypes.INLINES.EMBEDDED_ENTRY,
                children: [
                    {
                        text: ''
                    }
                ],
                data: {
                    target: {
                        sys: {
                            id: 'inline-id',
                            linkType: 'Entry',
                            type: 'Link'
                        }
                    }
                }
            }
        ]);
        const element = {
            data: {},
            isVoid: false,
            type: _richtexttypes.BLOCKS.QUOTE,
            children: [
                paragraphWithEmbedded,
                paragraph('text 2')
            ]
        };
        const editor = createEditor([
            element
        ]);
        const path = [
            0
        ];
        expect((0, _extractNodes.extractParagraphs)(editor, path)).toEqual([
            paragraphWithEmbedded,
            paragraph('text 2')
        ]);
    });
});
