"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createHyperlinkPlugin", {
    enumerable: true,
    get: function() {
        return createHyperlinkPlugin;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _richtexttypes = require("@contentful/rich-text-types");
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _editor = require("../../helpers/editor");
const _transformers = require("../../helpers/transformers");
const _EntityHyperlink = require("./components/EntityHyperlink");
const _ResourceHyperlink = require("./components/ResourceHyperlink");
const _UrlHyperlink = require("./components/UrlHyperlink");
const _HyperlinkModal = require("./HyperlinkModal");
const _utils = require("./utils");
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
const isAnchor = (element)=>element.nodeName === 'A' && !!element.getAttribute('href') && element.getAttribute('href') !== '#';
const isEntryAnchor = (element)=>element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Entry';
const isAssetAnchor = (element)=>element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Asset';
const isResourceAnchor = (element)=>element.nodeName === 'A' && element.getAttribute('data-resource-link-type') === 'Contentful:Entry';
const buildHyperlinkEventHandler = (sdk)=>(editor, { options: { hotkey } })=>{
        return (event)=>{
            if (!editor.selection) {
                return;
            }
            if (hotkey && !(0, _ishotkey.default)(hotkey, event)) {
                return;
            }
            if ((0, _editor.isLinkActive)(editor)) {
                (0, _editor.unwrapLink)(editor);
                editor.tracking.onShortcutAction('unlinkHyperlinks');
            } else {
                (0, _HyperlinkModal.addOrEditLink)(editor, sdk, editor.tracking.onShortcutAction);
            }
        };
    };
const getNodeOfType = (type)=>(el, node)=>({
            type,
            children: node.children,
            data: type === _richtexttypes.INLINES.HYPERLINK ? {
                uri: el.getAttribute('href')
            } : type === _richtexttypes.INLINES.RESOURCE_HYPERLINK ? {
                target: {
                    sys: {
                        urn: el.getAttribute('data-resource-link-urn'),
                        linkType: el.getAttribute('data-resource-link-type'),
                        type: 'ResourceLink'
                    }
                }
            } : {
                target: {
                    sys: {
                        id: el.getAttribute('data-link-id'),
                        linkType: el.getAttribute('data-link-type'),
                        type: 'Link'
                    }
                }
            }
        });
const createHyperlinkPlugin = (sdk)=>{
    const common = {
        isElement: true,
        isInline: true
    };
    return {
        key: 'HyperlinkPlugin',
        options: {
            hotkey: 'mod+k'
        },
        handlers: {
            onKeyDown: buildHyperlinkEventHandler(sdk)
        },
        plugins: [
            {
                ...common,
                key: _richtexttypes.INLINES.HYPERLINK,
                type: _richtexttypes.INLINES.HYPERLINK,
                component: _UrlHyperlink.UrlHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isAnchor(el) && !(isEntryAnchor(el) || isAssetAnchor(el)),
                    getNode: getNodeOfType(_richtexttypes.INLINES.HYPERLINK)
                }
            },
            {
                ...common,
                key: _richtexttypes.INLINES.ENTRY_HYPERLINK,
                type: _richtexttypes.INLINES.ENTRY_HYPERLINK,
                component: _EntityHyperlink.EntityHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isEntryAnchor(el),
                    getNode: getNodeOfType(_richtexttypes.INLINES.ENTRY_HYPERLINK)
                }
            },
            {
                ...common,
                key: _richtexttypes.INLINES.RESOURCE_HYPERLINK,
                type: _richtexttypes.INLINES.RESOURCE_HYPERLINK,
                component: _ResourceHyperlink.ResourceHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isResourceAnchor(el),
                    getNode: getNodeOfType(_richtexttypes.INLINES.RESOURCE_HYPERLINK)
                }
            },
            {
                ...common,
                key: _richtexttypes.INLINES.ASSET_HYPERLINK,
                type: _richtexttypes.INLINES.ASSET_HYPERLINK,
                component: _EntityHyperlink.EntityHyperlink,
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: [
                                'A'
                            ]
                        }
                    ],
                    query: (el)=>isAssetAnchor(el),
                    getNode: getNodeOfType(_richtexttypes.INLINES.ASSET_HYPERLINK)
                }
            }
        ],
        normalizer: [
            {
                match: {
                    type: [
                        _richtexttypes.INLINES.HYPERLINK,
                        _richtexttypes.INLINES.ASSET_HYPERLINK,
                        _richtexttypes.INLINES.ENTRY_HYPERLINK,
                        _richtexttypes.INLINES.RESOURCE_HYPERLINK
                    ]
                },
                validNode: _utils.hasText,
                transform: _transformers.transformRemove
            }
        ]
    };
};
