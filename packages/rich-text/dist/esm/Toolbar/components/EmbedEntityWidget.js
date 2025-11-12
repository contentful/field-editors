import React, { useState } from 'react';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { isLinkActive } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { EmbeddedBlockToolbarIcon } from '../../plugins/shared/EmbeddedBlockToolbarIcon';
import { EmbeddedInlineToolbarIcon } from '../../plugins/shared/EmbeddedInlineToolbarIcon';
import { useSdkContext } from '../../SdkProvider';
import { EmbeddedEntityDropdownButton } from './EmbeddedEntityDropdownButton';
export const EmbedEntityWidget = ({ isDisabled, canInsertBlocks })=>{
    const sdk = useSdkContext();
    const editor = useContentfulEditor();
    const [isEmbedDropdownOpen, setEmbedDropdownOpen] = useState(false);
    const onCloseEntityDropdown = ()=>setEmbedDropdownOpen(false);
    const onToggleEntityDropdown = ()=>setEmbedDropdownOpen(!isEmbedDropdownOpen);
    const inlineEntryEmbedEnabled = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_ENTRY);
    const inlineResourceEmbedEnabled = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_RESOURCE);
    const blockEntryEmbedEnabled = isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY) && canInsertBlocks;
    const blockResourceEmbedEnabled = isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_RESOURCE) && canInsertBlocks;
    const blockAssetEmbedEnabled = isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET) && canInsertBlocks;
    const actions = /*#__PURE__*/ React.createElement(React.Fragment, null, blockEntryEmbedEnabled && /*#__PURE__*/ React.createElement(EmbeddedBlockToolbarIcon, {
        isDisabled: !!isDisabled,
        nodeType: BLOCKS.EMBEDDED_ENTRY,
        onClose: onCloseEntityDropdown
    }), blockResourceEmbedEnabled && /*#__PURE__*/ React.createElement(EmbeddedBlockToolbarIcon, {
        isDisabled: !!isDisabled,
        nodeType: BLOCKS.EMBEDDED_RESOURCE,
        onClose: onCloseEntityDropdown
    }), inlineEntryEmbedEnabled && /*#__PURE__*/ React.createElement(EmbeddedInlineToolbarIcon, {
        nodeType: INLINES.EMBEDDED_ENTRY,
        isDisabled: !!isDisabled || isLinkActive(editor),
        onClose: onCloseEntityDropdown
    }), inlineResourceEmbedEnabled && /*#__PURE__*/ React.createElement(EmbeddedInlineToolbarIcon, {
        nodeType: INLINES.EMBEDDED_RESOURCE,
        isDisabled: !!isDisabled || isLinkActive(editor),
        onClose: onCloseEntityDropdown
    }), blockAssetEmbedEnabled && /*#__PURE__*/ React.createElement(EmbeddedBlockToolbarIcon, {
        isDisabled: !!isDisabled,
        nodeType: BLOCKS.EMBEDDED_ASSET,
        onClose: onCloseEntityDropdown
    }));
    const showEmbedButton = blockEntryEmbedEnabled || blockResourceEmbedEnabled || inlineEntryEmbedEnabled || inlineResourceEmbedEnabled || blockAssetEmbedEnabled;
    return showEmbedButton ? /*#__PURE__*/ React.createElement(EmbeddedEntityDropdownButton, {
        isDisabled: isDisabled,
        onClose: onCloseEntityDropdown,
        onToggle: onToggleEntityDropdown,
        isOpen: isEmbedDropdownOpen
    }, actions) : null;
};
