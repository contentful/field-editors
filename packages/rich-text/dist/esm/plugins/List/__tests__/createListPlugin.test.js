import { assertOutput, jsx } from '../../../test-utils';
describe('normalization', ()=>{
    it('wraps orphaned list items in a list', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item")), /*#__PURE__*/ jsx("hp", null));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item"))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected
        });
    });
    it('adds empty paragraph to empty list items', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null)), /*#__PURE__*/ jsx("hp", null));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected
        });
    });
    it('replaces invalid list items with text', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item"), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
            bold: true
        }, "bold text"))), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "Take a look at this ", /*#__PURE__*/ jsx("hlink", {
            uri: "https://google.com"
        }, "link"))))), /*#__PURE__*/ jsx("hp", null));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
            bold: true
        }, "bold text")), /*#__PURE__*/ jsx("hp", null, "Take a look at this ", /*#__PURE__*/ jsx("hlink", {
            uri: "https://google.com"
        }, "link"), /*#__PURE__*/ jsx("htext", null)))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected
        });
    });
    it('replaces list items with nested lists as a first child', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 1.1")))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 2.1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 2.1.1")))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 2.2"))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 1.1")))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 2.1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 2.1.1")))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Item 2.2"))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected
        });
    });
});
