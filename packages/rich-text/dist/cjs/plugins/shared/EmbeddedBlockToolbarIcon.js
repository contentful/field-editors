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
    EmbeddedBlockToolbarIcon: function() {
        return EmbeddedBlockToolbarIcon;
    },
    styles: function() {
        return styles;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _richtexttypes = require("@contentful/rich-text-types");
const _emotion = require("emotion");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _SdkProvider = require("../../SdkProvider");
const _EmbeddedBlockUtil = require("../shared/EmbeddedBlockUtil");
const _ResourceNewBadge = require("./ResourceNewBadge");
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
    icon: (0, _emotion.css)({
        marginRight: '10px'
    })
};
function EmbeddedBlockToolbarIcon({ isDisabled, nodeType, onClose }) {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    const handleClick = async (event)=>{
        event.preventDefault();
        if (!editor) {
            return;
        }
        onClose();
        if (nodeType == _richtexttypes.BLOCKS.EMBEDDED_RESOURCE) {
            await (0, _EmbeddedBlockUtil.selectResourceEntityAndInsert)(sdk, editor, editor.tracking.onToolbarAction);
        } else {
            await (0, _EmbeddedBlockUtil.selectEntityAndInsert)(nodeType, sdk, editor, editor.tracking.onToolbarAction);
        }
    };
    const type = getEntityTypeFromNodeType(nodeType);
    const baseClass = `rich-text__${nodeType}`;
    return /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        disabled: isDisabled,
        className: `${baseClass}-list-item`,
        onClick: handleClick,
        testId: `toolbar-toggle-${nodeType}`
    }, /*#__PURE__*/ _react.createElement(_f36components.Flex, {
        alignItems: "center",
        flexDirection: "row"
    }, /*#__PURE__*/ _react.createElement(_f36components.Icon, {
        as: type === 'Asset' ? _f36icons.ImageSquareIcon : _f36icons.EmbeddedBlockIcon,
        className: `rich-text__embedded-entry-list-icon ${styles.icon}`,
        color: _f36tokens.default.gray900
    }), /*#__PURE__*/ _react.createElement("span", null, type, nodeType == _richtexttypes.BLOCKS.EMBEDDED_RESOURCE && /*#__PURE__*/ _react.createElement(_ResourceNewBadge.ResourceNewBadge, null))));
}
function getEntityTypeFromNodeType(nodeType) {
    const words = nodeType.toLowerCase().split('-');
    if (words.includes('entry') || words.includes('resource')) {
        return 'Entry';
    }
    if (words.includes('asset')) {
        return 'Asset';
    }
    throw new Error(`Node type \`${nodeType}\` has no associated \`entityType\``);
}
