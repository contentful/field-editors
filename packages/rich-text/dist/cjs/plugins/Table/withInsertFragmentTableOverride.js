"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withInsertFragmentTableOverride", {
    enumerable: true,
    get: function() {
        return withInsertFragmentTableOverride;
    }
});
const _platecommon = require("@udecode/plate-common");
const _platetable = require("@udecode/plate-table");
const _internal = require("../../internal");
const withInsertFragmentTableOverride = (editor)=>{
    const myEditor = (0, _platecommon.getTEditor)(editor);
    const upstreamInsertFragment = myEditor.insertFragment;
    myEditor.insertFragment = (fragment)=>{
        const insertedTable = fragment.find((n)=>n.type === (0, _platecommon.getPluginType)(editor, _platetable.ELEMENT_TABLE));
        if (insertedTable && fragment.length === 1 && fragment[0].type === _platetable.ELEMENT_TABLE) {
            (0, _internal.insertNodes)(editor, fragment, {
                removeEmpty: {
                    exclude: [
                        _platecommon.ELEMENT_DEFAULT
                    ]
                }
            });
            return;
        } else {
            upstreamInsertFragment(fragment);
        }
    };
    return editor;
};
