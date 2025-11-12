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
    buildMarkEventHandler: function() {
        return buildMarkEventHandler;
    },
    toggleMarkAndDeactivateConflictingMarks: function() {
        return toggleMarkAndDeactivateConflictingMarks;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const toggleMarkAndDeactivateConflictingMarks = (editor, mark)=>{
    const subs = [
        _richtexttypes.MARKS.SUPERSCRIPT,
        _richtexttypes.MARKS.SUBSCRIPT
    ];
    const clear = subs.includes(mark) ? subs : [];
    (0, _transforms.toggleMark)(editor, {
        key: mark,
        clear
    });
};
const buildMarkEventHandler = (type)=>(editor, { options: { hotkey } })=>(event)=>{
            if (editor.selection && hotkey && (0, _ishotkey.default)(hotkey, event)) {
                event.preventDefault();
                const isActive = (0, _queries.isMarkActive)(editor, type);
                editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', {
                    markType: type
                });
                toggleMarkAndDeactivateConflictingMarks(editor, type);
            }
        };
