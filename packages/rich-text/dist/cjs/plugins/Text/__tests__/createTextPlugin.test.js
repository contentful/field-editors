"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
describe('delete backward', ()=>{
    const tests = [
        {
            title: 'deletes a character of the text inside li',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null))))
        },
        {
            title: 'does not delete the very first paragraph',
            input: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text")),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text"))
        }
    ];
    const render = (children)=>/*#__PURE__*/ (0, _testutils.jsx)("editor", null, children, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
    for (const t of tests){
        test(t.title, ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input: render(t.input)
            });
            editor.deleteBackward('character');
            (0, _testutils.assertOutput)({
                editor,
                expected: render(t.expected)
            });
        });
    }
});
describe('delete forward', ()=>{
    const tests = [
        {
            title: 'deletes a character of the text inside li',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null), "p1"))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null), "1")))
        },
        {
            title: 'deletes the first paragraph when followed by another paragraph',
            input: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text")),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null), "text")
        },
        {
            title: 'deletes the first paragraph when followed by li',
            input: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1")))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null), "p1")))
        },
        {
            title: 'deletes the first paragraph when followed by a blockquote',
            input: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("cursor", null), "p1"))
        }
    ];
    const render = (children)=>/*#__PURE__*/ (0, _testutils.jsx)("editor", null, children, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
    for (const t of tests){
        test(t.title, ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input: render(t.input)
            });
            editor.deleteForward('character');
            (0, _testutils.assertOutput)({
                editor,
                expected: render(t.expected)
            });
        });
    }
});
