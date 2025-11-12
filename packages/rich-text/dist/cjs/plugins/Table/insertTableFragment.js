"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "insertTableFragment", {
    enumerable: true,
    get: function() {
        return insertTableFragment;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _editor = require("../../helpers/editor");
const _queries = require("../../internal/queries");
const _helpers = require("./helpers");
const trimUnnecessaryTableWrapper = (node)=>{
    if (!(0, _queries.isElement)(node)) {
        return [
            node
        ];
    }
    if (node.type !== _richtexttypes.BLOCKS.TABLE || node.children?.length !== 1) {
        return [
            node
        ];
    }
    const row = node.children[0];
    if (row?.children?.length !== 1) {
        return [
            node
        ];
    }
    const cell = row.children[0];
    return cell.children;
};
const insertTableFragment = (editor)=>{
    const { insertFragment } = editor;
    return (fragments)=>{
        if (!editor.selection) {
            return;
        }
        fragments = fragments.flatMap(trimUnnecessaryTableWrapper);
        const isInsertingTable = fragments.some((fragment)=>(0, _helpers.isTable)(fragment));
        const isTableFirstFragment = fragments.findIndex((fragment)=>(0, _helpers.isTable)(fragment)) === 0;
        const currentLineHasText = (0, _queries.getText)(editor, editor.selection?.focus.path) !== '';
        if (isInsertingTable && isTableFirstFragment && currentLineHasText) {
            (0, _editor.insertEmptyParagraph)(editor);
        }
        return insertFragment(fragments);
    };
};
