import { BLOCKS } from '@contentful/rich-text-types';
import { assertOutput, jsx, createTestEditor } from '../../../test-utils';
import { toggleList } from './toggleList';
describe('toggle on', ()=>{
    it('should turn a p to list', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, "1", /*#__PURE__*/ jsx("cursor", null)));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1", /*#__PURE__*/ jsx("cursor", null)))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.UL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
    it('should turn a p with a selection to list', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, "Planetas ", /*#__PURE__*/ jsx("anchor", null), "mori in", /*#__PURE__*/ jsx("focus", null), " gandavum!"));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "Planetas ", /*#__PURE__*/ jsx("anchor", null), "mori in", /*#__PURE__*/ jsx("focus", null), " gandavum!"))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.UL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
    it('should turn multiple p to list', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("anchor", null), "1"), /*#__PURE__*/ jsx("hp", null, "2"), /*#__PURE__*/ jsx("hp", null, "3", /*#__PURE__*/ jsx("focus", null)));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("anchor", null), "1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "2")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "3", /*#__PURE__*/ jsx("focus", null)))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.UL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
});
describe('toggle off', ()=>{
    it('should split a simple list to two', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "2", /*#__PURE__*/ jsx("cursor", null))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "3"))));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1"))), /*#__PURE__*/ jsx("hp", null, "2", /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "3"))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.UL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
    it('should split a nested list', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "11")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "12", /*#__PURE__*/ jsx("cursor", null))), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "13"))))));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "11"))))), /*#__PURE__*/ jsx("hp", null, "12", /*#__PURE__*/ jsx("cursor", null)), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "13"))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.UL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
    it('should turn a list to multiple p', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("anchor", null), "1")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "2")), /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "3", /*#__PURE__*/ jsx("focus", null)))));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("anchor", null), "1"), /*#__PURE__*/ jsx("hp", null, "2"), /*#__PURE__*/ jsx("hp", null, "3", /*#__PURE__*/ jsx("focus", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.UL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
});
describe('toggle over', ()=>{
    it('should toggle different list types', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1", /*#__PURE__*/ jsx("cursor", null)))));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hol", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1"))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.OL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
    it('should only toggle the nested list', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "11", /*#__PURE__*/ jsx("cursor", null)))))));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "1"), /*#__PURE__*/ jsx("hol", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "11", /*#__PURE__*/ jsx("cursor", null)))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.OL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
    it('should only toggle everything that is selected', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("anchor", null), "1"), /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "11", /*#__PURE__*/ jsx("focus", null)))))));
        const expected = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hol", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("anchor", null), "1"), /*#__PURE__*/ jsx("hol", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, "11", /*#__PURE__*/ jsx("focus", null)))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const { editor } = createTestEditor({
            input
        });
        toggleList(editor, {
            type: BLOCKS.OL_LIST
        });
        assertOutput({
            editor,
            expected
        });
    });
});
