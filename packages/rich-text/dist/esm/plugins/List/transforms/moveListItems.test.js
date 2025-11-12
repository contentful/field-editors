import { jsx, assertOutput, createTestEditor } from '../../../test-utils';
import { moveListItems } from './moveListItems';
describe('moving list items (up/down)', ()=>{
    const renderEditor = (children)=>/*#__PURE__*/ jsx("editor", null, children, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
    const assertTab = (t, shift = false)=>{
        test(t.title, ()=>{
            const { editor } = createTestEditor({
                input: renderEditor(t.input)
            });
            moveListItems(editor, {
                increase: !shift
            });
            assertOutput({
                editor,
                expected: renderEditor(t.expected)
            });
        });
    };
    const tests = [
        {
            title: 'single paragraph',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null))))))
        },
        {
            title: 'multiple paragraphs',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hp", null, "p2")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p3", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hp", null, "p2"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p3", /*#__PURE__*/ jsx("cursor", null))))))
        },
        {
            title: 'multiple elements',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "a"), /*#__PURE__*/ jsx("hp", null, "b"), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "quote"))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "c", /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hp", null, "d"), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "asset-id"
            }))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "a"), /*#__PURE__*/ jsx("hp", null, "b"), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, "quote")), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "c", /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hp", null, "d"), /*#__PURE__*/ jsx("hembed", {
                type: "Asset",
                id: "asset-id"
            })))))
        },
        {
            title: 'with a sub-list',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "sub p1")))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "sub p1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null))))))
        },
        {
            title: 'with a sub-list as non-last child',
            input: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "sub p1"))), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "entry-id"
            })), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null)))),
            expected: /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "sub p1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "p2", /*#__PURE__*/ jsx("cursor", null)))), /*#__PURE__*/ jsx("hembed", {
                type: "Entry",
                id: "entry-id"
            })))
        }
    ];
    describe('move down (aka. tab)', ()=>{
        tests.forEach((t)=>assertTab(t));
    });
    describe('move up (aka. shift+tab)', ()=>{
        tests.map((t)=>({
                ...t,
                input: t.expected,
                expected: t.input
            })).forEach((t)=>assertTab(t, true));
    });
});
