import { jsx, assertOutput, createTestEditor } from '../../../test-utils';
describe('insert line break', ()=>{
    const tests = [
        {
            title: 'at the start of a li',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null), "p1"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1")))
        },
        {
            title: 'at the end of a li',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null))))
        },
        {
            title: 'at the middle of a li',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "split ", /*#__PURE__*/ jsx("cursor", null), "me"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "split ")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null), "me")))
        },
        {
            title: 'at the start of a li with multiple p',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null), "p1"), /*#__PURE__*/ jsx("hp", null, "p2"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hp", null, "p2")))
        },
        {
            title: 'at the start of the second p of a li',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null), "p2"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hp", null, "p2")))
        },
        {
            title: 'at the end of a li with multiple p',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hp", null, "p2")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null))))
        },
        {
            title: 'at the middle of a li with multiple p',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "split ", /*#__PURE__*/ jsx("cursor", null), "me"), /*#__PURE__*/ jsx("hp", null, "move me"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "split ")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null), "me"), /*#__PURE__*/ jsx("hp", null, "move me")))
        },
        {
            title: 'at the start of a li with heading',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("cursor", null), "p1"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, "p1")))
        },
        {
            title: 'at the end of a li with heading',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, "p1", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, "p1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null))))
        },
        {
            title: 'at the middle of a li with heading',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, "split ", /*#__PURE__*/ jsx("cursor", null), "me"))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, "split ")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("cursor", null), "me")))
        },
        {
            title: 'at a li with nested list',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "item 1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "item 2", /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "sub list"))))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "item 1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "item 2")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "sub list")))))
        }
    ];
    const render = (children)=>/*#__PURE__*/ jsx("editor", null, children, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
    for (const t of tests){
        test(t.title, ()=>{
            const { editor } = createTestEditor({
                input: render(t.input)
            });
            editor.insertBreak();
            assertOutput({
                editor,
                expected: render(t.expected)
            });
        });
    }
});
