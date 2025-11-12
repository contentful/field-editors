"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _richtexttypes = require("@contentful/rich-text-types");
const _transformers = require("../../helpers/transformers");
const _testutils = require("../../test-utils");
const _createNormalizerPlugin = require("./createNormalizerPlugin");
describe('Normalizer', ()=>{
    const rules = [
        {
            validChildren: [
                _richtexttypes.BLOCKS.PARAGRAPH
            ]
        }
    ];
    let input;
    beforeEach(()=>{
        input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
            type: "Entry",
            id: "embedded-entry"
        }), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "List item"))));
    });
    const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "List item"))));
    describe('rule.match', ()=>{
        it('matches elements of type "plugin.type" by default', ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input,
                plugins: [
                    (0, _testutils.mockPlugin)({
                        isElement: true,
                        type: _richtexttypes.BLOCKS.LIST_ITEM,
                        normalizer: rules
                    }),
                    (0, _createNormalizerPlugin.createNormalizerPlugin)()
                ]
            });
            (0, _testutils.assertOutput)({
                editor,
                expected
            });
        });
        it('rejects rules without "match" in a non-element plugin', ()=>{
            expect(()=>(0, _testutils.createTestEditor)({
                    input,
                    plugins: [
                        (0, _testutils.mockPlugin)({
                            normalizer: rules
                        }),
                        (0, _createNormalizerPlugin.createNormalizerPlugin)()
                    ]
                })).toThrow(/rule.match MUST be defined/);
        });
    });
    describe('rule.transform', ()=>{
        it('works with conditional transformation', ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                    type: "Entry",
                    id: "embedded-entry"
                }), /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
                    type: "Entry",
                    id: "inline-entry"
                }), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "List item")))),
                plugins: [
                    (0, _testutils.mockPlugin)({
                        isElement: true,
                        type: _richtexttypes.BLOCKS.LIST_ITEM,
                        normalizer: [
                            {
                                validChildren: [
                                    _richtexttypes.BLOCKS.PARAGRAPH
                                ],
                                transform: {
                                    [_richtexttypes.INLINES.EMBEDDED_ENTRY]: (0, _transformers.transformWrapIn)(_richtexttypes.BLOCKS.PARAGRAPH)
                                }
                            }
                        ]
                    }),
                    (0, _createNormalizerPlugin.createNormalizerPlugin)()
                ]
            });
            (0, _testutils.assertOutput)({
                editor,
                expected: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
                    type: "Entry",
                    id: "inline-entry"
                })), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "List item"))))
            });
        });
    });
    describe('rule.validChildren', ()=>{
        it('supports custom functions', ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input,
                plugins: [
                    (0, _testutils.mockPlugin)({
                        isElement: true,
                        type: _richtexttypes.BLOCKS.LIST_ITEM,
                        normalizer: [
                            {
                                validChildren: (_, [node])=>{
                                    return node.type === _richtexttypes.BLOCKS.PARAGRAPH;
                                }
                            }
                        ]
                    }),
                    (0, _createNormalizerPlugin.createNormalizerPlugin)()
                ]
            });
            (0, _testutils.assertOutput)({
                editor,
                expected
            });
        });
    });
});
