"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withCharCounter", {
    enumerable: true,
    get: function() {
        return withCharCounter;
    }
});
const _pdebounce = /*#__PURE__*/ _interop_require_default(require("p-debounce"));
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const CHARACTER_COUNT_DEBOUNCE_TIME = 300;
const withCharCounter = (editor)=>{
    const { apply } = editor;
    let count;
    editor.getCharacterCount = ()=>{
        if (count === undefined) {
            count = (0, _utils.getTextContent)(editor).length;
        }
        return count;
    };
    const recount = (0, _pdebounce.default)(async ()=>{
        count = (0, _utils.getTextContent)(editor).length;
    }, CHARACTER_COUNT_DEBOUNCE_TIME);
    editor.apply = (op)=>{
        apply(op);
        recount();
    };
    return editor;
};
