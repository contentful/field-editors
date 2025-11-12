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
    Italic: function() {
        return Italic;
    },
    ToolbarItalicButton: function() {
        return ToolbarItalicButton;
    },
    createItalicPlugin: function() {
        return createItalicPlugin;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36icons = require("@contentful/f36-icons");
const _richtexttypes = require("@contentful/rich-text-types");
const _platebasicmarks = require("@udecode/plate-basic-marks");
const _emotion = require("emotion");
const _queries = require("../../internal/queries");
const _MarkToolbarButton = require("./components/MarkToolbarButton");
const _helpers = require("./helpers");
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
const ToolbarItalicButton = (0, _MarkToolbarButton.createMarkToolbarButton)({
    title: 'Italic',
    mark: _richtexttypes.MARKS.ITALIC,
    icon: /*#__PURE__*/ _react.createElement(_f36icons.TextItalicIcon, null)
});
const styles = {
    italic: (0, _emotion.css)({
        fontStyle: 'italic'
    })
};
function Italic(props) {
    return /*#__PURE__*/ _react.createElement("em", {
        ...props.attributes,
        className: styles.italic
    }, props.children);
}
const createItalicPlugin = ()=>(0, _platebasicmarks.createItalicPlugin)({
        type: _richtexttypes.MARKS.ITALIC,
        component: Italic,
        options: {
            hotkey: [
                'mod+i'
            ]
        },
        handlers: {
            onKeyDown: (0, _helpers.buildMarkEventHandler)(_richtexttypes.MARKS.ITALIC)
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'I',
                        'EM'
                    ]
                },
                {
                    validStyle: {
                        fontStyle: 'italic'
                    }
                }
            ],
            query: (el)=>{
                return !(0, _queries.someHtmlElement)(el, (node)=>node.style.fontStyle === 'normal');
            }
        }
    });
