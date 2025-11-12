"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../test-utils");
const _richtextplaintextrenderer = require("@contentful/rich-text-plain-text-renderer");
const _utils = require("./utils");
const _contentfulslatejsadapter = require("@contentful/contentful-slatejs-adapter");
describe('getTextContent', ()=>{
    const cases = [
        {
            title: 'empty document',
            input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null)
        },
        {
            title: 'list of paragraphs',
            input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 1")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 2")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 3")))
        },
        {
            title: 'void blocks',
            input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 1")), /*#__PURE__*/ (0, _testutils.jsx)("hhr", null), /*#__PURE__*/ (0, _testutils.jsx)("hhr", null), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 2")), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 3")))
        },
        {
            title: 'blockquote inside list item',
            input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 1")), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 2"))))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "trailing paragraph")))
        },
        {
            title: 'empty blockquote between paragraphs',
            input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 1")), /*#__PURE__*/ (0, _testutils.jsx)("hquote", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null))), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "paragraph 3")))
        },
        {
            title: 'paragraphs with inline nodes',
            input: /*#__PURE__*/ (0, _testutils.jsx)("editor", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "text 1"), /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
                id: "first-entry",
                type: "Entry"
            }), /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "text 2"), /*#__PURE__*/ (0, _testutils.jsx)("hinline", {
                id: "another-entry",
                type: "Entry"
            })), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null, "text 3")))
        }
    ];
    cases.forEach(({ title, input })=>{
        it(title, ()=>{
            expect((0, _utils.getTextContent)(input)).toBe((0, _richtextplaintextrenderer.documentToPlainTextString)((0, _contentfulslatejsadapter.toContentfulDocument)({
                document: input.children
            })));
        });
    });
});
