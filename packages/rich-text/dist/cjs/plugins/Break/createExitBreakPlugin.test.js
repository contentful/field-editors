"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _platebreak = require("@udecode/plate-break");
const _testutils = require("../../test-utils");
const _createExitBreakPlugin = require("./createExitBreakPlugin");
describe('Exit Break', ()=>{
    it('derives its config from other plugins', ()=>{
        const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
        const rules = [
            {
                hotkey: 'enter',
                query: {
                    allow: 'h1',
                    end: true,
                    start: true
                }
            }
        ];
        const { editor } = (0, _testutils.createTestEditor)({
            input,
            plugins: [
                (0, _testutils.mockPlugin)({}),
                (0, _testutils.mockPlugin)({
                    exitBreak: rules
                }),
                (0, _createExitBreakPlugin.createExitBreakPlugin)()
            ]
        });
        const outPlugin = editor.pluginsByKey[_platebreak.KEY_EXIT_BREAK];
        expect(outPlugin.options).toEqual({
            rules: expect.arrayContaining(rules)
        });
    });
});
