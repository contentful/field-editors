"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _contentfulslatejsadapter = require("@contentful/contentful-slatejs-adapter");
const _constants = require("../../plugins/CommandPalette/constants");
const _testutils = require("../../test-utils");
const _removeInternalMarks = require("../removeInternalMarks");
describe('internal mark', ()=>{
    describe('First level nodes', ()=>{
        const data = [
            {
                title: 'Paragraph mark is removed',
                input: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                        [_constants.COMMAND_PROMPT]: true
                    }))).children
                }),
                expected: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null))).children
                })
            },
            {
                title: 'Heading mark is removed',
                input: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                        [_constants.COMMAND_PROMPT]: true
                    }))).children
                }),
                expected: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null))).children
                })
            },
            {
                title: 'Block quote mark is removed',
                input: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                        [_constants.COMMAND_PROMPT]: true
                    })))).children
                }),
                expected: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)))).children
                })
            },
            {
                title: 'Other marks are not removed',
                input: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                        bold: true,
                        underline: true,
                        [_constants.COMMAND_PROMPT]: true
                    })))).children
                }),
                expected: (0, _contentfulslatejsadapter.toContentfulDocument)({
                    document: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", {
                        bold: true,
                        underline: true
                    })))).children
                })
            }
        ];
        for (const { input, expected, title } of data){
            it(`${title}`, ()=>{
                expect((0, _removeInternalMarks.removeInternalMarks)(input)).toEqual(expected);
            });
        }
    });
});
