import { assertOutput, jsx } from '../../../test-utils';
describe('normalization', ()=>{
    it('can contain inline entries & hyperlinks', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some text before", /*#__PURE__*/ jsx("hinline", {
            type: "Entry",
            id: "inline-entry"
        }), /*#__PURE__*/ jsx("hlink", {
            uri: "https://contentful.com"
        }), /*#__PURE__*/ jsx("hlink", {
            entry: "entry-id"
        }), /*#__PURE__*/ jsx("hlink", {
            resource: "resource-urn"
        }), /*#__PURE__*/ jsx("hlink", {
            asset: "asset-id"
        }), "some text after")));
        assertOutput({
            input,
            expected: input
        });
    });
    it('unwraps nested quotes', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some"), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
            bold: true,
            italic: true,
            underline: true
        }, "paragraph"))), /*#__PURE__*/ jsx("hp", null, "text")));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
            bold: true,
            italic: true,
            underline: true
        }, "paragraph")), /*#__PURE__*/ jsx("hp", null, "text")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected
        });
    });
    describe('lifts other invalid children', ()=>{
        it('block void elements', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "this"), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "1"
            }), /*#__PURE__*/ jsx("hp", null, "is"), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "1"
            }), /*#__PURE__*/ jsx("hp", null, "a blockquote"), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hh1", null, "Heading 1")));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "this")), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "1"
            }), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "is")), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "1"
            }), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "a blockquote")), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hh1", null, "Heading 1"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('handles lists', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some", /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "list item"))), "text")));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some")), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "list item"))), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "text")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('handles tables', ()=>{
            const table = /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 2"))));
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some", table, "text")));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "some")), table, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "text")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("text", null)));
            assertOutput({
                input,
                expected
            });
        });
    });
});
