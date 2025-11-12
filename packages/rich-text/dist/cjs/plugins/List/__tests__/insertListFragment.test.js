"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testutils = require("../../../test-utils");
describe('insert fragment', ()=>{
    const tests = [
        {
            title: 'text wrapped in li > p',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello ", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            fragment: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "world"))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello world")))
        },
        {
            title: 'text wrapped in li > h*',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello ", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            fragment: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, "world"))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello world")))
        },
        {
            title: 'single li with only asset card',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null), "world"))),
            fragment: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Asset",
                id: "asset-id"
            }))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello"), /*#__PURE__*/ (0, _testutils.jsx)("hembed", {
                type: "Asset",
                id: "asset-id"
            }), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "world")))
        },
        {
            title: 'two paragraphs',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello ", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            fragment: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "world"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "line 2")),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello world"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "line 2")))
        },
        {
            title: 'two headings',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello ", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            fragment: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, "world"), /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, "line 2")),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello world"), /*#__PURE__*/ (0, _testutils.jsx)("hh1", null, "line 2")))
        },
        {
            title: 'two paragraphs wrapped in a li',
            input: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello ", /*#__PURE__*/ (0, _testutils.jsx)("cursor", null)))),
            fragment: /*#__PURE__*/ (0, _testutils.jsx)("fragment", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "world"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "line 2"))),
            expected: /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "hello "), /*#__PURE__*/ (0, _testutils.jsx)("hul", null, /*#__PURE__*/ (0, _testutils.jsx)("hli", null, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "world"), /*#__PURE__*/ (0, _testutils.jsx)("hp", null, "line 2")))))
        }
    ];
    const render = (children)=>/*#__PURE__*/ (0, _testutils.jsx)("editor", null, children, /*#__PURE__*/ (0, _testutils.jsx)("hp", null, /*#__PURE__*/ (0, _testutils.jsx)("htext", null)));
    for (const t of tests){
        test(t.title, ()=>{
            const { editor } = (0, _testutils.createTestEditor)({
                input: render(t.input)
            });
            editor.insertFragment(t.fragment);
            (0, _testutils.assertOutput)({
                editor,
                expected: render(t.expected)
            });
        });
    }
});
