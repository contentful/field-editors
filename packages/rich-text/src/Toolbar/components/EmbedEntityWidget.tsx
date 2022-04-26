import React, { useState } from 'react';

import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { isLinkActive } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { ToolbarIcon as EmbeddedEntityBlockToolbarIcon } from '../../plugins/EmbeddedEntityBlock';
import { ToolbarEmbeddedEntityInlineButton } from '../../plugins/EmbeddedEntityInline';
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

  // Hardcoded `true` value following https://contentful.atlassian.net/browse/DANTE-486
  // TODO: refine permissions check in order to account for tags in rules
  const [canAccessAssets, setCanAccessAssets] = useState(true);
  // React.useEffect(() => {
  //   let subscribed = true;
  //   // TODO: See comment above about hardcoded `true` value
  //   sdk.access.can('read', 'Asset').then((can) => {
  //     if (!subscribed) {
  //       return;
  //     }
  //     setCanAccessAssets(can);
  //   });
  //   return () => {
  //     subscribed = false;
  //   };
  // }, [sdk]);

  const inlineEntryEmbedEnabled = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_ENTRY);
  const blockEntryEmbedEnabled =
    isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY) && canInsertBlocks;
  const blockAssetEmbedEnabled =
    canAccessAssets && isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET) && canInsertBlocks;

  const numEnabledEmbeds = [
    inlineEntryEmbedEnabled,
    blockEntryEmbedEnabled,
    blockAssetEmbedEnabled,
  ].filter(Boolean).length;

  const shouldDisplayDropdown = numEnabledEmbeds > 1 || isDisabled;

  // Avoids UI glitching when switching back and forth between
  // different layouts
  React.useEffect(() => {
    if (!shouldDisplayDropdown) {
      setEmbedDropdownOpen(false);
    }
  }, [shouldDisplayDropdown]);

  const actions = (
    <>
      {blockEntryEmbedEnabled && (
        <EmbeddedEntityBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ENTRY}
          onClose={onCloseEntityDropdown}
          isButton={!shouldDisplayDropdown}
        />
      )}
      {inlineEntryEmbedEnabled && (
        <ToolbarEmbeddedEntityInlineButton
          isDisabled={!!isDisabled || isLinkActive(editor)}
          onClose={onCloseEntityDropdown}
          isButton={!shouldDisplayDropdown}
        />
      )}
      {blockAssetEmbedEnabled && (
        <EmbeddedEntityBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ASSET}
          onClose={onCloseEntityDropdown}
          isButton={!shouldDisplayDropdown}
        />
      )}
    </>
  );

  if (!shouldDisplayDropdown) {
    return actions;
  }

  return (
    <EmbeddedEntityDropdownButton
      isDisabled={isDisabled}
      onClose={onCloseEntityDropdown}
      onToggle={onToggleEntityDropdown}
      isOpen={isEmbedDropdownOpen}>
      {actions}
    </EmbeddedEntityDropdownButton>
  );
};
