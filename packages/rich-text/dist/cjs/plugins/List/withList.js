"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withList", {
    enumerable: true,
    get: function() {
        return withList;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platelist = require("@udecode/plate-list");
const _insertListBreak = require("./insertListBreak");
const _insertListFragment = require("./insertListFragment");
const validLiChildrenTypes = _richtexttypes.LIST_ITEM_BLOCKS;
const withList = (editor)=>{
    const { deleteForward, deleteFragment } = editor;
    editor.deleteForward = (unit)=>{
        if ((0, _platelist.deleteForwardList)(editor, deleteForward, unit)) return;
        deleteForward(unit);
    };
    editor.deleteFragment = ()=>{
        if ((0, _platelist.deleteFragmentList)(editor)) return;
        deleteFragment();
    };
    editor.insertBreak = (0, _insertListBreak.insertListBreak)(editor);
    editor.insertFragment = (0, _insertListFragment.insertListFragment)(editor);
    editor.normalizeNode = (0, _platelist.normalizeList)(editor, {
        validLiChildrenTypes
    });
    return editor;
};
