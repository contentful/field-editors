"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
describe('normalization', ()=>{
    describe('Table', ()=>{
        it('removes empty table nodes', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('moves tables to the root level except nested tables', ()=>{
            const table = /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 2"))));
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello", table), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "quote", table)), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "item", table))), /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell with table: ", table)))));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello"), table, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "quote")), table, /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "item"))), table, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell with table: "), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 1"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 2")))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('removes invalid children', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 2"))), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, "invalid cell"), "invalid text"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 2")))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
    });
    describe('Table cell', ()=>{
        it('converts invalid children to paragraphs', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 2"), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                bold: true,
                italic: true,
                underline: true
            }, "quote"), /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
                type: "Entry",
                id: "entry-id"
            })))))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "Cell 2"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                bold: true,
                italic: true,
                underline: true
            }, "quote"), /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
                type: "Entry",
                id: "entry-id"
            }), /*#__PURE__*/ (0, _testutils.jsx)("htext", null))))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
    });
    describe('Table row', ()=>{
        it('must be wrapped in a table', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell"))));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell")))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('removes empty rows', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('wraps invalid children in table cells', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 2"))));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 2")))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
        it('ensures all table rows have the same width', ()=>{
            const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 1"))), /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 2")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 3")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 4"))), /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 5")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 6")))));
            const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 1")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null))), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)))), /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 2")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 3")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 4"))), /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 5")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "cell 6")), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null))))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("text", null)));
            (0, _testutils.assertOutput)({
                input,
                expected
            });
        });
    });
});
