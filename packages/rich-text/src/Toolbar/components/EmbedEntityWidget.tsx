import React, { useState } from 'react';

import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { isLinkActive } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { ToolbarIcon as EmbeddedEntityBlockToolbarIcon } from '../../plugins/EmbeddedEntityBlock';
import { ToolbarEmbeddedEntityInlineButton } from '../../plugins/EmbeddedEntityInline';
import { useSdkContext } from '../../SdkProvider';
import { EmbeddedEntityDropdownButton } from './EmbeddedEntityDropdownButton';
import { RichTextEditor } from 'types';

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
  const blockEntryEmbedEnabled =
    isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY) && canInsertBlocks;
  // Removed access check following https://contentful.atlassian.net/browse/DANTE-486
  // TODO: refine permissions check in order to account for tags in rules and then readd access.can('read', 'Asset')
  const blockAssetEmbedEnabled =
    isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET) && canInsertBlocks;

  const actions = (
    <>
      {blockEntryEmbedEnabled && (
        <EmbeddedEntityBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ENTRY}
          onClose={onCloseEntityDropdown}
        />
      )}
      {inlineEntryEmbedEnabled && (
        <ToolbarEmbeddedEntityInlineButton
          isDisabled={!!isDisabled || isLinkActive(editor as RichTextEditor)}
          onClose={onCloseEntityDropdown}
        />
      )}
      {blockAssetEmbedEnabled && (
        <EmbeddedEntityBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ASSET}
          onClose={onCloseEntityDropdown}
        />
      )}
    </>
  );

  const showEmbedButton =
    blockEntryEmbedEnabled || inlineEntryEmbedEnabled || blockAssetEmbedEnabled;

  return showEmbedButton ? (
    <EmbeddedEntityDropdownButton
      isDisabled={isDisabled}
      onClose={onCloseEntityDropdown}
      onToggle={onToggleEntityDropdown}
      isOpen={isEmbedDropdownOpen}>
      {actions}
    </EmbeddedEntityDropdownButton>
  ) : null;
};
