import React, { Fragment, useState } from 'react';

import { css } from 'emotion';
import { EditorToolbar, EditorToolbarDivider } from '@contentful/forma-36-react-components';
import { ToolbarHrButton } from '../plugins/Hr';
import { ToolbarHeadingButton } from '../plugins/Heading';
import { ToolbarQuoteButton } from '../plugins/Quote';
import { ToolbarListButton } from '../plugins/List';
import { ToolbarBoldButton } from '../plugins/Bold';
import { ToolbarCodeButton } from '../plugins/Code';
import { ToolbarItalicButton } from '../plugins/Italic';
import { ToolbarUnderlineButton } from '../plugins/Underline';
import { ToolbarHyperlinkButton } from '../plugins/Hyperlink';
import { ToolbarTableButton } from '../plugins/Table';
import { EmbeddedEntityDropdownButton } from '../plugins/EmbeddedEntity';
import { ToolbarIcon as EmbeddedEntityBlockToolbarIcon } from '../plugins/EmbeddedEntityBlock';
import { SPEditor, useStoreEditor } from '@udecode/slate-plugins-core';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { isNodeTypeSelected } from '../helpers/editor';
import { isNodeTypeEnabled, isMarkEnabled } from '../helpers/validations';
import { ToolbarEmbeddedEntityInlineButton } from '../plugins/EmbeddedEntityInline';
import { useSdkContext } from '../SdkProvider';
import { FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';

type ToolbarProps = {
  isDisabled?: boolean;
};

const styles = {
  embedActionsWrapper: css({
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    webkitAlignSelf: 'flex-start',
    alignSelf: 'flex-start',
    msFlexItemAlign: 'start',
    marginLeft: 'auto',
  }),
  formattingOptionsWrapper: css({
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    msFlexAlign: 'center',
    webkitBoxAlign: 'center',
    alignItems: 'center',
    msFlexWrap: 'wrap',
    flexWrap: 'wrap',
    marginRight: '20px',
  }),
};

const EmbedAssetsWidget = ({ isDisabled }: ToolbarProps) => {
  const sdk = useSdkContext();
  const [isEmbedDropdownOpen, setEmbedDropdownOpen] = useState(false);
  const onCloseEntityDropdown = () => setEmbedDropdownOpen(false);
  const onToggleEntityDropdown = () => setEmbedDropdownOpen(!isEmbedDropdownOpen);

  const [canAccessAssets, setCanAccessAssets] = useState(false);
  React.useMemo(() => {
    sdk.access.can('read', 'Asset').then(setCanAccessAssets);
  }, [sdk]);
  const inlineEntryEmbedEnabled = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_ENTRY);
  const blockEntryEmbedEnabled = isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY);
  const blockAssetEmbedEnabled =
    canAccessAssets && isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET);

  const numEnabledEmbeds = [
    inlineEntryEmbedEnabled,
    blockEntryEmbedEnabled,
    blockAssetEmbedEnabled,
  ].filter(Boolean).length;
  const shouldDisplayDropdown = numEnabledEmbeds > 1;

  const icons = (
    <Fragment>
      {isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY) && (
        <EmbeddedEntityBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ENTRY}
          onClose={onCloseEntityDropdown}
          isButton={!shouldDisplayDropdown}
        />
      )}
      {isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_ENTRY) && (
        <ToolbarEmbeddedEntityInlineButton
          isDisabled={!!isDisabled}
          onClose={onCloseEntityDropdown}
        />
      )}
      {isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET) && (
        <EmbeddedEntityBlockToolbarIcon
          isDisabled={!!isDisabled}
          nodeType={BLOCKS.EMBEDDED_ASSET}
          onClose={onCloseEntityDropdown}
        />
      )}
    </Fragment>
  );

  if (shouldDisplayDropdown) {
    return (
      <EmbeddedEntityDropdownButton
        isDisabled={isDisabled}
        onClose={onCloseEntityDropdown}
        onToggle={onToggleEntityDropdown}
        isOpen={isEmbedDropdownOpen}>
        {icons}
      </EmbeddedEntityDropdownButton>
    );
  }
  return icons;
};

const Toolbar = ({ isDisabled }: ToolbarProps) => {
  const sdk = useSdkContext();
  const editor = useStoreEditor() as SPEditor;
  const canInsertBlocks = !isNodeTypeSelected(editor, BLOCKS.TABLE);
  const validationInfo = React.useMemo(() => getValidationInfo(sdk.field), [sdk.field]);

  return (
    <EditorToolbar testId="toolbar">
      <div className={styles.formattingOptionsWrapper}>
        <ToolbarHeadingButton isDisabled={isDisabled || !canInsertBlocks} />

        {validationInfo.isAnyMarkEnabled && <EditorToolbarDivider />}

        {isMarkEnabled(sdk.field, MARKS.BOLD) && <ToolbarBoldButton isDisabled={isDisabled} />}
        {isMarkEnabled(sdk.field, MARKS.ITALIC) && <ToolbarItalicButton isDisabled={isDisabled} />}
        {isMarkEnabled(sdk.field, MARKS.UNDERLINE) && (
          <ToolbarUnderlineButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.CODE) && <ToolbarCodeButton isDisabled={isDisabled} />}

        {validationInfo.isAnyHyperlinkEnabled && (
          <Fragment>
            <EditorToolbarDivider />
            <ToolbarHyperlinkButton isDisabled={isDisabled} />
          </Fragment>
        )}

        {validationInfo.isAnyBlockFormattingEnabled && <EditorToolbarDivider />}

        {isNodeTypeEnabled(sdk.field, BLOCKS.QUOTE) && (
          <ToolbarQuoteButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        <ToolbarListButton isDisabled={isDisabled || !canInsertBlocks} />
        {isNodeTypeEnabled(sdk.field, BLOCKS.HR) && (
          <ToolbarHrButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        {isNodeTypeEnabled(sdk.field, BLOCKS.TABLE) && (
          <ToolbarTableButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
      </div>
      <div className={styles.embedActionsWrapper}>
        <EmbedAssetsWidget isDisabled={isDisabled} />
      </div>
    </EditorToolbar>
  );
};

function getValidationInfo(
  field: FieldExtensionSDK['field']
): {
  isAnyMarkEnabled: boolean;
  isAnyHyperlinkEnabled: boolean;
  isAnyBlockFormattingEnabled: boolean;
} {
  const someWithValidation = (vals, validation) => vals.some((val) => validation(field, val));

  const isAnyMarkEnabled = someWithValidation(Object.values(MARKS), isMarkEnabled);

  const isAnyHyperlinkEnabled = someWithValidation(
    [INLINES.HYPERLINK, INLINES.ASSET_HYPERLINK, INLINES.ENTRY_HYPERLINK],
    isNodeTypeEnabled
  );

  const isAnyBlockFormattingEnabled = someWithValidation(
    [BLOCKS.UL_LIST, BLOCKS.OL_LIST, BLOCKS.QUOTE, BLOCKS.HR],
    isNodeTypeEnabled
  );

  return {
    isAnyMarkEnabled,
    isAnyHyperlinkEnabled,
    isAnyBlockFormattingEnabled,
  };
}

export default Toolbar;
