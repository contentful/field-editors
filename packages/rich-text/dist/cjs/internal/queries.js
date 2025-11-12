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
    createPathRef: function() {
        return createPathRef;
    },
    findNode: function() {
        return findNode;
    },
    findNodePath: function() {
        return findNodePath;
    },
    getAboveNode: function() {
        return getAboveNode;
    },
    getBlockAbove: function() {
        return getBlockAbove;
    },
    getChildren: function() {
        return getChildren;
    },
    getCommonNode: function() {
        return getCommonNode;
    },
    getDescendantNodeByPath: function() {
        return getDescendantNodeByPath;
    },
    getEndPoint: function() {
        return getEndPoint;
    },
    getLastChildPath: function() {
        return getLastChildPath;
    },
    getLastNodeByLevel: function() {
        return getLastNodeByLevel;
    },
    getMarks: function() {
        return getMarks;
    },
    getNextNode: function() {
        return getNextNode;
    },
    getNextPath: function() {
        return getNextPath;
    },
    getNodeChildren: function() {
        return getNodeChildren;
    },
    getNodeDescendants: function() {
        return getNodeDescendants;
    },
    getNodeEntries: function() {
        return getNodeEntries;
    },
    getNodeEntry: function() {
        return getNodeEntry;
    },
    getNodeTexts: function() {
        return getNodeTexts;
    },
    getParentNode: function() {
        return getParentNode;
    },
    getParentPath: function() {
        return getParentPath;
    },
    getPathLevels: function() {
        return getPathLevels;
    },
    getPluginType: function() {
        return getPluginType;
    },
    getPointAfter: function() {
        return getPointAfter;
    },
    getPointBefore: function() {
        return getPointBefore;
    },
    getPreviousPath: function() {
        return getPreviousPath;
    },
    getRange: function() {
        return getRange;
    },
    getRangeEdges: function() {
        return getRangeEdges;
    },
    getRangeEnd: function() {
        return getRangeEnd;
    },
    getRangeStart: function() {
        return getRangeStart;
    },
    getStartPoint: function() {
        return getStartPoint;
    },
    getText: function() {
        return getText;
    },
    isAncestorEmpty: function() {
        return isAncestorEmpty;
    },
    isAncestorPath: function() {
        return isAncestorPath;
    },
    isBlockNode: function() {
        return isBlockNode;
    },
    isChildPath: function() {
        return isChildPath;
    },
    isCommonPath: function() {
        return isCommonPath;
    },
    isEditor: function() {
        return isEditor;
    },
    isEditorReadOnly: function() {
        return isEditorReadOnly;
    },
    isElement: function() {
        return isElement;
    },
    isEndPoint: function() {
        return isEndPoint;
    },
    isFirstChild: function() {
        return isFirstChild;
    },
    isFirstChildPath: function() {
        return isFirstChildPath;
    },
    isInline: function() {
        return isInline;
    },
    isLastChildPath: function() {
        return isLastChildPath;
    },
    isMarkActive: function() {
        return isMarkActive;
    },
    isNode: function() {
        return isNode;
    },
    isRangeAcrossBlocks: function() {
        return isRangeAcrossBlocks;
    },
    isRangeCollapsed: function() {
        return isRangeCollapsed;
    },
    isRangeExpanded: function() {
        return isRangeExpanded;
    },
    isSelectionAtBlockEnd: function() {
        return isSelectionAtBlockEnd;
    },
    isSelectionAtBlockStart: function() {
        return isSelectionAtBlockStart;
    },
    isText: function() {
        return isText;
    },
    match: function() {
        return match;
    },
    matchNode: function() {
        return matchNode;
    },
    queryNode: function() {
        return queryNode;
    },
    someHtmlElement: function() {
        return someHtmlElement;
    },
    someNode: function() {
        return someNode;
    }
});
const _platecommon = /*#__PURE__*/ _interop_require_wildcard(require("@udecode/plate-common"));
const _slate = /*#__PURE__*/ _interop_require_wildcard(require("slate"));
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
const getText = (editor, at)=>{
    return _platecommon.getEditorString(editor, at);
};
const isText = (value)=>{
    return _platecommon.isText(value);
};
const getEndPoint = (editor, at)=>{
    return _platecommon.getEndPoint(editor, at);
};
const getStartPoint = (editor, at)=>{
    return _platecommon.getStartPoint(editor, at);
};
const isNode = (value)=>{
    return _platecommon.isNode(value);
};
const isSelectionAtBlockEnd = (editor, options)=>{
    return _platecommon.isSelectionAtBlockEnd(editor, options);
};
const isSelectionAtBlockStart = (editor, options)=>{
    return _platecommon.isSelectionAtBlockStart(editor, options);
};
const getBlockAbove = (editor, options)=>{
    return _platecommon.getBlockAbove(editor, options);
};
const getNodeEntry = (editor, at, options)=>{
    return _platecommon.getNodeEntry(editor, at, options);
};
const getNodeEntries = (editor, options)=>{
    return _platecommon.getNodeEntries(editor, options);
};
const getNodeChildren = (root, path, options)=>{
    return _platecommon.getNodeChildren(root, path, options);
};
const getParentNode = (editor, at, options)=>{
    return _platecommon.getParentNode(editor, at, options);
};
const someNode = (editor, options)=>{
    return _platecommon.someNode(editor, options);
};
const getChildren = (entry)=>{
    if (_slate.Text.isText(entry[0])) {
        return [];
    }
    return _platecommon.getChildren(entry);
};
const isFirstChild = (path)=>{
    return _platecommon.isFirstChild(path);
};
const getDescendantNodeByPath = (root, path)=>{
    return _slate.Node.get(root, path);
};
const getNodeDescendants = (root, options)=>{
    return _platecommon.getNodeDescendants(root, {
        ...options,
        pass: undefined
    });
};
const isRangeCollapsed = (range)=>{
    return _platecommon.isCollapsed(range);
};
const isRangeAcrossBlocks = (editor, options)=>{
    return _platecommon.isRangeAcrossBlocks(editor, options);
};
const isRangeExpanded = (range)=>{
    return _platecommon.isExpanded(range);
};
const getRange = (editor, at, to)=>{
    return _platecommon.getRange(editor, at, to);
};
const getRangeEdges = (range)=>{
    return _slate.Range.edges(range);
};
const getRangeStart = (range)=>{
    return _slate.Range.start(range);
};
const getRangeEnd = (range)=>{
    return _slate.Range.end(range);
};
const getAboveNode = (editor, opts)=>{
    return _platecommon.getAboveNode(editor, opts);
};
const getNextNode = (editor, opts)=>{
    return _platecommon.getNextNode(editor, opts);
};
const getCommonNode = (root, path, another)=>{
    return _platecommon.getCommonNode(root, path, another);
};
const getNodeTexts = (root, opts)=>{
    return _platecommon.getNodeTexts(root, opts);
};
const findNode = (editor, options)=>{
    return _platecommon.findNode(editor, options);
};
const isMarkActive = (editor, type)=>{
    return _platecommon.isMarkActive(editor, type);
};
const getMarks = (editor)=>{
    return _platecommon.getMarks(editor);
};
const isEditor = (value)=>{
    return _platecommon.isEditor(value);
};
const isEditorReadOnly = (editor)=>{
    return _platecommon.isEditorReadOnly(editor);
};
const isElement = (value)=>{
    return _platecommon.isElement(value);
};
const isBlockNode = (editor, value)=>{
    return _platecommon.isBlock(editor, value);
};
const findNodePath = (editor, node)=>{
    return _platecommon.findNodePath(editor, node);
};
const isAncestorPath = (path, another)=>{
    return _slate.Path.isAncestor(path, another);
};
const isAncestorEmpty = (editor, node)=>{
    return _platecommon.isAncestorEmpty(editor, node);
};
const getParentPath = (path)=>{
    return _slate.Path.parent(path);
};
const getNextPath = (path)=>{
    return _slate.Path.next(path);
};
const getPreviousPath = (path)=>{
    return _slate.Path.previous(path);
};
const getLastChildPath = (nodeEntry)=>{
    return _platecommon.getLastChildPath(nodeEntry);
};
const getPathLevels = (path, options)=>{
    return _slate.Path.levels(path, options);
};
const isCommonPath = (path, anotherPath)=>{
    return _slate.Path.isCommon(path, anotherPath);
};
const isFirstChildPath = (path)=>{
    return _platecommon.isFirstChild(path);
};
const isLastChildPath = (entry, childPath)=>{
    return _platecommon.isLastChild(entry, childPath);
};
const isChildPath = (path, another)=>{
    return _slate.Path.isChild(path, another);
};
const matchNode = (node, path, fn)=>{
    return _platecommon.match(node, path, fn);
};
const someHtmlElement = (rootNode, predicate)=>{
    return _platecommon.someHtmlElement(rootNode, predicate);
};
const getPointBefore = (editor, at, options)=>{
    return _platecommon.getPointBefore(editor, at, options);
};
const getPointAfter = (editor, at, options)=>{
    return _platecommon.getPointAfter(editor, at, options);
};
const isEndPoint = (editor, point, at)=>{
    return _platecommon.isEndPoint(editor, point, at);
};
const isInline = (editor, value)=>{
    return _platecommon.isInline(editor, value);
};
const queryNode = (entry, options)=>{
    return _platecommon.queryNode(entry, options);
};
const getPluginType = (editor, key)=>{
    return _platecommon.getPluginType(editor, key);
};
const createPathRef = (editor, at)=>{
    return _platecommon.createPathRef(editor, at);
};
const match = (obj, path, predicate)=>{
    return _platecommon.match(obj, path, predicate);
};
const getLastNodeByLevel = (editor, level)=>{
    return _platecommon.getLastNodeByLevel(editor, level);
};
