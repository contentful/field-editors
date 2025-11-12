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
    addMark: function() {
        return addMark;
    },
    collapseSelection: function() {
        return collapseSelection;
    },
    deleteFragment: function() {
        return deleteFragment;
    },
    deleteText: function() {
        return deleteText;
    },
    insertNodes: function() {
        return insertNodes;
    },
    insertText: function() {
        return insertText;
    },
    liftNodes: function() {
        return liftNodes;
    },
    moveChildren: function() {
        return moveChildren;
    },
    moveNodes: function() {
        return moveNodes;
    },
    moveSelection: function() {
        return moveSelection;
    },
    normalize: function() {
        return normalize;
    },
    removeMark: function() {
        return removeMark;
    },
    removeNodes: function() {
        return removeNodes;
    },
    select: function() {
        return select;
    },
    setEditorValue: function() {
        return setEditorValue;
    },
    setNodes: function() {
        return setNodes;
    },
    setSelection: function() {
        return setSelection;
    },
    splitNodes: function() {
        return splitNodes;
    },
    toggleMark: function() {
        return toggleMark;
    },
    toggleNodeType: function() {
        return toggleNodeType;
    },
    unhangRange: function() {
        return unhangRange;
    },
    unsetNodes: function() {
        return unsetNodes;
    },
    unwrapNodes: function() {
        return unwrapNodes;
    },
    withoutNormalizing: function() {
        return withoutNormalizing;
    },
    wrapNodes: function() {
        return wrapNodes;
    }
});
const _platecommon = /*#__PURE__*/ _interop_require_wildcard(require("@udecode/plate-common"));
const _queries = require("./queries");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const normalize = (editor, options = {
    force: true
})=>{
    return _platecommon.normalizeEditor(editor, options);
};
const withoutNormalizing = (editor, fn)=>{
    return _platecommon.withoutNormalizing(editor, fn);
};
const setSelection = (editor, props)=>{
    return _platecommon.setSelection(editor, props);
};
const select = (editor, location)=>{
    return _platecommon.select(editor, location);
};
const moveSelection = (editor, options)=>{
    return _platecommon.moveSelection(editor, options);
};
const moveChildren = (editor, options)=>{
    return _platecommon.moveChildren(editor, options);
};
const collapseSelection = (editor, options)=>{
    return _platecommon.collapseSelection(editor, options);
};
const setNodes = (editor, attrs, opts)=>{
    _platecommon.setNodes(editor, attrs, opts);
};
const unsetNodes = (editor, props, options)=>{
    _platecommon.unsetNodes(editor, props, options);
};
const insertNodes = (editor, nodes, opts)=>{
    return _platecommon.insertNodes(editor, nodes, opts);
};
const splitNodes = (editor, options)=>{
    return _platecommon.splitNodes(editor, options);
};
const liftNodes = (editor, options)=>{
    return _platecommon.liftNodes(editor, options);
};
const unwrapNodes = (editor, options)=>{
    return _platecommon.unwrapNodes(editor, options);
};
const wrapNodes = (editor, element, options)=>{
    return _platecommon.wrapNodes(editor, element, options);
};
const toggleNodeType = (editor, options, editorOptions)=>{
    _platecommon.toggleNodeType(editor, options, editorOptions);
};
const removeMark = (editor, type, at)=>{
    _platecommon.removeMark(editor, {
        key: type,
        at
    });
};
const unhangRange = (editor, range, options)=>{
    return _platecommon.unhangRange(editor, range, options);
};
const toggleMark = (editor, options)=>{
    return _platecommon.toggleMark(editor, options);
};
const addMark = (editor, type, value = true)=>{
    _platecommon.addMark(editor, type, value);
};
const insertText = (editor, text, options)=>{
    return _platecommon.insertText(editor, text, options);
};
const deleteText = (editor, opts)=>{
    _platecommon.deleteText(editor, opts);
};
const removeNodes = (editor, opts)=>{
    _platecommon.removeNodes(editor, opts);
};
const moveNodes = (editor, opts)=>{
    _platecommon.moveNodes(editor, opts);
};
const deleteFragment = (editor, options)=>{
    return _platecommon.deleteFragment(editor, options);
};
const setEditorValue = (editor, nodes)=>{
    withoutNormalizing(editor, ()=>{
        const children = [
            ...editor.children
        ];
        children.forEach((node)=>editor.apply({
                type: 'remove_node',
                path: [
                    0
                ],
                node
            }));
        if (nodes) {
            const nodesArray = (0, _queries.isNode)(nodes) ? [
                nodes
            ] : nodes;
            nodesArray.forEach((node, i)=>{
                editor.apply({
                    type: 'insert_node',
                    path: [
                        i
                    ],
                    node
                });
            });
        }
        const point = (0, _queries.getEndPoint)(editor, []);
        if (point) {
            select(editor, point);
        }
    });
};
