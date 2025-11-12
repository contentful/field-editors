import * as React from 'react';
import { Button, Form, FormControl, FormLabel, ModalContent, ModalControls, Select, TextInput, TextLink } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { EntityProvider } from '@contentful/field-editor-reference';
import { ModalDialogLauncher } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { focus, getNodeEntryFromSelection, insertLink, LINK_TYPES } from '../../helpers/editor';
import getAllowedResourcesForNodeType from '../../helpers/getAllowedResourcesForNodeType';
import getLinkedContentTypeIdsForNodeType from '../../helpers/getLinkedContentTypeIdsForNodeType';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { withoutNormalizing } from '../../internal';
import { getText, isEditorReadOnly } from '../../internal/queries';
import { select } from '../../internal/transforms';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { FetchingWrappedResourceCard } from '../shared/FetchingWrappedResourceCard';
const styles = {
    removeSelectionLabel: css`
    margin-left: ${tokens.spacingS};
    margin-bottom: ${tokens.spacingXs}; // to match FormLabel margin
  `
};
const SYS_LINK_TYPES = {
    [INLINES.ENTRY_HYPERLINK]: 'Entry',
    [INLINES.ASSET_HYPERLINK]: 'Asset',
    [INLINES.RESOURCE_HYPERLINK]: 'Contentful:Entry'
};
const LINK_TYPE_SELECTION_VALUES = {
    [INLINES.HYPERLINK]: 'URL',
    [INLINES.ENTRY_HYPERLINK]: 'Entry',
    [INLINES.RESOURCE_HYPERLINK]: 'Entry (different space)',
    [INLINES.ASSET_HYPERLINK]: 'Asset'
};
export function HyperlinkModal(props) {
    const enabledLinkTypes = LINK_TYPES.filter((nodeType)=>isNodeTypeEnabled(props.sdk.field, nodeType));
    const [defaultLinkType] = enabledLinkTypes;
    const [linkText, setLinkText] = React.useState(props.linkText ?? '');
    const [linkType, setLinkType] = React.useState(props.linkType ?? defaultLinkType);
    const [linkTarget, setLinkTarget] = React.useState(props.linkTarget ?? '');
    const [linkEntity, setLinkEntity] = React.useState(props.linkEntity ?? null);
    const linkTargetInputRef = React.useRef(null);
    React.useEffect(()=>{
        if (linkType === INLINES.HYPERLINK && linkTargetInputRef.current) {
            linkTargetInputRef.current.focus();
        }
    }, [
        linkType
    ]);
    function isLinkComplete() {
        const isRegularLink = linkType === INLINES.HYPERLINK;
        if (isRegularLink) {
            return !!(linkText && linkTarget);
        }
        const entityLinks = Object.keys(SYS_LINK_TYPES);
        const isEntityLink = entityLinks.includes(linkType);
        if (isEntityLink) {
            if (linkType === INLINES.ENTRY_HYPERLINK) {
                return !!(linkText && isEntryLink(linkEntity));
            }
            if (linkType === INLINES.ASSET_HYPERLINK) {
                return !!(linkText && isAssetLink(linkEntity));
            }
            if (linkType === INLINES.RESOURCE_HYPERLINK) {
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
            contentTypes: getLinkedContentTypeIdsForNodeType(props.sdk.field, INLINES.ENTRY_HYPERLINK),
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
            allowedResources: getAllowedResourcesForNodeType(props.sdk.field, INLINES.RESOURCE_HYPERLINK),
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
    return /*#__PURE__*/ React.createElement(EntityProvider, {
        sdk: props.sdk
    }, /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(ModalContent, null, /*#__PURE__*/ React.createElement(Form, null, !props.linkType && /*#__PURE__*/ React.createElement(FormControl, {
        id: "link-text",
        isRequired: true
    }, /*#__PURE__*/ React.createElement(FormControl.Label, null, "Link text"), /*#__PURE__*/ React.createElement(TextInput, {
        testId: "link-text-input",
        name: "link-text",
        value: linkText,
        onChange: (event)=>setLinkText(event.target.value)
    })), enabledLinkTypes.length > 1 && /*#__PURE__*/ React.createElement(FormControl, {
        id: "link-type"
    }, /*#__PURE__*/ React.createElement(FormControl.Label, null, "Link type"), /*#__PURE__*/ React.createElement(Select, {
        value: linkType,
        onChange: (event)=>setLinkType(event.target.value),
        testId: "link-type-input",
        isDisabled: props.readonly
    }, enabledLinkTypes.map((nodeType)=>/*#__PURE__*/ React.createElement(Select.Option, {
            key: nodeType,
            value: nodeType
        }, LINK_TYPE_SELECTION_VALUES[nodeType])))), linkType === INLINES.HYPERLINK && /*#__PURE__*/ React.createElement(FormControl, {
        id: "linkTarget",
        isRequired: true
    }, /*#__PURE__*/ React.createElement(FormControl.Label, null, "Link target"), /*#__PURE__*/ React.createElement(TextInput, {
        ref: linkTargetInputRef,
        name: "linkTarget",
        value: linkTarget,
        onChange: (event)=>{
            setLinkEntity(null);
            setLinkTarget(event.target.value);
        },
        testId: "link-target-input",
        isDisabled: props.readonly
    }), /*#__PURE__*/ React.createElement(FormControl.HelpText, null, "A protocol may be required, e.g. https://")), linkType !== INLINES.HYPERLINK && /*#__PURE__*/ React.createElement("div", null, /*#__PURE__*/ React.createElement(FormLabel, {
        isRequired: true,
        htmlFor: ""
    }, "Link target", ' '), linkEntity && linkEntity.sys.linkType === SYS_LINK_TYPES[linkType] ? /*#__PURE__*/ React.createElement(React.Fragment, null, !props.readonly && /*#__PURE__*/ React.createElement(TextLink, {
        testId: "entity-selection-link",
        onClick: resetLinkEntity,
        className: styles.removeSelectionLabel
    }, "Remove selection"), /*#__PURE__*/ React.createElement("div", null, linkType === INLINES.ENTRY_HYPERLINK && isEntryLink(linkEntity) && /*#__PURE__*/ React.createElement(FetchingWrappedEntryCard, {
        sdk: props.sdk,
        locale: props.sdk.field.locale,
        entryId: linkEntity.sys.id,
        isDisabled: true,
        isSelected: false
    }), linkType === INLINES.RESOURCE_HYPERLINK && isResourceLink(linkEntity) && /*#__PURE__*/ React.createElement(FetchingWrappedResourceCard, {
        sdk: props.sdk,
        link: linkEntity.sys,
        isDisabled: true,
        isSelected: false
    }), linkType === INLINES.ASSET_HYPERLINK && isAssetLink(linkEntity) && /*#__PURE__*/ React.createElement(FetchingWrappedAssetCard, {
        sdk: props.sdk,
        locale: props.sdk.field.locale,
        assetId: linkEntity.sys.id,
        isDisabled: true,
        isSelected: false
    }))) : /*#__PURE__*/ React.createElement("div", null, linkType === INLINES.ENTRY_HYPERLINK && /*#__PURE__*/ React.createElement(TextLink, {
        testId: "entity-selection-link",
        onClick: selectEntry
    }, "Select entry"), linkType === INLINES.RESOURCE_HYPERLINK && /*#__PURE__*/ React.createElement(TextLink, {
        testId: "entity-selection-link",
        onClick: selectResourceEntry
    }, "Select entry"), linkType === INLINES.ASSET_HYPERLINK && /*#__PURE__*/ React.createElement(TextLink, {
        testId: "entity-selection-link",
        onClick: selectAsset
    }, "Select asset"))))), /*#__PURE__*/ React.createElement(ModalControls, null, /*#__PURE__*/ React.createElement(Button, {
        type: "button",
        onClick: ()=>props.onClose(null),
        variant: "secondary",
        testId: "cancel-cta",
        size: "small"
    }, "Cancel"), /*#__PURE__*/ React.createElement(Button, {
        type: "submit",
        variant: "positive",
        size: "small",
        isDisabled: props.readonly || !isLinkComplete(),
        onClick: handleOnSubmit,
        testId: "confirm-cta"
    }, props.linkType ? 'Update' : 'Insert'))));
}
export async function addOrEditLink(editor, sdk, logAction, targetPath) {
    const isReadOnly = isEditorReadOnly(editor);
    const selectionBeforeBlur = editor.selection ? {
        ...editor.selection
    } : undefined;
    if (!targetPath && !selectionBeforeBlur) return;
    let linkType;
    let linkText;
    let linkTarget;
    let linkEntity;
    const [node, path] = getNodeEntryFromSelection(editor, LINK_TYPES, targetPath);
    if (node && path) {
        linkType = node.type;
        linkText = getText(editor, path);
        linkTarget = node.data.uri || '';
        linkEntity = node.data.target;
    }
    const selectionAfterFocus = targetPath ?? selectionBeforeBlur;
    const currentLinkText = linkText || (editor.selection ? getText(editor, editor.selection) : '');
    const isEditing = Boolean(node && path);
    logAction(isEditing ? 'openEditHyperlinkDialog' : 'openCreateHyperlinkDialog');
    const data = await ModalDialogLauncher.openDialog({
        title: isEditing ? 'Edit hyperlink' : 'Insert hyperlink',
        width: 'large',
        shouldCloseOnEscapePress: true,
        shouldCloseOnOverlayClick: true,
        allowHeightOverflow: true
    }, ({ onClose })=>{
        return /*#__PURE__*/ React.createElement(HyperlinkModal, {
            linkTarget: linkTarget,
            linkText: currentLinkText,
            linkType: linkType,
            linkEntity: linkEntity,
            onClose: onClose,
            sdk: sdk,
            readonly: isReadOnly
        });
    });
    select(editor, selectionAfterFocus);
    if (!data) {
        focus(editor);
        logAction(isEditing ? 'cancelEditHyperlinkDialog' : 'cancelCreateHyperlinkDialog');
        return;
    }
    const { linkText: text, linkTarget: url, linkType: type, linkEntity: target } = data;
    withoutNormalizing(editor, ()=>{
        insertLink(editor, {
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
    focus(editor);
}
