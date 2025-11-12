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
    TableActions: function() {
        return TableActions;
    },
    styles: function() {
        return styles;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
const _richtexttypes = require("@contentful/rich-text-types");
const _platetable = require("@udecode/plate-table");
const _emotion = require("emotion");
const _ContentfulEditorProvider = require("../../../ContentfulEditorProvider");
const _editor = require("../../../helpers/editor");
const _internal = require("../../../internal");
const _hooks = require("../../../internal/hooks");
const _queries = require("../../../internal/queries");
const _actions = require("../actions");
const _helpers = require("../helpers");
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
const styles = {
    topRight: (0, _emotion.css)({
        position: 'absolute',
        insetBlockStart: '6px',
        insetInlineEnd: '5px'
    })
};
const getCurrentTableSize = (editor)=>{
    const [table] = (0, _editor.getNodeEntryFromSelection)(editor, _richtexttypes.BLOCKS.TABLE);
    return table ? (0, _editor.getTableSize)(table) : null;
};
const TableActions = ()=>{
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const isDisabled = (0, _hooks.useReadOnly)();
    const [isOpen, setOpen] = _react.useState(false);
    const [isHeaderEnabled, setHeaderEnabled] = _react.useState(false);
    const close = _react.useCallback(()=>{
        setOpen(false);
    }, []);
    _react.useEffect(()=>{
        setHeaderEnabled(Boolean(editor && (0, _helpers.isTableHeaderEnabled)(editor)));
    }, [
        editor
    ]);
    const canInsertRowAbove = _react.useMemo(()=>{
        if (!editor) {
            return false;
        }
        const headerCell = (0, _queries.getAboveNode)(editor, {
            match: {
                type: _richtexttypes.BLOCKS.TABLE_HEADER_CELL
            }
        });
        return !headerCell;
    }, [
        editor
    ]);
    const toggleHeader = _react.useCallback(()=>{
        close();
        if (!editor) {
            return;
        }
        const value = !isHeaderEnabled;
        setHeaderEnabled(value);
        (0, _actions.setHeader)(editor, value);
    }, [
        editor,
        close,
        isHeaderEnabled
    ]);
    const action = _react.useCallback((cb, type, element)=>()=>{
            if (!editor?.selection) return;
            close();
            const tableSize = getCurrentTableSize(editor);
            (0, _internal.withoutNormalizing)(editor, ()=>{
                cb(editor, {
                    header: isHeaderEnabled
                });
            });
            const actionName = `${type}Table${element === 'Table' ? '' : element}`;
            editor.tracking.onViewportAction(actionName, {
                tableSize
            });
        }, [
        editor,
        isHeaderEnabled,
        close
    ]);
    if (isDisabled) {
        return null;
    }
    return /*#__PURE__*/ _react.createElement(_f36components.Menu, {
        placement: "left",
        isOpen: isOpen,
        onOpen: ()=>{
            setOpen(true);
        },
        onClose: close
    }, /*#__PURE__*/ _react.createElement(_f36components.Menu.Trigger, null, /*#__PURE__*/ _react.createElement(_f36components.IconButton, {
        size: "small",
        variant: "transparent",
        tabIndex: -1,
        className: styles.topRight,
        icon: /*#__PURE__*/ _react.createElement(_f36icons.CaretDownIcon, null),
        "aria-label": "Open table menu",
        testId: "cf-table-actions-button"
    })), /*#__PURE__*/ _react.createElement(_f36components.Menu.List, null, /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_actions.addRowAbove, 'insert', 'Row'),
        disabled: !canInsertRowAbove
    }, "Add row above"), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_actions.addRowBelow, 'insert', 'Row')
    }, "Add row below"), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_actions.addColumnLeft, 'insert', 'Column')
    }, "Add column left"), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_actions.addColumnRight, 'insert', 'Column')
    }, "Add column right"), /*#__PURE__*/ _react.createElement(_f36components.Menu.Divider, null), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: toggleHeader
    }, isHeaderEnabled ? 'Disable table header' : 'Enable table header'), /*#__PURE__*/ _react.createElement(_f36components.Menu.Divider, null), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_platetable.deleteRow, 'remove', 'Row')
    }, "Delete row"), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_platetable.deleteColumn, 'remove', 'Column')
    }, "Delete column"), /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        onClick: action(_platetable.deleteTable, 'remove', 'Table')
    }, "Delete table")));
};
