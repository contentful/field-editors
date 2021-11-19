import React, { Fragment } from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { Flex } from '@contentful/f36-components';
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
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { isNodeTypeSelected } from '../helpers/editor';
import { isNodeTypeEnabled, isMarkEnabled } from '../helpers/validations';
import { useSdkContext } from '../SdkProvider';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EmbedEntityWidget } from './EmbedEntityWidget';
import { useContentfulEditor } from '../ContentfulEditorProvider';

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
        {isMarkEnabled(sdk.field, MARKS.UNDERLINE) && (
          <ToolbarUnderlineButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.CODE) && <ToolbarCodeButton isDisabled={isDisabled} />}

        {validationInfo.isAnyHyperlinkEnabled && (
          <Fragment>
            <span className={styles.divider} />
            <ToolbarHyperlinkButton isDisabled={isDisabled} />
          </Fragment>
        )}

        {validationInfo.isAnyBlockFormattingEnabled && <span className={styles.divider} />}

        {isNodeTypeEnabled(sdk.field, BLOCKS.QUOTE) && (
          <ToolbarQuoteButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        <ToolbarListButton isDisabled={isDisabled || !canInsertBlocks} />
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
