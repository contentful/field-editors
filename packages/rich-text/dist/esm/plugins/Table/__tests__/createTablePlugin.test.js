import { assertOutput, jsx } from '../../../test-utils';
describe('normalization', ()=>{
    describe('Table', ()=>{
        it('removes empty table nodes', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('moves tables to the root level except nested tables', ()=>{
            const table = /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 2"))));
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, "hello", table), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "quote", table)), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "item", table))), /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell with table: ", table)))));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, "hello"), table, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "quote")), table, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "item"))), table, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell with table: "), /*#__PURE__*/ jsx("hp", null, "Cell 1"), /*#__PURE__*/ jsx("hp", null, "Cell 2")))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('removes invalid children', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 2"))), /*#__PURE__*/ jsx("htd", null, "invalid cell"), "invalid text"), /*#__PURE__*/ jsx("hp", null));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 2")))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
    });
    describe('Table cell', ()=>{
        it('converts invalid children to paragraphs', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 2"), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
                bold: true,
                italic: true,
                underline: true
            }, "quote"), /*#__PURE__*/ jsx("hinline", {
                type: "Entry",
                id: "entry-id"
            })))))), /*#__PURE__*/ jsx("hp", null));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Cell 2"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
                bold: true,
                italic: true,
                underline: true
            }, "quote"), /*#__PURE__*/ jsx("hinline", {
                type: "Entry",
                id: "entry-id"
            }), /*#__PURE__*/ jsx("htext", null))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
    });
    describe('Table row', ()=>{
        it('must be wrapped in a table', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell"))));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell")))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('removes empty rows', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htr", null));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('wraps invalid children in table cells', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1")), /*#__PURE__*/ jsx("hp", null, "cell 2"))));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 2")))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('ensures all table rows have the same width', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1"))), /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 2")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 3")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 4"))), /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 5")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 6")))));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null))), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)))), /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 2")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 3")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 4"))), /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 5")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 6")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
    });
});
