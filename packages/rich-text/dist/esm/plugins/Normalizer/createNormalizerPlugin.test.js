import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { transformWrapIn } from '../../helpers/transformers';
import { jsx, createTestEditor, mockPlugin, assertOutput } from '../../test-utils';
import { createNormalizerPlugin } from './createNormalizerPlugin';
describe('Normalizer', ()=>{
    const rules = [
        {
            validChildren: [
                BLOCKS.PARAGRAPH
            ]
        }
    ];
    let input;
    beforeEach(()=>{
        input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hembed", {
            type: "Entry",
            id: "embedded-entry"
        }), /*#__PURE__*/ jsx("hp", null, "List item"))));
    });
    const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "List item"))));
    describe('rule.match', ()=>{
        it('matches elements of type "plugin.type" by default', ()=>{
            const { editor } = createTestEditor({
                input,
                plugins: [
                    mockPlugin({
                        isElement: true,
                        type: BLOCKS.LIST_ITEM,
                        normalizer: rules
                    }),
                    createNormalizerPlugin()
                ]
            });
            assertOutput({
                editor,
                expected
            });
        });
        it('rejects rules without "match" in a non-element plugin', ()=>{
            expect(()=>createTestEditor({
                    input,
                    plugins: [
                        mockPlugin({
                            normalizer: rules
                        }),
                        createNormalizerPlugin()
                    ]
                })).toThrow(/rule.match MUST be defined/);
        });
    });
    describe('rule.transform', ()=>{
        it('works with conditional transformation', ()=>{
            const { editor } = createTestEditor({
                input: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hembed", {
                    type: "Entry",
                    id: "embedded-entry"
                }), /*#__PURE__*/ jsx("hinline", {
                    type: "Entry",
                    id: "inline-entry"
                }), /*#__PURE__*/ jsx("hp", null, "List item")))),
                plugins: [
                    mockPlugin({
                        isElement: true,
                        type: BLOCKS.LIST_ITEM,
                        normalizer: [
                            {
                                validChildren: [
                                    BLOCKS.PARAGRAPH
                                ],
                                transform: {
                                    [INLINES.EMBEDDED_ENTRY]: transformWrapIn(BLOCKS.PARAGRAPH)
                                }
                            }
                        ]
                    }),
                    createNormalizerPlugin()
                ]
            });
            assertOutput({
                editor,
                expected: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("hinline", {
                    type: "Entry",
                    id: "inline-entry"
                })), /*#__PURE__*/ jsx("hp", null, "List item"))))
            });
        });
    });
    describe('rule.validChildren', ()=>{
        it('supports custom functions', ()=>{
            const { editor } = createTestEditor({
                input,
                plugins: [
                    mockPlugin({
                        isElement: true,
                        type: BLOCKS.LIST_ITEM,
                        normalizer: [
                            {
                                validChildren: (_, [node])=>{
                                    return node.type === BLOCKS.PARAGRAPH;
                                }
                            }
                        ]
                    }),
                    createNormalizerPlugin()
                ]
            });
            assertOutput({
                editor,
                expected
            });
        });
    });
});
