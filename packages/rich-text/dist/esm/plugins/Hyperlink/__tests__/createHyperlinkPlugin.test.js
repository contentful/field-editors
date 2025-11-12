import { assertOutput, jsx } from '../../../test-utils';
describe('normalization', ()=>{
    it('removes empty links from the document structure', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "link"), /*#__PURE__*/ jsx("hlink", {
            uri: "https://link.com"
        })), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "asset"), /*#__PURE__*/ jsx("hlink", {
            asset: "asset-id"
        })), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "entry"), /*#__PURE__*/ jsx("hlink", {
            entry: "entry-id"
        })), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "resource"), /*#__PURE__*/ jsx("hlink", {
            resource: "resource-urn"
        })), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "explicit empty link"), /*#__PURE__*/ jsx("hlink", {
            uri: "https://link.com"
        }, '')), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "link with empty space"), /*#__PURE__*/ jsx("hlink", {
            uri: "https://link.com"
        }, " ")));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "link")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "asset")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "entry")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "resource")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "explicit empty link")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "link with empty space")));
        assertOutput({
            input,
            expected
        });
    });
});
