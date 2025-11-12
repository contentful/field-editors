"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
describe('normalization', ()=>{
    it('can contain inline entries & hyperlinks', ()=>{
        const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some text before", /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
            type: "Entry",
            id: "inline-entry"
        }), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            uri: "https://contentful.com"
        }), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            entry: "entry-id"
        }), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            resource: "resource-urn"
        }), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            asset: "asset-id"
        }), "some text after")));
        (0, _testutils.assertOutput)({
            input,
            expected: input
        });
    });
    it('unwraps nested quotes', ()=>{
        const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some"), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
            bold: true,
            italic: true,
            underline: true
        }, "paragraph"))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text")));
        const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
            bold: true,
            italic: true,
            underline: true
        }, "paragraph")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
        (0, _testutils.assertOutput)({
            input,
            expected
        });
    });
    describe('lifts other invalid children', ()=>{
        it('block void elements', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "this"), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Asset",
                id: "1"
            }), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "is"), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Entry",
                id: "1"
            }), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "a blockquote"), /*#__PURE__*/ (0, _testutils.jsx)("hhr", null), /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, "Heading 1")));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "this")), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Asset",
                id: "1"
            }), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "is")), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Entry",
                id: "1"
            }), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "a blockquote")), /*#__PURE__*/ (0, _testutils.jsx)("hhr", null), /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, "Heading 1"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('handles lists', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some", /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "list item"))), "text")));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some")), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "list item"))), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('handles tables', ()=>{
            const table = /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 2"))));
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some", table, "text")));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "some")), table, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "text")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
    });
});
