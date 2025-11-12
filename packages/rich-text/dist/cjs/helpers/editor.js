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
    INLINE_TYPES: function() {
        return INLINE_TYPES;
    },
    LINK_TYPES: function() {
        return LINK_TYPES;
    },
    focus: function() {
        return focus;
    },
    getAncestorPathFromSelection: function() {
        return getAncestorPathFromSelection;
    },
    getElementFromCurrentSelection: function() {
        return getElementFromCurrentSelection;
    },
    getNextNode: function() {
        return getNextNode;
    },
    getNodeEntryFromSelection: function() {
        return getNodeEntryFromSelection;
    },
    getTableSize: function() {
        return getTableSize;
    },
    insertEmptyParagraph: function() {
        return insertEmptyParagraph;
    },
    insertLink: function() {
        return insertLink;
    },
    isAtEndOfTextSelection: function() {
        return isAtEndOfTextSelection;
    },
    isBlockSelected: function() {
        return isBlockSelected;
    },
    isInlineOrText: function() {
        return isInlineOrText;
    },
    isLinkActive: function() {
        return isLinkActive;
    },
    isList: function() {
        return isList;
    },
    isNodeTypeSelected: function() {
        return isNodeTypeSelected;
    },
    isRootLevel: function() {
        return isRootLevel;
    },
    moveToTheNextChar: function() {
        return moveToTheNextChar;
    },
    moveToTheNextLine: function() {
        return moveToTheNextLine;
    },
    toggleElement: function() {
        return toggleElement;
    },
    unwrapLink: function() {
        return unwrapLink;
    },
    wrapLink: function() {
        return wrapLink;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _misc = require("../internal/misc");
const _queries = require("../internal/queries");
const _transforms = require("../internal/transforms");
const _environment = require("./environment");
const LINK_TYPES = [
    _richtexttypes.INLINES.HYPERLINK,
    _richtexttypes.INLINES.ENTRY_HYPERLINK,
    _richtexttypes.INLINES.RESOURCE_HYPERLINK,
    _richtexttypes.INLINES.ASSET_HYPERLINK
];
const LIST_TYPES = [
    _richtexttypes.BLOCKS.OL_LIST,
    _richtexttypes.BLOCKS.UL_LIST
];
function isBlockSelected(editor, type) {
    const [match] = Array.from((0, _queries.getNodeEntries)(editor, {
        match: (node)=>(0, _queries.isElement)(node) && node.type === type
    }));
    return !!match;
}
function isRootLevel(path) {
    return path.length === 1;
}
function getNodeEntryFromSelection(editor, nodeTypeOrTypes, path) {
    path = path ?? editor.selection?.focus.path;
    if (!path) return [];
    const nodeTypes = Array.isArray(nodeTypeOrTypes) ? nodeTypeOrTypes : [
        nodeTypeOrTypes
    ];
    for(let i = 0; i < path.length; i++){
        const nodeEntry = (0, _queries.getNodeEntry)(editor, path.slice(0, i + 1));
        if (nodeTypes.includes(nodeEntry[0].type)) return nodeEntry;
    }
    return [];
}
function isNodeTypeSelected(editor, nodeType) {
    if (!editor) return false;
    const [node] = getNodeEntryFromSelection(editor, nodeType);
    return !!node;
}
function moveToTheNextLine(editor) {
    (0, _transforms.moveSelection)(editor, {
        distance: 1,
        unit: 'line'
    });
}
function moveToTheNextChar(editor) {
    (0, _transforms.moveSelection)(editor, {
        distance: 1,
        unit: 'offset'
    });
}
function insertEmptyParagraph(editor, options) {
    const emptyParagraph = {
        type: _richtexttypes.BLOCKS.PARAGRAPH,
        children: [
            {
                text: ''
            }
        ],
        data: {},
        isVoid: false
    };
    (0, _transforms.insertNodes)(editor, emptyParagraph, options);
}
function getElementFromCurrentSelection(editor) {
    if (!editor.selection) return [];
    return Array.from((0, _queries.getNodeEntries)(editor, {
        at: editor.selection,
        match: (node)=>(0, _queries.isElement)(node)
    })).flat();
}
function isList(editor) {
    if (!editor) {
        return false;
    }
    const element = getElementFromCurrentSelection(editor);
    return element.some((element)=>(0, _queries.isElement)(element) && LIST_TYPES.includes(element.type));
}
function getTableSize(table) {
    const numRows = table.children.length;
    if (!numRows) return null;
    const [firstRow] = table.children;
    const numColumns = firstRow.children?.length;
    return {
        numRows,
        numColumns
    };
}
function insertLink(editor, options) {
    if (editor.selection) {
        wrapLink(editor, options);
    }
}
function isLinkActive(editor) {
    if (!editor) {
        return false;
    }
    const [link] = Array.from((0, _queries.getNodeEntries)(editor, {
        match: (node)=>!(0, _queries.isEditor)(node) && (0, _queries.isElement)(node) && LINK_TYPES.includes(node.type)
    }));
    return !!link;
}
function unwrapLink(editor) {
    (0, _transforms.unwrapNodes)(editor, {
        match: (node)=>!(0, _queries.isEditor)(node) && (0, _queries.isElement)(node) && LINK_TYPES.includes(node.type)
    });
}
function wrapLink(editor, { text, url, target, type, path }) {
    if (isLinkActive(editor) && !path) {
        unwrapLink(editor);
    }
    const { selection } = editor;
    const isCollapsed = selection && (0, _queries.isRangeCollapsed)(selection);
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
        (0, _transforms.setNodes)(editor, link, {
            at: path
        });
        (0, _transforms.insertText)(editor, text, {
            at: path
        });
        (0, _transforms.select)(editor, path);
    } else if (isCollapsed) {
        (0, _transforms.insertNodes)(editor, link);
    } else {
        (0, _transforms.wrapNodes)(editor, link, {
            split: true
        });
        (0, _transforms.deleteText)(editor);
        (0, _transforms.insertText)(editor, text);
        (0, _transforms.collapseSelection)(editor, {
            edge: 'end'
        });
    }
}
function getAncestorPathFromSelection(editor) {
    if (!editor.selection) return undefined;
    return (0, _queries.getPathLevels)(editor.selection.focus.path).find((level)=>level.length === 1);
}
const isAtEndOfTextSelection = (editor)=>editor.selection?.focus.offset === (0, _queries.getText)(editor, editor.selection?.focus.path).length;
function getNextNode(editor) {
    if (!editor.selection) {
        return null;
    }
    const descendants = (0, _queries.getNodeDescendants)(editor, {
        from: editor.selection.focus.path
    });
    while(true){
        const { done, value } = descendants.next();
        if (done) {
            return null;
        }
        const [node, path] = value;
        if ((0, _queries.isCommonPath)(path, editor.selection.focus.path)) {
            continue;
        }
        return node;
    }
}
const INLINE_TYPES = Object.values(_richtexttypes.INLINES);
const isInlineOrText = (node)=>{
    return (0, _queries.isText)(node) || (0, _queries.isElement)(node) && INLINE_TYPES.includes(node.type);
};
const focus = (editor)=>{
    const x = window.scrollX;
    const y = window.scrollY;
    (0, _misc.focusEditor)(editor);
    if (_environment.IS_SAFARI) {
        setTimeout(function() {
            window.scrollTo(x, y);
        }, 0);
    }
};
function toggleElement(editor, options, editorOptions) {
    (0, _transforms.toggleNodeType)(editor, options, editorOptions);
    (0, _transforms.setNodes)(editor, {
        data: {}
    });
}
