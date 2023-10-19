import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { Flex, IconButton, Menu } from '@contentful/f36-components';
import { MoreHorizontalIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { useContentfulEditor } from '../ContentfulEditorProvider';
import { isNodeTypeSelected } from '../helpers/editor';
import { isMarkEnabled, isNodeTypeEnabled } from '../helpers/validations';
import { isMarkActive } from '../internal/queries';
import { ToolbarHeadingButton } from '../plugins/Heading';
import { ToolbarHrButton } from '../plugins/Hr';
import { ToolbarHyperlinkButton } from '../plugins/Hyperlink';
import { ToolbarListButton } from '../plugins/List';
import { ToolbarBoldButton } from '../plugins/Marks/Bold';
import { ToolbarCodeButton, ToolbarDropdownCodeButton } from '../plugins/Marks/Code';
import { ToolbarItalicButton } from '../plugins/Marks/Italic';
import { ToolbarDropdownSubscriptButton, ToolbarSubscriptButton } from '../plugins/Marks/Subscript';
import {
  ToolbarDropdownSuperscriptButton,
  ToolbarSuperscriptButton,
} from '../plugins/Marks/Superscript';
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
  toolbarBtn: css({
    height: '30px',
    width: '30px',
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
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

const Dropdown = ({ sdk, isDisabled }: { sdk: FieldAppSDK; isDisabled?: boolean }) => {
  const editor = useContentfulEditor();
  const isActive =
    editor &&
    (isMarkActive(editor, MARKS.SUPERSCRIPT) ||
      isMarkActive(editor, MARKS.SUBSCRIPT) ||
      isMarkActive(editor, MARKS.CODE));

  return (
    <Menu>
      <Menu.Trigger>
        <span>
          <IconButton
            size="small"
            className={styles.toolbarBtn}
            variant={isActive ? 'secondary' : 'transparent'}
            icon={<MoreHorizontalIcon />}
            aria-label="toggle menu"
            isDisabled={isDisabled}
            testId="dropdown-toolbar-button"
          />
        </span>
      </Menu.Trigger>
      <Menu.List>
        {isMarkEnabled(sdk.field, MARKS.SUPERSCRIPT) && (
          <ToolbarDropdownSuperscriptButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.SUBSCRIPT) && (
          <ToolbarDropdownSubscriptButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.CODE) && (
          <ToolbarDropdownCodeButton isDisabled={isDisabled} />
        )}
      </Menu.List>
    </Menu>
  );
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

  // We only show the dropdown when: whenever at least bold , italic and underline are available; If nothing that would go inside the dropdown is available, we hide it
  const boldItalicUnderlineAvailable =
    isMarkEnabled(sdk.field, MARKS.BOLD) ||
    isMarkEnabled(sdk.field, MARKS.ITALIC) ||
    isMarkEnabled(sdk.field, MARKS.UNDERLINE);
  const dropdownItemsAvailable =
    isMarkEnabled(sdk.field, MARKS.SUPERSCRIPT) ||
    isMarkEnabled(sdk.field, MARKS.SUBSCRIPT) ||
    isMarkEnabled(sdk.field, MARKS.CODE);
  const shouldShowDropdown = boldItalicUnderlineAvailable && dropdownItemsAvailable;

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

        {!boldItalicUnderlineAvailable && isMarkEnabled(sdk.field, MARKS.SUPERSCRIPT) && (
          <ToolbarSuperscriptButton isDisabled={isDisabled} />
        )}
        {!boldItalicUnderlineAvailable && isMarkEnabled(sdk.field, MARKS.SUBSCRIPT) && (
          <ToolbarSubscriptButton isDisabled={isDisabled} />
        )}
        {!boldItalicUnderlineAvailable && isMarkEnabled(sdk.field, MARKS.CODE) && (
          <ToolbarCodeButton isDisabled={isDisabled} />
        )}

        {shouldShowDropdown && <Dropdown sdk={sdk} isDisabled={isDisabled} />}

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

function getValidationInfo(field: FieldAppSDK['field']): {
  isAnyMarkEnabled: boolean;
  isAnyHyperlinkEnabled: boolean;
  isAnyBlockFormattingEnabled: boolean;
} {
  const someWithValidation = (vals, validation) => vals.some((val) => validation(field, val));

  const isAnyMarkEnabled = someWithValidation(Object.values(MARKS), isMarkEnabled);

  const isAnyHyperlinkEnabled = someWithValidation(
    [
      INLINES.HYPERLINK,
      INLINES.ASSET_HYPERLINK,
      INLINES.ENTRY_HYPERLINK,
      INLINES.RESOURCE_HYPERLINK,
    ],
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
