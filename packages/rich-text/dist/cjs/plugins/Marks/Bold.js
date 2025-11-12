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
    Bold: function() {
        return Bold;
    },
    ToolbarBoldButton: function() {
        return ToolbarBoldButton;
    },
    createBoldPlugin: function() {
        return createBoldPlugin;
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
const ToolbarBoldButton = (0, _MarkToolbarButton.createMarkToolbarButton)({
    title: 'Bold',
    mark: _richtexttypes.MARKS.BOLD,
    icon: /*#__PURE__*/ _react.createElement(_f36icons.TextBIcon, null)
});
const styles = {
    bold: (0, _emotion.css)({
        fontWeight: 600
    })
};
function Bold(props) {
    return /*#__PURE__*/ _react.createElement("strong", {
        ...props.attributes,
        className: styles.bold
    }, props.children);
}
const isGoogleBoldWrapper = (el)=>el.id.startsWith('docs-internal-guid') && el.nodeName === 'B';
const createBoldPlugin = ()=>(0, _platebasicmarks.createBoldPlugin)({
        type: _richtexttypes.MARKS.BOLD,
        component: Bold,
        options: {
            hotkey: [
                'mod+b'
            ]
        },
        handlers: {
            onKeyDown: (0, _helpers.buildMarkEventHandler)(_richtexttypes.MARKS.BOLD)
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'STRONG',
                        'B'
                    ]
                },
                {
                    validStyle: {
                        fontWeight: [
                            '600',
                            '700',
                            'bold'
                        ]
                    }
                }
            ],
            query: (el)=>{
                return !isGoogleBoldWrapper(el) && !(0, _queries.someHtmlElement)(el, (node)=>node.style.fontWeight === 'normal');
            }
        }
    });
