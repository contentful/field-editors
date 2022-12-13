import React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Flex } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { useContentfulEditor } from '../ContentfulEditorProvider';
import { isNodeTypeSelected } from '../helpers/editor';
import { isNodeTypeEnabled, isMarkEnabled } from '../helpers/validations';
import { ToolbarHeadingButton } from '../plugins/Heading';
import { ToolbarHrButton } from '../plugins/Hr';
import { ToolbarHyperlinkButton } from '../plugins/Hyperlink';
import { ToolbarListButton } from '../plugins/List';
import { ToolbarBoldButton } from '../plugins/Marks/Bold';
import { ToolbarCodeButton } from '../plugins/Marks/Code';
import { ToolbarItalicButton } from '../plugins/Marks/Italic';
import { ToolbarSubscriptButton } from '../plugins/Marks/Subscript';
import { ToolbarSuperscriptButton } from '../plugins/Marks/Superscript';
import { ToolbarUnderlineButton } from '../plugins/Marks/Underline';
import { ToolbarQuoteButton } from '../plugins/Quote';
import { ToolbarTableButton } from '../plugins/Table';
import { useSdkContext } from '../SdkProvider';
import { EmbedEntityWidget } from './components/EmbedEntityWidget';

type ToolbarProps = {
  isDisabled?: boolean;
};

const styles = {
  toolbar: css({
    border: `1px solid ${tokens.gray400}`,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingXs,
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
  }),
  divider: css({
    display: 'inline-block',
    height: '21px',
    width: '1px',
    background: tokens.gray300,
    margin: `0 ${tokens.spacing2Xs}`,
  }),
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

const Toolbar = ({ isDisabled }: ToolbarProps) => {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();
  const canInsertBlocks = !isNodeTypeSelected(editor, BLOCKS.TABLE);
  const validationInfo = React.useMemo(() => getValidationInfo(sdk.field), [sdk.field]);
  const isListSelected =
    isNodeTypeSelected(editor, BLOCKS.UL_LIST) || isNodeTypeSelected(editor, BLOCKS.OL_LIST);
  const isBlockquoteSelected = isNodeTypeSelected(editor, BLOCKS.QUOTE);
  const shouldDisableTables =
    isDisabled || !canInsertBlocks || isListSelected || isBlockquoteSelected;

  return (
    <Flex testId="toolbar" className={styles.toolbar} alignItems="center">
      <div className={styles.formattingOptionsWrapper}>
        <ToolbarHeadingButton isDisabled={isDisabled || !canInsertBlocks} />

        {validationInfo.isAnyMarkEnabled && <span className={styles.divider} />}

        {isMarkEnabled(sdk.field, MARKS.BOLD) && <ToolbarBoldButton isDisabled={isDisabled} />}
        {isMarkEnabled(sdk.field, MARKS.ITALIC) && <ToolbarItalicButton isDisabled={isDisabled} />}
        {isMarkEnabled(sdk.field, MARKS.SUPERSCRIPT) && (
          <ToolbarSuperscriptButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.SUBSCRIPT) && (
          <ToolbarSubscriptButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.UNDERLINE) && (
          <ToolbarUnderlineButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.CODE) && <ToolbarCodeButton isDisabled={isDisabled} />}

        {validationInfo.isAnyHyperlinkEnabled && (
          <>
            <span className={styles.divider} />
            <ToolbarHyperlinkButton isDisabled={isDisabled} />
          </>
        )}

        {validationInfo.isAnyBlockFormattingEnabled && <span className={styles.divider} />}

        <ToolbarListButton isDisabled={isDisabled || !canInsertBlocks} />

        {isNodeTypeEnabled(sdk.field, BLOCKS.QUOTE) && (
          <ToolbarQuoteButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        {isNodeTypeEnabled(sdk.field, BLOCKS.HR) && (
          <ToolbarHrButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        {isNodeTypeEnabled(sdk.field, BLOCKS.TABLE) && (
          <ToolbarTableButton isDisabled={shouldDisableTables} />
        )}
      </div>
      <div className={styles.embedActionsWrapper}>
        <EmbedEntityWidget isDisabled={isDisabled} canInsertBlocks={canInsertBlocks} />
      </div>
    </Flex>
  );
};

function getValidationInfo(field: FieldExtensionSDK['field']): {
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
