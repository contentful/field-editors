"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncEditorChanges", {
    enumerable: true,
    get: function() {
        return SyncEditorChanges;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _platecommon = require("@udecode/plate-common");
const _fastdeepequal = /*#__PURE__*/ _interop_require_default(require("fast-deep-equal"));
const _callbacks = require("./helpers/callbacks");
const _hooks = require("./internal/hooks");
const _transforms = require("./internal/transforms");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
const useAcceptIncomingChanges = (incomingValue)=>{
    const editor = (0, _hooks.usePlateSelectors)().editor();
    const lastIncomingValue = _react.useRef(incomingValue);
    _react.useEffect(()=>{
        if ((0, _fastdeepequal.default)(lastIncomingValue.current, incomingValue)) {
            return;
        }
        lastIncomingValue.current = incomingValue;
        (0, _transforms.setEditorValue)(editor, incomingValue);
    }, [
        editor,
        incomingValue
    ]);
};
const useOnValueChanged = (onChange)=>{
    const editor = (0, _hooks.usePlateSelectors)().editor();
    const setEditorOnChange = (0, _platecommon.usePlateActions)().onChange();
    _react.useEffect(()=>{
        const cb = (0, _callbacks.createOnChangeCallback)(onChange);
        setEditorOnChange((document)=>{
            const operations = editor?.operations.filter((op)=>{
                return op.type !== 'set_selection';
            });
            if (operations.length === 0) {
                return;
            }
            cb(document);
        });
    }, [
        editor,
        onChange,
        setEditorOnChange
    ]);
};
const SyncEditorChanges = ({ incomingValue, onChange })=>{
    useAcceptIncomingChanges(incomingValue);
    useOnValueChanged(onChange);
    return null;
};
