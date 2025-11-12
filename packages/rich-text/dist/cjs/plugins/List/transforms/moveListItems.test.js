"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
const _moveListItems = require("./moveListItems");
describe('moving list items (up/down)', ()=>{
    const renderEditor = (children)=>/*#__PURE__*/ (0, _testutils.jsx)("editor", null, children, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
    const assertTab = (t, shift = false)=>{
        test(t.title, ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input: renderEditor(t.input)
            });
            (0, _moveListItems.moveListItems)(editor, {
                increase: !shift
            });
            (0, _testutils.assertOutput)({
                editor,
                expected: renderEditor(t.expected)
            });
        });
    };
    const tests = [
        {
            title: 'single paragraph',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1")), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null))))))
        },
        {
            title: 'multiple paragraphs',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2")), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p3", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2"), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p3", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null))))))
        },
        {
            title: 'multiple elements',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "a"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "b"), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "quote"))), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "c", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "d"), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Asset",
                id: "asset-id"
            }))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "a"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "b"), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "quote")), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "c", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "d"), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Asset",
                id: "asset-id"
            })))))
        },
        {
            title: 'with a sub-list',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "sub p1")))), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "sub p1")), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null))))))
        },
        {
            title: 'with a sub-list as non-last child',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "sub p1"))), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Entry",
                id: "entry-id"
            })), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p1"), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "sub p1")), /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "p2", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Entry",
                id: "entry-id"
            })))
        }
    ];
    describe('move down (aka. tab)', ()=>{
        tests.forEach((t)=>assertTab(t));
    });
    describe('move up (aka. shift+tab)', ()=>{
        tests.map((t)=>({
                ...t,
                input: t.expected,
                expected: t.input
            })).forEach((t)=>assertTab(t, true));
    });
});
