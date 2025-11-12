"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
const _helpers = require("../helpers");
test('insertTableAndFocusFirstCell', ()=>{
    const input = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null), /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)), /*#__PURE__*/ (0, _testutils.jsx)("hp", null));
    const { editor } = (0, _testutils.createTestEditor)({
        input
    });
    (0, _helpers.insertTableAndFocusFirstCell)(editor);
    const expected = /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("htable", null, /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("hth", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null), /*#__PURE__*/ (0, _testutils.jsx)("cursor", null))), /*#__PURE__*/ (0, _testutils.jsx)("hth", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)))), /*#__PURE__*/ (0, _testutils.jsx)("htr", null, /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null))), /*#__PURE__*/ (0, _testutils.jsx)("htd", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null))))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
    (0, _testutils.assertOutput)({
        input,
        expected
    });
});
