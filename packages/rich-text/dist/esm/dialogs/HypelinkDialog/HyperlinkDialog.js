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
import * as React from 'react';
import { Button, Form, FormControl, FormLabel, ModalContent, ModalControls, Select, TextInput, TextLink } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { EntityProvider } from '@contentful/field-editor-reference';
import { i18n as $_i18n } from "@lingui/core";
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { FetchingWrappedAssetCard } from '../../plugins/shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../../plugins/shared/FetchingWrappedEntryCard';
export const LINK_TYPES = {
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
export class HyperlinkDialog extends (_React_Component = React.Component) {
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
            title: $_i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.DefaultTitle",
                message: "Insert link"
            }),
            confirm: $_i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.DefaultConfirm",
                message: "Insert link"
            })
        };
        return /*#__PURE__*/ React.createElement(EntityProvider, {
            sdk: this.props.sdk
        }, /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(ModalContent, null, this.renderFields()), /*#__PURE__*/ React.createElement(ModalControls, null, /*#__PURE__*/ React.createElement(Button, {
            type: "button",
            onClick: ()=>this.props.onClose(null),
            variant: "secondary",
            testId: "cancel-cta",
            size: "small"
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.Cancel",
            message: "Cancel"
        })), /*#__PURE__*/ React.createElement(Button, {
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
        return /*#__PURE__*/ React.createElement(Form, null, hideText ? null : /*#__PURE__*/ React.createElement(FormControl, {
            id: "link-text",
            isRequired: true
        }, /*#__PURE__*/ React.createElement(FormControl.Label, null, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkText",
            message: "Link text"
        })), /*#__PURE__*/ React.createElement(TextInput, {
            testId: "link-text-input",
            name: "link-text",
            value: text || '',
            onChange: (e)=>this.setState({
                    text: e.target.value
                }),
            autoFocus: !isUriInputAutoFocused
        })), isFeaturingEntitySelector(entitySelectorConfigs) && /*#__PURE__*/ React.createElement(FormControl, {
            id: "link-type",
            name: "link-type"
        }, /*#__PURE__*/ React.createElement(FormControl.Label, null, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkType",
            message: "Link type"
        })), /*#__PURE__*/ React.createElement(Select, {
            value: type,
            onChange: (e)=>this.setState({
                    type: e.target.value
                }),
            testId: "link-type-select"
        }, allowedHyperlinkTypes.includes(LINK_TYPES.URI) || type === LINK_TYPES.URI ? /*#__PURE__*/ React.createElement(Select.Option, {
            value: LINK_TYPES.URI
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.URL",
            message: "URL"
        })) : null, allowedHyperlinkTypes.includes(LINK_TYPES.ENTRY) || type === LINK_TYPES.ENTRY ? /*#__PURE__*/ React.createElement(Select.Option, {
            value: LINK_TYPES.ENTRY
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.Entry",
            message: "Entry"
        })) : null, allowedHyperlinkTypes.includes(LINK_TYPES.ASSET) || type === LINK_TYPES.ASSET ? /*#__PURE__*/ React.createElement(Select.Option, {
            value: LINK_TYPES.ASSET
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.Asset",
            message: "Asset"
        })) : null)), type === LINK_TYPES.URI ? /*#__PURE__*/ React.createElement(FormControl, {
            id: "link-uri",
            isRequired: true
        }, /*#__PURE__*/ React.createElement(FormControl.Label, null, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkTarget",
            message: "Link target"
        })), /*#__PURE__*/ React.createElement(TextInput, {
            testId: "link-target-input",
            name: "link-uri",
            value: uri || '',
            placeholder: "https://",
            onChange: (e)=>this.setState({
                    uri: e.target.value
                }),
            autoFocus: isUriInputAutoFocused
        }), /*#__PURE__*/ React.createElement(FormControl.HelpText, null, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.ProtocolHelpText",
            message: "A protocol may be required, e.g. https://"
        }))) : this.renderEntityField());
    }
    renderEntityField() {
        const { type, entityLinks } = this.state;
        const resetEntity = ()=>this.setTargetEntity(type, null);
        const entityLink = entityLinks[type];
        const isEntitySelectorVisible = !entityLink;
        return /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement(FormLabel, {
            required: true,
            htmlFor: ""
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.LinkTarget",
            message: "Link target"
        })), !isEntitySelectorVisible && /*#__PURE__*/ React.createElement(TextLink, {
            as: "button",
            className: css({
                marginLeft: tokens.spacingS
            }),
            onClick: resetEntity
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.RemoveSelection",
            message: "Remove selection"
        })), entityLink && /*#__PURE__*/ React.createElement("div", null, type === LINK_TYPES.ENTRY && /*#__PURE__*/ React.createElement(FetchingWrappedEntryCard, {
            sdk: this.props.sdk,
            locale: this.props.entitySelectorConfigs.Entry.locale,
            entryId: entityLink.sys.id,
            isDisabled: true,
            isSelected: false
        }), type == LINK_TYPES.ASSET && /*#__PURE__*/ React.createElement(FetchingWrappedAssetCard, {
            sdk: this.props.sdk,
            locale: this.props.entitySelectorConfigs.Asset.locale,
            assetId: entityLink.sys.id,
            isDisabled: true,
            isSelected: false
        })), isEntitySelectorVisible && this.renderEntitySelector(type, isEntitySelectorVisible));
    }
    renderEntitySelector(type) {
        return /*#__PURE__*/ React.createElement("div", {
            className: css({
                marginTop: tokens.spacingS
            })
        }, type === LINK_TYPES.ENTRY && /*#__PURE__*/ React.createElement(TextLink, {
            as: "button",
            onClick: this.selectEntry
        }, $_i18n._({
            id: "FieldEditors.RichText.HyperlinkDialog.SelectEntry",
            message: "Select entry"
        })), type === LINK_TYPES.ASSET && /*#__PURE__*/ React.createElement(TextLink, {
            as: "button",
            onClick: this.selectAsset
        }, $_i18n._({
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
    sdk: PropTypes.object.isRequired,
    labels: PropTypes.shape({
        title: PropTypes.string,
        confirm: PropTypes.string
    }),
    value: PropTypes.shape({
        text: PropTypes.string,
        uri: PropTypes.string,
        target: PropTypes.object,
        type: PropTypes.oneOf([
            'uri',
            'Entry',
            'Asset'
        ])
    }),
    entitySelectorConfigs: PropTypes.object,
    allowedHyperlinkTypes: PropTypes.arrayOf(PropTypes.oneOf([
        LINK_TYPES.ENTRY,
        LINK_TYPES.ASSET,
        LINK_TYPES.URI
    ])),
    hideText: PropTypes.bool,
    onClose: PropTypes.func.isRequired
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
export const openHyperlinkDialog = (dialogs, { value, showTextInput, allowedHyperlinkTypes, entitySelectorConfigs })=>{
    const isNew = !(value.uri || value.target);
    const props = {
        labels: {
            title: isNew ? $_i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.InsertHyperlink",
                message: "Insert hyperlink"
            }) : $_i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.EditHyperlink",
                message: "Edit hyperlink"
            }),
            confirm: isNew ? $_i18n._({
                id: "FieldEditors.RichText.HyperlinkDialog.Insert",
                message: "Insert"
            }) : $_i18n._({
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
