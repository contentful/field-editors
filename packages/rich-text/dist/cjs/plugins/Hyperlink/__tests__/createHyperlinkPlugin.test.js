"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
describe('normalization', ()=>{
    it('removes empty links from the document structure', ()=>{
        const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "link"), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            uri: "https://link.com"
        })), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "asset"), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            asset: "asset-id"
        })), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "entry"), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            entry: "entry-id"
        })), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "resource"), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            resource: "resource-urn"
        })), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "explicit empty link"), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            uri: "https://link.com"
        }, '')), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "link with empty space"), /*#__PURE__*/ (0, _testutils.jsx)("hlink", {
            uri: "https://link.com"
        }, " ")));
        const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "link")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "asset")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "entry")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "resource")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "explicit empty link")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "link with empty space")));
        (0, _testutils.assertOutput)({
            input,
            expected
        });
    });
});
