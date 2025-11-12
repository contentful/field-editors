"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "onKeyDownList", {
    enumerable: true,
    get: function() {
        return onKeyDownList;
    }
});
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _queries = require("../../internal/queries");
const _moveListItems = require("./transforms/moveListItems");
const _toggleList = require("./transforms/toggleList");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const onKeyDownList = (editor, { type, options: { hotkey } })=>(e)=>{
        if (e.key === 'Tab' && editor.selection) {
            const listSelected = (0, _queries.getAboveNode)(editor, {
                at: editor.selection,
                match: {
                    type
                }
            });
            if (listSelected) {
                e.preventDefault();
                (0, _moveListItems.moveListItems)(editor, {
                    increase: !e.shiftKey
                });
                return;
            }
        }
        if (!hotkey) return;
        const hotkeys = Array.isArray(hotkey) ? hotkey : [
            hotkey
        ];
        for (const _hotkey of hotkeys){
            if ((0, _ishotkey.default)(_hotkey)(e)) {
                (0, _toggleList.toggleList)(editor, {
                    type
                });
            }
        }
    };
