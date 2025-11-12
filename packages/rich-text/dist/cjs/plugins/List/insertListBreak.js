"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "insertListBreak", {
    enumerable: true,
    get: function() {
        return insertListBreak;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platecommon = require("@udecode/plate-common");
const _platelist = require("@udecode/plate-list");
const _plateresetnode = require("@udecode/plate-reset-node");
const _insertListItem = require("./transforms/insertListItem");
const listBreak = (editor)=>{
    if (!editor.selection) return false;
    const res = (0, _platelist.getListItemEntry)(editor, {});
    let moved;
    if (res) {
        const { list, listItem } = res;
        const childNode = listItem[0].children[0];
        if ((0, _platecommon.isBlockAboveEmpty)(editor) && listItem[0].children.length === 1 && _richtexttypes.TEXT_CONTAINERS.includes(childNode.type)) {
            moved = (0, _platelist.moveListItemUp)(editor, {
                list,
                listItem
            });
            if (moved) return true;
        }
    }
    const didReset = (0, _plateresetnode.onKeyDownResetNode)(editor, (0, _platecommon.mockPlugin)({
        options: {
            rules: [
                {
                    types: [
                        (0, _platecommon.getPluginType)(editor, _platelist.ELEMENT_LI)
                    ],
                    defaultType: (0, _platecommon.getPluginType)(editor, _platecommon.ELEMENT_DEFAULT),
                    predicate: ()=>!moved && (0, _platecommon.isBlockAboveEmpty)(editor),
                    onReset: (_editor)=>(0, _platelist.unwrapList)(_editor)
                }
            ]
        }
    }))(_plateresetnode.SIMULATE_BACKSPACE);
    if (didReset) {
        return true;
    }
    if (!moved) {
        const inserted = (0, _insertListItem.insertListItem)(editor);
        if (inserted) return true;
    }
    return false;
};
const insertListBreak = (editor)=>{
    const { insertBreak } = editor;
    return ()=>{
        if (listBreak(editor)) return;
        insertBreak();
    };
};
