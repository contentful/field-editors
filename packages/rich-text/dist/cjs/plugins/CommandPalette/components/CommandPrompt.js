"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CommandPrompt", {
    enumerable: true,
    get: function() {
        return CommandPrompt;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _emotion = require("emotion");
const _trimLeadingSlash = require("../utils/trimLeadingSlash");
const _CommandList = require("./CommandList");
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
const styles = {
    commandPrompt: (0, _emotion.css)({
        color: _f36tokens.default.blue400
    })
};
const CommandPrompt = (props)=>{
    const query = _react.useMemo(()=>(0, _trimLeadingSlash.trimLeadingSlash)(props.text.text), [
        props.text.text
    ]);
    const editor = props.editor;
    const [textElement, setTextElement] = _react.useState();
    return /*#__PURE__*/ _react.createElement("span", {
        className: styles.commandPrompt,
        ref: (e)=>{
            setTextElement(e);
        },
        ...props.attributes
    }, props.children, /*#__PURE__*/ _react.createElement(_CommandList.CommandList, {
        query: query,
        editor: editor,
        textContainer: textElement
    }));
};
