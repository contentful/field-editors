import * as p from '@udecode/plate-common';
import * as s from 'slate';
export const getText = (editor, at)=>{
    return p.getEditorString(editor, at);
};
export const isText = (value)=>{
    return p.isText(value);
};
export const getEndPoint = (editor, at)=>{
    return p.getEndPoint(editor, at);
};
export const getStartPoint = (editor, at)=>{
    return p.getStartPoint(editor, at);
};
export const isNode = (value)=>{
    return p.isNode(value);
};
export const isSelectionAtBlockEnd = (editor, options)=>{
    return p.isSelectionAtBlockEnd(editor, options);
};
export const isSelectionAtBlockStart = (editor, options)=>{
    return p.isSelectionAtBlockStart(editor, options);
};
export const getBlockAbove = (editor, options)=>{
    return p.getBlockAbove(editor, options);
};
export const getNodeEntry = (editor, at, options)=>{
    return p.getNodeEntry(editor, at, options);
};
export const getNodeEntries = (editor, options)=>{
    return p.getNodeEntries(editor, options);
};
export const getNodeChildren = (root, path, options)=>{
    return p.getNodeChildren(root, path, options);
};
export const getParentNode = (editor, at, options)=>{
    return p.getParentNode(editor, at, options);
};
export const someNode = (editor, options)=>{
    return p.someNode(editor, options);
};
export const getChildren = (entry)=>{
    if (s.Text.isText(entry[0])) {
        return [];
    }
    return p.getChildren(entry);
};
export const isFirstChild = (path)=>{
    return p.isFirstChild(path);
};
export const getDescendantNodeByPath = (root, path)=>{
    return s.Node.get(root, path);
};
export const getNodeDescendants = (root, options)=>{
    return p.getNodeDescendants(root, {
        ...options,
        pass: undefined
    });
};
export const isRangeCollapsed = (range)=>{
    return p.isCollapsed(range);
};
export const isRangeAcrossBlocks = (editor, options)=>{
    return p.isRangeAcrossBlocks(editor, options);
};
export const isRangeExpanded = (range)=>{
    return p.isExpanded(range);
};
export const getRange = (editor, at, to)=>{
    return p.getRange(editor, at, to);
};
export const getRangeEdges = (range)=>{
    return s.Range.edges(range);
};
export const getRangeStart = (range)=>{
    return s.Range.start(range);
};
export const getRangeEnd = (range)=>{
    return s.Range.end(range);
};
export const getAboveNode = (editor, opts)=>{
    return p.getAboveNode(editor, opts);
};
export const getNextNode = (editor, opts)=>{
    return p.getNextNode(editor, opts);
};
export const getCommonNode = (root, path, another)=>{
    return p.getCommonNode(root, path, another);
};
export const getNodeTexts = (root, opts)=>{
    return p.getNodeTexts(root, opts);
};
export const findNode = (editor, options)=>{
    return p.findNode(editor, options);
};
export const isMarkActive = (editor, type)=>{
    return p.isMarkActive(editor, type);
};
export const getMarks = (editor)=>{
    return p.getMarks(editor);
};
export const isEditor = (value)=>{
    return p.isEditor(value);
};
export const isEditorReadOnly = (editor)=>{
    return p.isEditorReadOnly(editor);
};
export const isElement = (value)=>{
    return p.isElement(value);
};
export const isBlockNode = (editor, value)=>{
    return p.isBlock(editor, value);
};
export const findNodePath = (editor, node)=>{
    return p.findNodePath(editor, node);
};
export const isAncestorPath = (path, another)=>{
    return s.Path.isAncestor(path, another);
};
export const isAncestorEmpty = (editor, node)=>{
    return p.isAncestorEmpty(editor, node);
};
export const getParentPath = (path)=>{
    return s.Path.parent(path);
};
export const getNextPath = (path)=>{
    return s.Path.next(path);
};
export const getPreviousPath = (path)=>{
    return s.Path.previous(path);
};
export const getLastChildPath = (nodeEntry)=>{
    return p.getLastChildPath(nodeEntry);
};
export const getPathLevels = (path, options)=>{
    return s.Path.levels(path, options);
};
export const isCommonPath = (path, anotherPath)=>{
    return s.Path.isCommon(path, anotherPath);
};
export const isFirstChildPath = (path)=>{
    return p.isFirstChild(path);
};
export const isLastChildPath = (entry, childPath)=>{
    return p.isLastChild(entry, childPath);
};
export const isChildPath = (path, another)=>{
    return s.Path.isChild(path, another);
};
export const matchNode = (node, path, fn)=>{
    return p.match(node, path, fn);
};
export const someHtmlElement = (rootNode, predicate)=>{
    return p.someHtmlElement(rootNode, predicate);
};
export const getPointBefore = (editor, at, options)=>{
    return p.getPointBefore(editor, at, options);
};
export const getPointAfter = (editor, at, options)=>{
    return p.getPointAfter(editor, at, options);
};
export const isEndPoint = (editor, point, at)=>{
    return p.isEndPoint(editor, point, at);
};
export const isInline = (editor, value)=>{
    return p.isInline(editor, value);
};
export const queryNode = (entry, options)=>{
    return p.queryNode(entry, options);
};
export const getPluginType = (editor, key)=>{
    return p.getPluginType(editor, key);
};
export const createPathRef = (editor, at)=>{
    return p.createPathRef(editor, at);
};
export const match = (obj, path, predicate)=>{
    return p.match(obj, path, predicate);
};
export const getLastNodeByLevel = (editor, level)=>{
    return p.getLastNodeByLevel(editor, level);
};
