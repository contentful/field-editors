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
    onKeyDownToggleQuote: function() {
        return onKeyDownToggleQuote;
    },
    toggleQuote: function() {
        return toggleQuote;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _editor = require("../../helpers/editor");
const _internal = require("../../internal");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function toggleQuote(editor, logAction) {
    if (!editor.selection) return;
    const isActive = (0, _editor.isBlockSelected)(editor, _richtexttypes.BLOCKS.QUOTE);
    logAction?.(isActive ? 'remove' : 'insert', {
        nodeType: _richtexttypes.BLOCKS.QUOTE
    });
    (0, _internal.withoutNormalizing)(editor, ()=>{
        if (!editor.selection) return;
        (0, _internal.unwrapNodes)(editor, {
            match: (node)=>(0, _internal.isElement)(node) && node.type === _richtexttypes.BLOCKS.QUOTE,
            split: true
        });
        if (!isActive) {
            const quote = {
                type: _richtexttypes.BLOCKS.QUOTE,
                data: {},
                children: []
            };
            (0, _internal.wrapNodes)(editor, quote);
        }
    });
}
const onKeyDownToggleQuote = (editor, plugin)=>(event)=>{
        const { hotkey } = plugin.options;
        if (hotkey && (0, _ishotkey.default)(hotkey, event)) {
            event.preventDefault();
            toggleQuote(editor, editor.tracking.onShortcutAction);
        }
    };
