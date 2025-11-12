import { jsx, assertOutput, createTestEditor } from '../../../test-utils';
import { insertTableAndFocusFirstCell } from '../helpers';
test('insertTableAndFocusFirstCell', ()=>{
    const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null), /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hp", null));
    const { editor } = createTestEditor({
        input
    });
    insertTableAndFocusFirstCell(editor);
    const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("htable", null, /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("hth", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null), /*#__PURE__*/ jsx("cursor", null))), /*#__PURE__*/ jsx("hth", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)))), /*#__PURE__*/ jsx("htr", null, /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null))), /*#__PURE__*/ jsx("htd", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
    assertOutput({
        input,
        expected
    });
});
