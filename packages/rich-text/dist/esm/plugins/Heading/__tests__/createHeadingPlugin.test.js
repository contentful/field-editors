import { assertOutput, jsx } from '../../../test-utils';
describe('normalization', ()=>{
    it('can contain inline entries & hyperlinks', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some text before", /*#__PURE__*/ jsx("hinline", {
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
        }), "some text after"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected: input
        });
    });
    it('unwraps nested paragraphs', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "one", ' ', /*#__PURE__*/ jsx("hp", null, "two ", /*#__PURE__*/ jsx("hp", null, "three ")), "four"));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "one two three four"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        assertOutput({
            input,
            expected
        });
    });
    describe('lifts other invalid children', ()=>{
        it('block void elements', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "1"
            }), " start"), /*#__PURE__*/ jsx("hh1", null, "end ", /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "2"
            })), /*#__PURE__*/ jsx("hh1", null, "in ", /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "3"
            }), " between"), /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "1"
            }), " start"), /*#__PURE__*/ jsx("hh1", null, "end ", /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "2"
            })), /*#__PURE__*/ jsx("hh1", null, "in ", /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "3"
            }), " between"), /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("hhr", null), " start"), /*#__PURE__*/ jsx("hh1", null, "end ", /*#__PURE__*/ jsx("hhr", null)), /*#__PURE__*/ jsx("hh1", null, "in ", /*#__PURE__*/ jsx("hhr", null), " between"));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "1"
            }), /*#__PURE__*/ jsx("hh1", null, " start"), /*#__PURE__*/ jsx("hh1", null, "end "), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "2"
            }), /*#__PURE__*/ jsx("hh1", null, "in "), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "3"
            }), /*#__PURE__*/ jsx("hh1", null, " between"), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "1"
            }), /*#__PURE__*/ jsx("hh1", null, " start"), /*#__PURE__*/ jsx("hh1", null, "end "), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "2"
            }), /*#__PURE__*/ jsx("hh1", null, "in "), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "3"
            }), /*#__PURE__*/ jsx("hh1", null, " between"), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hh1", null, " start"), /*#__PURE__*/ jsx("hh1", null, "end "), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hh1", null, "in "), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hh1", null, " between"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('nested headings', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some", /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("htext", {
                bold: true,
                italic: true,
                underline: true
            }, "paragraph")), "text"));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some"), /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("htext", {
                bold: true,
                italic: true,
                underline: true
            }, "paragraph")), /*#__PURE__*/ jsx("hh1", null, "text"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('handles quotes', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some", /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "quote")), "text"));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some"), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "quote")), /*#__PURE__*/ jsx("hh1", null, "text"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('handles lists', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some", /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "list item"))), "text"));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "list item"))), /*#__PURE__*/ jsx("hh1", null, "text"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
        it('handles tables', ()=>{
            const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some", /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 2")))), "text"));
            const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, "some"), /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 1")), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, "cell 2")))), /*#__PURE__*/ jsx("hh1", null, "text"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
            assertOutput({
                input,
                expected
            });
        });
    });
});
