"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createDragAndDropPlugin", {
    enumerable: true,
    get: function() {
        return createDragAndDropPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _queries = require("../../internal/queries");
function createDragAndDropPlugin() {
    const DRAGGABLE_TYPES = [
        _richtexttypes.BLOCKS.EMBEDDED_ENTRY,
        _richtexttypes.BLOCKS.EMBEDDED_ASSET,
        _richtexttypes.BLOCKS.EMBEDDED_RESOURCE,
        _richtexttypes.BLOCKS.HR,
        _richtexttypes.INLINES.EMBEDDED_ENTRY,
        _richtexttypes.INLINES.EMBEDDED_RESOURCE
    ];
    const ON_DROP_ALLOWED_TYPES = {
        TABLE: [
            _richtexttypes.INLINES.EMBEDDED_ENTRY,
            _richtexttypes.INLINES.EMBEDDED_RESOURCE
        ]
    };
    return {
        key: 'DragAndDropPlugin',
        handlers: {
            onDrop: (editor)=>(event)=>{
                    const [draggingBlock] = Array.from((0, _queries.getNodeEntries)(editor, {
                        match: (node)=>DRAGGABLE_TYPES.includes(node.type)
                    }));
                    if (!draggingBlock) return false;
                    const [draggingNode] = draggingBlock;
                    if (!event.nativeEvent.target) return false;
                    const dropDisallowed = getParents(event.nativeEvent.target).some((node)=>{
                        return ON_DROP_ALLOWED_TYPES[node.nodeName] ? !ON_DROP_ALLOWED_TYPES[node.nodeName]?.includes(draggingNode.type) : false;
                    });
                    if (!dropDisallowed) {
                        editor.history.undos.push({
                            operations: [],
                            selectionBefore: null
                        });
                    }
                    return dropDisallowed;
                }
        }
    };
}
function getParents(el) {
    const parents = [];
    parents.push(el);
    while(el.parentNode){
        parents.unshift(el.parentNode);
        el = el.parentNode;
    }
    return parents;
}
