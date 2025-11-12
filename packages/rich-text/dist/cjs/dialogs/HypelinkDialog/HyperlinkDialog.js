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
    HyperlinkDialog: function() {
        return HyperlinkDialog;
    },
    LINK_TYPES: function() {
        return LINK_TYPES;
    },
    openHyperlinkDialog: function() {
        return openHyperlinkDialog;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _core = require("@lingui/core");
const _emotion = require("emotion");
const _proptypes = /*#__PURE__*/ _interop_require_default(require("prop-types"));
const _FetchingWrappedAssetCard = require("../../plugins/shared/FetchingWrappedAssetCard");
const _FetchingWrappedEntryCard = require("../../plugins/shared/FetchingWrappedEntryCard");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
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
const LINK_TYPES = {
    URI: 'uri',
    ENTRY: 'Entry',
    ASSET: 'Asset'
};
function isFeaturingEntitySelector(entitySelectorConfigs = {}) {
    return !!entitySelectorConfigs.Entry || !!entitySelectorConfigs.Asset;
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
var _React_Component;
class HyperlinkDialog extends (_React_Component = _react.Component) {
    setTargetEntity(type, entity) {
        this.setState((state)=>({
                entityLinks: {
                    ...state.entityLinks,
                    [type]: entity ? entityToLink(entity) : undefined
                }
            }));
    }
    getValue() {
        const { text, type, uri } = this.state;
        const value = {
            type
        };
        if (text) {
            value.text = text;
        }
        if (type === LINK_TYPES.URI) {
            value.uri = uri;
        } else {
            value.target = this.state.entityLinks[type];
        }
        return value;
    }
    isLinkComplete() {
        const { text, type, uri, target } = this.getValue();
        const requiresText = !this.props.hideText;
        if (requiresText && !text) {
            return false;
        }
        return type === LINK_TYPES.URI && uri || target;
    }
    render() {
        const labels = this.props.labels || {
            title: _core.i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.DefaultTitle",
                message: "Insert link"
            }),
            confirm: _core.i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.DefaultConfirm",
                message: "Insert link"
            })
        };
        return /*#__PURE__*/ _react.createElement(_fieldeditorreference.EntityProvider, {
            sdk: this.props.sdk
        }, /*#__PURE__*/ _react.createElement(_react.Fragment, null, /*#__PURE__*/ _react.createElement(_f36components.ModalContent, null, this.renderFields()), /*#__PURE__*/ _react.createElement(_f36components.ModalControls, null, /*#__PURE__*/ _react.createElement(_f36components.Button, {
            type: "button",
            onClick: ()=>this.props.onClose(null),
            variant: "secondary",
            testId: "cancel-cta",
            size: "small"
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.Cancel",
            message: "Cancel"
        })), /*#__PURE__*/ _react.createElement(_f36components.Button, {
            type: "submit",
            variant: "positive",
            onClick: this.handleSubmit,
            isDisabled: !this.isLinkComplete(),
            testId: "confirm-cta",
            size: "small"
        }, labels.confirm))));
    }
    renderFields() {
        const { hideText, allowedHyperlinkTypes, entitySelectorConfigs } = this.props;
        const { uri, text, type } = this.state;
        const isUriInputAutoFocused = type === LINK_TYPES.URI && (hideText || !!text);
        return /*#__PURE__*/ _react.createElement(_f36components.Form, null, hideText ? null : /*#__PURE__*/ _react.createElement(_f36components.FormControl, {
            id: "link-text",
            isRequired: true
        }, /*#__PURE__*/ _react.createElement(_f36components.FormControl.Label, null, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkText",
            message: "Link text"
        })), /*#__PURE__*/ _react.createElement(_f36components.TextInput, {
            testId: "link-text-input",
            name: "link-text",
            value: text || '',
            onChange: (e)=>this.setState({
                    text: e.target.value
                }),
            autoFocus: !isUriInputAutoFocused
        })), isFeaturingEntitySelector(entitySelectorConfigs) && /*#__PURE__*/ _react.createElement(_f36components.FormControl, {
            id: "link-type",
            name: "link-type"
        }, /*#__PURE__*/ _react.createElement(_f36components.FormControl.Label, null, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkType",
            message: "Link type"
        })), /*#__PURE__*/ _react.createElement(_f36components.Select, {
            value: type,
            onChange: (e)=>this.setState({
                    type: e.target.value
                }),
            testId: "link-type-select"
        }, allowedHyperlinkTypes.includes(LINK_TYPES.URI) || type === LINK_TYPES.URI ? /*#__PURE__*/ _react.createElement(_f36components.Select.Option, {
            value: LINK_TYPES.URI
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.URL",
            message: "URL"
        })) : null, allowedHyperlinkTypes.includes(LINK_TYPES.ENTRY) || type === LINK_TYPES.ENTRY ? /*#__PURE__*/ _react.createElement(_f36components.Select.Option, {
            value: LINK_TYPES.ENTRY
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.Entry",
            message: "Entry"
        })) : null, allowedHyperlinkTypes.includes(LINK_TYPES.ASSET) || type === LINK_TYPES.ASSET ? /*#__PURE__*/ _react.createElement(_f36components.Select.Option, {
            value: LINK_TYPES.ASSET
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.Asset",
            message: "Asset"
        })) : null)), type === LINK_TYPES.URI ? /*#__PURE__*/ _react.createElement(_f36components.FormControl, {
            id: "link-uri",
            isRequired: true
        }, /*#__PURE__*/ _react.createElement(_f36components.FormControl.Label, null, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkTarget",
            message: "Link target"
        })), /*#__PURE__*/ _react.createElement(_f36components.TextInput, {
            testId: "link-target-input",
            name: "link-uri",
            value: uri || '',
            placeholder: "https://",
            onChange: (e)=>this.setState({
                    uri: e.target.value
                }),
            autoFocus: isUriInputAutoFocused
        }), /*#__PURE__*/ _react.createElement(_f36components.FormControl.HelpText, null, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.ProtocolHelpText",
            message: "A protocol may be required, e.g. https://"
        }))) : this.renderEntityField());
    }
    renderEntityField() {
        const { type, entityLinks } = this.state;
        const resetEntity = ()=>this.setTargetEntity(type, null);
        const entityLink = entityLinks[type];
        const isEntitySelectorVisible = !entityLink;
        return /*#__PURE__*/ _react.createElement("div", null, /*#__PURE__*/ _react.createElement(_f36components.FormLabel, {
            required: true,
            htmlFor: ""
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkTarget",
            message: "Link target"
        })), !isEntitySelectorVisible && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
            as: "button",
            className: (0, _emotion.css)({
                marginLeft: _f36tokens.default.spacingS
            }),
            onClick: resetEntity
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.RemoveSelection",
            message: "Remove selection"
        })), entityLink && /*#__PURE__*/ _react.createElement("div", null, type === LINK_TYPES.ENTRY && /*#__PURE__*/ _react.createElement(_FetchingWrappedEntryCard.FetchingWrappedEntryCard, {
            sdk: this.props.sdk,
            locale: this.props.entitySelectorConfigs.Entry.locale,
            entryId: entityLink.sys.id,
            isDisabled: true,
            isSelected: false
        }), type == LINK_TYPES.ASSET && /*#__PURE__*/ _react.createElement(_FetchingWrappedAssetCard.FetchingWrappedAssetCard, {
            sdk: this.props.sdk,
            locale: this.props.entitySelectorConfigs.Asset.locale,
            assetId: entityLink.sys.id,
            isDisabled: true,
            isSelected: false
        })), isEntitySelectorVisible && this.renderEntitySelector(type, isEntitySelectorVisible));
    }
    renderEntitySelector(type) {
        return /*#__PURE__*/ _react.createElement("div", {
            className: (0, _emotion.css)({
                marginTop: _f36tokens.default.spacingS
            })
        }, type === LINK_TYPES.ENTRY && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
            as: "button",
            onClick: this.selectEntry
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.SelectEntry",
            message: "Select entry"
        })), type === LINK_TYPES.ASSET && /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
            as: "button",
            onClick: this.selectAsset
        }, _core.i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.SelectAsset",
            message: "Select asset"
        })));
    }
    constructor(props){
        super(props), _define_property(this, "handleSubmit", (event)=>{
            event.preventDefault();
            this.props.onClose(this.getValue());
        }), _define_property(this, "selectEntry", async ()=>{
            const { locale, contentTypes } = this.props.entitySelectorConfigs.Entry;
            const entry = await this.props.sdk.dialogs.selectSingleEntry({
                locale,
                contentTypes
            });
            this.setTargetEntity(LINK_TYPES.ENTRY, entry);
        }), _define_property(this, "selectAsset", async ()=>{
            const { locale } = this.props.entitySelectorConfigs.Asset;
            const asset = await this.props.sdk.dialogs.selectSingleAsset({
                locale
            });
            this.setTargetEntity(LINK_TYPES.ASSET, asset);
        });
        const { text, type, uri, target } = props.value;
        const isEntityLink = Boolean(target);
        const entityLinks = {
            [LINK_TYPES.ENTRY]: null,
            [LINK_TYPES.ASSET]: null
        };
        let linkType = type;
        if (isEntityLink) {
            linkType = target.sys.linkType;
            entityLinks[linkType] = target;
        } else if (props.allowedHyperlinkTypes.includes(LINK_TYPES.URI)) {
            linkType = LINK_TYPES.URI;
        } else {
            linkType = props.allowedHyperlinkTypes[0];
        }
        this.state = {
            text,
            uri,
            entityLinks,
            type: linkType
        };
    }
}
_define_property(HyperlinkDialog, "propTypes", {
    sdk: _proptypes.default.object.isRequired,
    labels: _proptypes.default.shape({
        title: _proptypes.default.string,
        confirm: _proptypes.default.string
    }),
    value: _proptypes.default.shape({
        text: _proptypes.default.string,
        uri: _proptypes.default.string,
        target: _proptypes.default.object,
        type: _proptypes.default.oneOf([
            'uri',
            'Entry',
            'Asset'
        ])
    }),
    entitySelectorConfigs: _proptypes.default.object,
    allowedHyperlinkTypes: _proptypes.default.arrayOf(_proptypes.default.oneOf([
        LINK_TYPES.ENTRY,
        LINK_TYPES.ASSET,
        LINK_TYPES.URI
    ])),
    hideText: _proptypes.default.bool,
    onClose: _proptypes.default.func.isRequired
});
_define_property(HyperlinkDialog, "defaultProps", {
    value: {},
    hideText: false,
    entitySelectorConfigs: {},
    allowedHyperlinkTypes: [
        LINK_TYPES.ENTRY,
        LINK_TYPES.ASSET,
        LINK_TYPES.URI
    ]
});
const openHyperlinkDialog = (dialogs, { value, showTextInput, allowedHyperlinkTypes, entitySelectorConfigs })=>{
    const isNew = !(value.uri || value.target);
    const props = {
        labels: {
            title: isNew ? _core.i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.InsertHyperlink",
                message: "Insert hyperlink"
            }) : _core.i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.EditHyperlink",
                message: "Edit hyperlink"
            }),
            confirm: isNew ? _core.i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.Insert",
                message: "Insert"
            }) : _core.i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.Update",
                message: "Update"
            })
        },
        value,
        hideText: !showTextInput,
        allowedHyperlinkTypes,
        entitySelectorConfigs
    };
    return dialogs.openCurrent({
        title: props.labels.title,
        width: 'large',
        shouldCloseOnEscapePress: true,
        shouldCloseOnOverlayClick: true,
        allowHeightOverflow: true,
        parameters: {
            type: 'rich-text-hyperlink-dialog',
            ...props
        }
    });
};
