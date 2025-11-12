"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    addTableTrackingEvents: function() {
        return addTableTrackingEvents;
    },
    withInvalidCellChildrenTracking: function() {
        return withInvalidCellChildrenTracking;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _queries = require("../../internal/queries");
const _Tracking = require("../../plugins/Tracking");
function hasTables(nodes) {
    return nodes.some(({ type })=>{
        return type === _richtexttypes.BLOCKS.TABLE;
    });
}
const isTableHeaderCell = ({ type })=>type === _richtexttypes.BLOCKS.TABLE_HEADER_CELL;
function hasHeadersOutsideFirstRow(nodes) {
    return nodes.filter(({ type })=>type === _richtexttypes.BLOCKS.TABLE).flatMap(({ children })=>children.slice(1)).some(({ children })=>children.some(isTableHeaderCell));
}
function addTableTrackingEvents(editor) {
    const { insertData } = editor;
    editor.insertData = (data)=>{
        const html = data.getData('text/html');
        if (html) {
            const { children: markupBefore } = editor;
            insertData(data);
            const { children: markupAfter } = editor;
            setTimeout(()=>{
                if (hasTables(markupBefore)) return;
                if (hasTables(markupAfter)) {
                    editor.tracking.onViewportAction('paste', {
                        tablePasted: true,
                        source: (0, _Tracking.getPastingSource)(data),
                        hasHeadersOutsideFirstRow: hasHeadersOutsideFirstRow(markupAfter)
                    });
                }
            }, 1);
        } else {
            insertData(data);
        }
    };
}
const withInvalidCellChildrenTracking = (transformer)=>{
    return (editor, childEntry)=>{
        const [node] = childEntry;
        if ((0, _queries.isElement)(node)) {
            editor.tracking?.onViewportAction('invalidTablePaste', {
                nodeType: node.type
            });
        }
        return transformer(editor, childEntry);
    };
};
