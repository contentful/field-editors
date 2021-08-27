import React, { Fragment } from 'react';

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
import { SPEditor, useStoreEditorRef } from '@udecode/plate-core';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { isNodeTypeSelected } from '../helpers/editor';
import { isNodeTypeEnabled, isMarkEnabled } from '../helpers/validations';
import { useSdkContext } from '../SdkProvider';
import { FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';
import { EmbedEntityWidget } from './EmbedEntityWidget';

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

const Toolbar = ({ isDisabled }: ToolbarProps) => {
  const sdk = useSdkContext();
  const editor = useStoreEditorRef() as SPEditor;
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
        <EmbedEntityWidget isDisabled={isDisabled} canInsertBlocks={canInsertBlocks} />
      </div>
    </EditorToolbar>
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
