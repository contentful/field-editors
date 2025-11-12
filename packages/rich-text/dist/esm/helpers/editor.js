import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { focusEditor } from '../internal/misc';
import { getText, getNodeEntries, getNodeEntry, getNodeDescendants, isText, isRangeCollapsed as isSelectionCollapsed, isEditor, isElement, getPathLevels, isCommonPath } from '../internal/queries';
import { setNodes, select, insertNodes, toggleNodeType, moveSelection, unwrapNodes, insertText, wrapNodes, deleteText, collapseSelection } from '../internal/transforms';
import { IS_SAFARI } from './environment';
export const LINK_TYPES = [
    INLINES.HYPERLINK,
    INLINES.ENTRY_HYPERLINK,
    INLINES.RESOURCE_HYPERLINK,
    INLINES.ASSET_HYPERLINK
];
const LIST_TYPES = [
    BLOCKS.OL_LIST,
    BLOCKS.UL_LIST
];
export function isBlockSelected(editor, type) {
    const [match] = Array.from(getNodeEntries(editor, {
        match: (node)=>isElement(node) && node.type === type
    }));
    return !!match;
}
export function isRootLevel(path) {
    return path.length === 1;
}
export function getNodeEntryFromSelection(editor, nodeTypeOrTypes, path) {
    path = path ?? editor.selection?.focus.path;
    if (!path) return [];
    const nodeTypes = Array.isArray(nodeTypeOrTypes) ? nodeTypeOrTypes : [
        nodeTypeOrTypes
    ];
    for(let i = 0; i < path.length; i++){
        const nodeEntry = getNodeEntry(editor, path.slice(0, i + 1));
        if (nodeTypes.includes(nodeEntry[0].type)) return nodeEntry;
    }
    return [];
}
export function isNodeTypeSelected(editor, nodeType) {
    if (!editor) return false;
    const [node] = getNodeEntryFromSelection(editor, nodeType);
    return !!node;
}
export function moveToTheNextLine(editor) {
    moveSelection(editor, {
        distance: 1,
        unit: 'line'
    });
}
export function moveToTheNextChar(editor) {
    moveSelection(editor, {
        distance: 1,
        unit: 'offset'
    });
}
export function insertEmptyParagraph(editor, options) {
    const emptyParagraph = {
        type: BLOCKS.PARAGRAPH,
        children: [
            {
                text: ''
            }
        ],
        data: {},
        isVoid: false
    };
    insertNodes(editor, emptyParagraph, options);
}
export function getElementFromCurrentSelection(editor) {
    if (!editor.selection) return [];
    return Array.from(getNodeEntries(editor, {
        at: editor.selection,
        match: (node)=>isElement(node)
    })).flat();
}
export function isList(editor) {
    if (!editor) {
        return false;
    }
    const element = getElementFromCurrentSelection(editor);
    return element.some((element)=>isElement(element) && LIST_TYPES.includes(element.type));
}
export function getTableSize(table) {
    const numRows = table.children.length;
    if (!numRows) return null;
    const [firstRow] = table.children;
    const numColumns = firstRow.children?.length;
    return {
        numRows,
        numColumns
    };
}
export function insertLink(editor, options) {
    if (editor.selection) {
        wrapLink(editor, options);
    }
}
export function isLinkActive(editor) {
    if (!editor) {
        return false;
    }
    const [link] = Array.from(getNodeEntries(editor, {
        match: (node)=>!isEditor(node) && isElement(node) && LINK_TYPES.includes(node.type)
    }));
    return !!link;
}
export function unwrapLink(editor) {
    unwrapNodes(editor, {
        match: (node)=>!isEditor(node) && isElement(node) && LINK_TYPES.includes(node.type)
    });
}
export function wrapLink(editor, { text, url, target, type, path }) {
    if (isLinkActive(editor) && !path) {
        unwrapLink(editor);
    }
    const { selection } = editor;
    const isCollapsed = selection && isSelectionCollapsed(selection);
    const link = {
        type,
        data: {},
        children: isCollapsed ? [
            {
                text
            }
        ] : []
    };
    if (url) {
        link.data = {
            uri: url
        };
    }
    if (target) {
        link.data = {
            target
        };
    }
    if (path) {
        setNodes(editor, link, {
            at: path
        });
        insertText(editor, text, {
            at: path
        });
        select(editor, path);
    } else if (isCollapsed) {
        insertNodes(editor, link);
    } else {
        wrapNodes(editor, link, {
            split: true
        });
        deleteText(editor);
        insertText(editor, text);
        collapseSelection(editor, {
            edge: 'end'
        });
    }
}
export function getAncestorPathFromSelection(editor) {
    if (!editor.selection) return undefined;
    return getPathLevels(editor.selection.focus.path).find((level)=>level.length === 1);
}
export const isAtEndOfTextSelection = (editor)=>editor.selection?.focus.offset === getText(editor, editor.selection?.focus.path).length;
export function getNextNode(editor) {
    if (!editor.selection) {
        return null;
    }
    const descendants = getNodeDescendants(editor, {
        from: editor.selection.focus.path
    });
    while(true){
        const { done, value } = descendants.next();
        if (done) {
            return null;
        }
        const [node, path] = value;
        if (isCommonPath(path, editor.selection.focus.path)) {
            continue;
        }
        return node;
    }
}
export const INLINE_TYPES = Object.values(INLINES);
export const isInlineOrText = (node)=>{
    return isText(node) || isElement(node) && INLINE_TYPES.includes(node.type);
};
export const focus = (editor)=>{
    const x = window.scrollX;
    const y = window.scrollY;
    focusEditor(editor);
    if (IS_SAFARI) {
        setTimeout(function() {
            window.scrollTo(x, y);
        }, 0);
    }
};
export function toggleElement(editor, options, editorOptions) {
    toggleNodeType(editor, options, editorOptions);
    setNodes(editor, {
        data: {}
    });
}
