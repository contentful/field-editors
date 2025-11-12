import { jsx, assertOutput, createTestEditor } from '../../../test-utils';
describe('insert fragment', ()=>{
    const tests = [
        {
            title: 'text wrapped in li > p',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello ", /*#__PURE__*/ jsx("cursor", null)))),
            fragment: /*#__PURE__*/ jsx("fragment", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "world"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello world")))
        },
        {
            title: 'text wrapped in li > h*',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello ", /*#__PURE__*/ jsx("cursor", null)))),
            fragment: /*#__PURE__*/ jsx("fragment", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, "world"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello world")))
        },
        {
            title: 'single li with only asset card',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello", /*#__PURE__*/ jsx("cursor", null), "world"))),
            fragment: /*#__PURE__*/ jsx("fragment", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "asset-id"
            }))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello"), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "asset-id"
            }), /*#__PURE__*/ jsx("hp", null, "world")))
        },
        {
            title: 'two paragraphs',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello ", /*#__PURE__*/ jsx("cursor", null)))),
            fragment: /*#__PURE__*/ jsx("fragment", null, /*#__PURE__*/ jsx("hp", null, "world"), /*#__PURE__*/ jsx("hp", null, "line 2")),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello world"), /*#__PURE__*/ jsx("hp", null, "line 2")))
        },
        {
            title: 'two headings',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello ", /*#__PURE__*/ jsx("cursor", null)))),
            fragment: /*#__PURE__*/ jsx("fragment", null, /*#__PURE__*/ jsx("hh1", null, "world"), /*#__PURE__*/ jsx("hh1", null, "line 2")),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello world"), /*#__PURE__*/ jsx("hh1", null, "line 2")))
        },
        {
            title: 'two paragraphs wrapped in a li',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello ", /*#__PURE__*/ jsx("cursor", null)))),
            fragment: /*#__PURE__*/ jsx("fragment", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "world"), /*#__PURE__*/ jsx("hp", null, "line 2"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "hello "), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "world"), /*#__PURE__*/ jsx("hp", null, "line 2")))))
        }
    ];
    const render = (children)=>/*#__PURE__*/ jsx("editor", null, children, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
    for (const t of tests){
        test(t.title, ()=>{
            const { editor } = createTestEditor({
                input: render(t.input)
            });
            editor.insertFragment(t.fragment);
            assertOutput({
                editor,
                expected: render(t.expected)
            });
        });
    }
});
