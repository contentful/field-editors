"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _platebreak = require("@udecode/plate-break");
const _testutils = require("../../test-utils");
const _createSoftBreakPlugin = require("./createSoftBreakPlugin");
describe('Soft Break', ()=>{
    it('derives its config from other plugins', ()=>{
        const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
        const rules = [
            {
                hotkey: 'ctrl+enter',
                query: {
                    allow: 'p'
                }
            },
            {
                hotkey: 'ctrl+enter',
                query: {
                    allow: 'h1'
                }
            }
        ];
        const { editor } = (0, _testutils.createTestEditor)({
            input,
            plugins: [
                (0, _testutils.mockPlugin)({
                    softBreak: [
                        rules[0]
                    ]
                }),
                (0, _testutils.mockPlugin)({}),
                (0, _testutils.mockPlugin)({
                    softBreak: [
                        rules[1]
                    ]
                }),
                (0, _createSoftBreakPlugin.createSoftBreakPlugin)()
            ]
        });
        const outPlugin = editor.pluginsByKey[_platebreak.KEY_SOFT_BREAK];
        expect(outPlugin.options).toEqual({
            rules
        });
    });
});
