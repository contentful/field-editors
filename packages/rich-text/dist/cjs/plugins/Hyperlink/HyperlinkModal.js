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
    HyperlinkModal: function() {
        return HyperlinkModal;
    },
    addOrEditLink: function() {
        return addOrEditLink;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _fieldeditorshared = require("@contentful/field-editor-shared");
const _richtexttypes = require("@contentful/rich-text-types");
const _emotion = require("emotion");
const _editor = require("../../helpers/editor");
const _getAllowedResourcesForNodeType = /*#__PURE__*/ _interop_require_default(require("../../helpers/getAllowedResourcesForNodeType"));
const _getLinkedContentTypeIdsForNodeType = /*#__PURE__*/ _interop_require_default(require("../../helpers/getLinkedContentTypeIdsForNodeType"));
const _validations = require("../../helpers/validations");
const _internal = require("../../internal");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const _FetchingWrappedAssetCard = require("../shared/FetchingWrappedAssetCard");
const _FetchingWrappedEntryCard = require("../shared/FetchingWrappedEntryCard");
const _FetchingWrappedResourceCard = require("../shared/FetchingWrappedResourceCard");
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
    removeSelectionLabel: (0, _emotion.css)`
    margin-left: ${_f36tokens.default.spacingS};
    margin-bottom: ${_f36tokens.default.spacingXs}; // to match FormLabel margin
  `
};
const SYS_LINK_TYPES = {
    [_richtexttypes.INLINES.ENTRY_HYPERLINK]: 'Entry',
    [_richtexttypes.INLINES.ASSET_HYPERLINK]: 'Asset',
    [_richtexttypes.INLINES.RESOURCE_HYPERLINK]: 'Contentful:Entry'
};
const LINK_TYPE_SELECTION_VALUES = {
    [_richtexttypes.INLINES.HYPERLINK]: 'URL',
    [_richtexttypes.INLINES.ENTRY_HYPERLINK]: 'Entry',
    [_richtexttypes.INLINES.RESOURCE_HYPERLINK]: 'Entry (different space)',
    [_richtexttypes.INLINES.ASSET_HYPERLINK]: 'Asset'
};
function HyperlinkModal(props) {
    const enabledLinkTypes = _editor.LINK_TYPES.filter((nodeType)=>(0, _validations.isNodeTypeEnabled)(props.sdk.field, nodeType));
    const [defaultLinkType] = enabledLinkTypes;
    const [linkText, setLinkText] = _react.useState(props.linkText ?? '');
    const [linkType, setLinkType] = _react.useState(props.linkType ?? defaultLinkType);
    const [linkTarget, setLinkTarget] = _react.useState(props.linkTarget ?? '');
    const [linkEntity, setLinkEntity] = _react.useState(props.linkEntity ?? null);
    const linkTargetInputRef = _react.useRef(null);
    _react.useEffect(()=>{
        if (linkType === _richtexttypes.INLINES.HYPERLINK && linkTargetInputRef.current) {
            linkTargetInputRef.current.focus();
        }
    }, [
        linkType
    ]);
    function isLinkComplete() {
        const isRegularLink = linkType === _richtexttypes.INLINES.HYPERLINK;
        if (isRegularLink) {
            return !!(linkText && linkTarget);
        }
        const entityLinks = Object.keys(SYS_LINK_TYPES);
        const isEntityLink = entityLinks.includes(linkType);
        if (isEntityLink) {
            if (linkType === _richtexttypes.INLINES.ENTRY_HYPERLINK) {
                return !!(linkText && isEntryLink(linkEntity));
            }
            if (linkType === _richtexttypes.INLINES.ASSET_HYPERLINK) {
                return !!(linkText && isAssetLink(linkEntity));
            }
            if (linkType === _richtexttypes.INLINES.RESOURCE_HYPERLINK) {
                return !!(linkText && isResourceLink(linkEntity));
            }
            return false;
        }
        return false;
    }
    function handleOnSubmit(event) {
        event.preventDefault();
        props.onClose({
            linkText,
            linkType,
            linkTarget,
            linkEntity
        });
    }
    function entityToLink(entity) {
        const { id, type } = entity.sys;
        return {
            sys: {
                id,
                type: 'Link',
                linkType: type
            }
        };
    }
    function isResourceLink(link) {
        return !!link && !!link.sys.urn;
    }
    function isEntryLink(link) {
        return !!link && link.sys.type === 'Link' && link.sys.linkType === 'Entry';
    }
    function isAssetLink(link) {
        return !!link && link.sys.type === 'Link' && link.sys.linkType === 'Asset';
    }
    async function selectEntry() {
        const options = {
            locale: props.sdk.field.locale,
            contentTypes: (0, _getLinkedContentTypeIdsForNodeType.default)(props.sdk.field, _richtexttypes.INLINES.ENTRY_HYPERLINK),
            recommendations: {
                searchQuery: props.linkText
            }
        };
        const entry = await props.sdk.dialogs.selectSingleEntry(options);
        if (entry) {
            setLinkTarget('');
            setLinkEntity(entityToLink(entry));
        }
    }
    async function selectResourceEntry() {
        const options = {
            allowedResources: (0, _getAllowedResourcesForNodeType.default)(props.sdk.field, _richtexttypes.INLINES.RESOURCE_HYPERLINK),
            locale: props.sdk.field.locale
        };
        const entityLink = await props.sdk.dialogs.selectSingleResourceEntity(options);
        if (entityLink) {
            setLinkTarget('');
            setLinkEntity(entityLink);
        }
    }
    async function selectAsset() {
        const options = {
            locale: props.sdk.field.locale
        };
        const asset = await props.sdk.dialogs.selectSingleAsset(options);
        if (asset) {
            setLinkTarget('');
            setLinkEntity(entityToLink(asset));
        }
    }
    function resetLinkEntity(event) {
        event.preventDefault();
        setLinkEntity(null);
    }
    return /*#__PURE__*/ _react.createElement(_fieldeditorreference.EntityProvider, {
        sdk: props.sdk
    }, /*#__PURE__*/ _react.createElement(_react.Fragment, null, /*#__PURE__*/ _react.createElement(_f36components.ModalContent, null, /*#__PURE__*/ _react.createElement(_f36components.Form, null, !props.linkType && /*#__PURE__*/ _react.createElement(_f36components.FormControl, {
        id: "link-text",
        isRequired: true
    }, /*#__PURE__*/ _react.createElement(_f36components.FormControl.Label, null, "Link text"), /*#__PURE__*/ _react.createElement(_f36components.TextInput, {
        testId: "link-text-input",
        name: "link-text",
        value: linkText,
        onChange: (event)=>setLinkText(event.target.value)
    })), enabledLinkTypes.length > 1 && /*#__PURE__*/ _react.createElement(_f36components.FormControl, {
        id: "link-type"
    }, /*#__PURE__*/ _react.createElement(_f36components.FormControl.Label, null, "Link type"), /*#__PURE__*/ _react.createElement(_f36components.Select, {
        value: linkType,
        onChange: (event)=>setLinkType(event.target.value),
        testId: "link-type-input",
        isDisabled: props.readonly
    }, enabledLinkTypes.map((nodeType)=>/*#__PURE__*/ _react.createElement(_f36components.Select.Option, {
            key: nodeType,
            value: nodeType
        }, LINK_TYPE_SELECTION_VALUES[nodeType])))), linkType === _richtexttypes.INLINES.HYPERLINK && /*#__PURE__*/ _react.createElement(_f36components.FormControl, {
        id: "linkTarget",
        isRequired: true
    }, /*#__PURE__*/ _react.createElement(_f36components.FormControl.Label, null, "Link target"), /*#__PURE__*/ _react.createElement(_f36components.TextInput, {
        ref: linkTargetInputRef,
        name: "linkTarget",
        value: linkTarget,
        onChange: (event)=>{
            setLinkEntity(null);
            setLinkTarget(event.target.value);
        },
        testId: "link-target-input",
        isDisabled: props.readonly
    }), /*#__PURE__*/ _react.createElement(_f36components.FormControl.HelpText, null, "A protocol may be required, e.g. https://")), linkType !== _richtexttypes.INLINES.HYPERLINK && /*#__PURE__*/ _react.createElement("div", null, /*#__PURE__*/ _react.createElement(_f36components.FormLabel, {
        isRequired: true,
        htmlFor: ""
    }, "Link target", ' '), linkEntity && linkEntity.sys.linkType === SYS_LINK_TYPES[linkType] ? /*#__PURE__*/ _react.createElement(_react.Fragment, null, !props.readonly && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
        testId: "entity-selection-link",
        onClick: resetLinkEntity,
        className: styles.removeSelectionLabel
    }, "Remove selection"), /*#__PURE__*/ _react.createElement("div", null, linkType === _richtexttypes.INLINES.ENTRY_HYPERLINK && isEntryLink(linkEntity) && /*#__PURE__*/ _react.createElement(_FetchingWrappedEntryCard.FetchingWrappedEntryCard, {
        sdk: props.sdk,
        locale: props.sdk.field.locale,
        entryId: linkEntity.sys.id,
        isDisabled: true,
        isSelected: false
    }), linkType === _richtexttypes.INLINES.RESOURCE_HYPERLINK && isResourceLink(linkEntity) && /*#__PURE__*/ _react.createElement(_FetchingWrappedResourceCard.FetchingWrappedResourceCard, {
        sdk: props.sdk,
        link: linkEntity.sys,
        isDisabled: true,
        isSelected: false
    }), linkType === _richtexttypes.INLINES.ASSET_HYPERLINK && isAssetLink(linkEntity) && /*#__PURE__*/ _react.createElement(_FetchingWrappedAssetCard.FetchingWrappedAssetCard, {
        sdk: props.sdk,
        locale: props.sdk.field.locale,
        assetId: linkEntity.sys.id,
        isDisabled: true,
        isSelected: false
    }))) : /*#__PURE__*/ _react.createElement("div", null, linkType === _richtexttypes.INLINES.ENTRY_HYPERLINK && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
        testId: "entity-selection-link",
        onClick: selectEntry
    }, "Select entry"), linkType === _richtexttypes.INLINES.RESOURCE_HYPERLINK && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
        testId: "entity-selection-link",
        onClick: selectResourceEntry
    }, "Select entry"), linkType === _richtexttypes.INLINES.ASSET_HYPERLINK && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
        testId: "entity-selection-link",
        onClick: selectAsset
    }, "Select asset"))))), /*#__PURE__*/ _react.createElement(_f36components.ModalControls, null, /*#__PURE__*/ _react.createElement(_f36components.Button, {
        type: "button",
        onClick: ()=>props.onClose(null),
        variant: "secondary",
        testId: "cancel-cta",
        size: "small"
    }, "Cancel"), /*#__PURE__*/ _react.createElement(_f36components.Button, {
        type: "submit",
        variant: "positive",
        size: "small",
        isDisabled: props.readonly || !isLinkComplete(),
        onClick: handleOnSubmit,
        testId: "confirm-cta"
    }, props.linkType ? 'Update' : 'Insert'))));
}
async function addOrEditLink(editor, sdk, logAction, targetPath) {
    const isReadOnly = (0, _queries.isEditorReadOnly)(editor);
    const selectionBeforeBlur = editor.selection ? {
        ...editor.selection
    } : undefined;
    if (!targetPath && !selectionBeforeBlur) return;
    let linkType;
    let linkText;
    let linkTarget;
    let linkEntity;
    const [node, path] = (0, _editor.getNodeEntryFromSelection)(editor, _editor.LINK_TYPES, targetPath);
    if (node && path) {
        linkType = node.type;
        linkText = (0, _queries.getText)(editor, path);
        linkTarget = node.data.uri || '';
        linkEntity = node.data.target;
    }
    const selectionAfterFocus = targetPath ?? selectionBeforeBlur;
    const currentLinkText = linkText || (editor.selection ? (0, _queries.getText)(editor, editor.selection) : '');
    const isEditing = Boolean(node && path);
    logAction(isEditing ? 'openEditHyperlinkDialog' : 'openCreateHyperlinkDialog');
    const data = await _fieldeditorshared.ModalDialogLauncher.openDialog({
        title: isEditing ? 'Edit hyperlink' : 'Insert hyperlink',
        width: 'large',
        shouldCloseOnEscapePress: true,
        shouldCloseOnOverlayClick: true,
        allowHeightOverflow: true
    }, ({ onClose })=>{
        return /*#__PURE__*/ _react.createElement(HyperlinkModal, {
            linkTarget: linkTarget,
            linkText: currentLinkText,
            linkType: linkType,
            linkEntity: linkEntity,
            onClose: onClose,
            sdk: sdk,
            readonly: isReadOnly
        });
    });
    (0, _transforms.select)(editor, selectionAfterFocus);
    if (!data) {
        (0, _editor.focus)(editor);
        logAction(isEditing ? 'cancelEditHyperlinkDialog' : 'cancelCreateHyperlinkDialog');
        return;
    }
    const { linkText: text, linkTarget: url, linkType: type, linkEntity: target } = data;
    (0, _internal.withoutNormalizing)(editor, ()=>{
        (0, _editor.insertLink)(editor, {
            text,
            url,
            type,
            target,
            path
        });
    });
    logAction(isEditing ? 'edit' : 'insert', {
        nodeType: type,
        linkType: target?.sys.linkType ?? 'uri'
    });
    (0, _editor.focus)(editor);
}
