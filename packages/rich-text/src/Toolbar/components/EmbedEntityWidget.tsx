import React, { useState } from 'react';

import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { isLinkActive } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { EmbeddedBlockToolbarIcon } from '../../plugins/shared/EmbeddedBlockToolbarIcon';
import { EmbeddedInlineToolbarIcon } from '../../plugins/shared/EmbeddedInlineToolbarIcon';
import { useSdkContext } from '../../SdkProvider';
import { EmbeddedEntityDropdownButton } from './EmbeddedEntityDropdownButton';

export interface EmbedEntityWidgetProps {
  isDisabled?: boolean;
  canInsertBlocks?: boolean;
}

export const EmbedEntityWidget = ({ isDisabled, canInsertBlocks }: EmbedEntityWidgetProps) => {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();

  const [isEmbedDropdownOpen, setEmbedDropdownOpen] = useState(false);
  const onCloseEntityDropdown = () => setEmbedDropdownOpen(false);
  const onToggleEntityDropdown = () => setEmbedDropdownOpen(!isEmbedDropdownOpen);

  const inlineEntryEmbedEnabled = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_ENTRY);
  const inlineResourceEmbedEnabled = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_RESOURCE);
  const blockEntryEmbedEnabled =
    isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY) && canInsertBlocks;
  const blockResourceEmbedEnabled =
    isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_RESOURCE) && canInsertBlocks;
  // Removed access check following https://contentful.atlassian.net/browse/DANTE-486
  // TODO: refine permissions check in order to account for tags in rules and then readd access.can('read', 'Asset')
  const blockAssetEmbedEnabled =
    isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET) && canInsertBlocks;

  const actions = (
    <>
      {blockEntryEmbedEnabled && (
        <EmbeddedBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ENTRY}
          onClose={onCloseEntityDropdown}
        />
      )}
      {blockResourceEmbedEnabled && (
        <EmbeddedBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_RESOURCE}
          onClose={onCloseEntityDropdown}
        />
      )}
      {inlineEntryEmbedEnabled && (
        <EmbeddedInlineToolbarIcon
          nodeType={INLINES.EMBEDDED_ENTRY}
          isDisabled={!!isDisabled || isLinkActive(editor)}
          onClose={onCloseEntityDropdown}
        />
      )}
      {inlineResourceEmbedEnabled && (
        <EmbeddedInlineToolbarIcon
          nodeType={INLINES.EMBEDDED_RESOURCE}
          isDisabled={!!isDisabled || isLinkActive(editor)}
          onClose={onCloseEntityDropdown}
        />
      )}
      {blockAssetEmbedEnabled && (
        <EmbeddedBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ASSET}
          onClose={onCloseEntityDropdown}
        />
      )}
    </>
  );

  const showEmbedButton =
    blockEntryEmbedEnabled ||
    blockResourceEmbedEnabled ||
    inlineEntryEmbedEnabled ||
    inlineResourceEmbedEnabled ||
    blockAssetEmbedEnabled;

  return showEmbedButton ? (
    <EmbeddedEntityDropdownButton
      isDisabled={isDisabled}
      onClose={onCloseEntityDropdown}
      onToggle={onToggleEntityDropdown}
      isOpen={isEmbedDropdownOpen}
    >
      {actions}
    </EmbeddedEntityDropdownButton>
  ) : null;
};
