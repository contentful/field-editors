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
    ToolbarUnderlineButton: function() {
        return ToolbarUnderlineButton;
    },
    Underline: function() {
        return Underline;
    },
    createUnderlinePlugin: function() {
        return createUnderlinePlugin;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36icons = require("@contentful/f36-icons");
const _richtexttypes = require("@contentful/rich-text-types");
const _platebasicmarks = require("@udecode/plate-basic-marks");
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
const ToolbarUnderlineButton = (0, _MarkToolbarButton.createMarkToolbarButton)({
    title: 'Underline',
    mark: _richtexttypes.MARKS.UNDERLINE,
    icon: /*#__PURE__*/ _react.createElement(_f36icons.TextUnderlineIcon, null)
});
function Underline(props) {
    return /*#__PURE__*/ _react.createElement("u", props.attributes, props.children);
}
const createUnderlinePlugin = ()=>(0, _platebasicmarks.createUnderlinePlugin)({
        type: _richtexttypes.MARKS.UNDERLINE,
        component: Underline,
        options: {
            hotkey: [
                'mod+u'
            ]
        },
        handlers: {
            onKeyDown: (0, _helpers.buildMarkEventHandler)(_richtexttypes.MARKS.UNDERLINE)
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'U'
                    ]
                },
                {
                    validStyle: {
                        textDecoration: [
                            'underline'
                        ]
                    }
                }
            ],
            query: (el)=>{
                return !(0, _queries.someHtmlElement)(el, (node)=>node.style.textDecoration === 'none');
            }
        }
    });
