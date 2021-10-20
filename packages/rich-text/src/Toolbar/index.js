import React from 'react';
import PropTypes from 'prop-types';

import { Flex } from '@contentful/f36-components';

import Bold from '../plugins/Bold';
import Italic from '../plugins/Italic';
import Underlined from '../plugins/Underlined';
import Code from '../plugins/Code';
import Quote from '../plugins/Quote';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Paragraph,
  HeadingDropdown,
} from '../plugins/Heading';

import Hyperlink from '../plugins/Hyperlink';
import { css } from 'emotion';

import EmbeddedEntryInline from '../plugins/EmbeddedEntryInline';
import EmbeddedEntityBlock from '../plugins/EmbeddedEntityBlock';
import EntryEmbedDropdown from '../plugins/EntryEmbedDropdown';

import { UnorderedList, OrderedList } from '../plugins/List';
import Hr from '../plugins/Hr';

import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';

import { isNodeTypeEnabled, isMarkEnabled } from '../validations';
import tokens from '@contentful/forma-36-tokens';

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

export default class Toolbar extends React.Component {
  static propTypes = {
    richTextAPI: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    editor: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  hasMounted = false;

  isReadyToSetFocusProgrammatically = false;

  state = {
    headingMenuOpen: false,
    canAccessAssets: false,
    ...getValidationInfo(this.props.richTextAPI.sdk.field),
  };

  componentDidMount() {
    this.hasMounted = true;
    this.props.richTextAPI.sdk.access.can('read', 'Asset').then((canReadAssets) => {
      if (this.hasMounted) {
        // Prevent setting state on unmounted component
        this.setState({ canAccessAssets: canReadAssets });
      }
    });
  }

  componentWillUnmount() {
    this.hasMounted = false;
  }

  onChange = (...args) => {
    this.setState({ headingMenuOpen: false });
    this.props.onChange(...args);
  };

  handleEmbedDropdownOpen = () =>
    this.setState({
      isEmbedDropdownOpen: true,
    });

  handleEmbedDropdownClose = () =>
    this.setState({
      isEmbedDropdownOpen: false,
    });

  renderEmbeds = (props) => {
    const field = this.props.richTextAPI.sdk.field;

    const inlineEntryEmbedEnabled = isNodeTypeEnabled(field, INLINES.EMBEDDED_ENTRY);
    const blockEntryEmbedEnabled = isNodeTypeEnabled(field, BLOCKS.EMBEDDED_ENTRY);
    const blockAssetEmbedEnabled =
      this.state.canAccessAssets && isNodeTypeEnabled(field, BLOCKS.EMBEDDED_ASSET);

    const numEnabledEmbeds = [
      inlineEntryEmbedEnabled,
      blockEntryEmbedEnabled,
      blockAssetEmbedEnabled,
    ].filter(Boolean).length;

    return (
      <div className={styles.embedActionsWrapper}>
        {numEnabledEmbeds > 1 ? (
          <EntryEmbedDropdown
            onOpen={this.handleEmbedDropdownOpen}
            isOpen={this.state.isEmbedDropdownOpen}
            disabled={props.disabled}
            onClose={this.handleEmbedDropdownClose}>
            {blockEntryEmbedEnabled && (
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ENTRY} {...props} />
            )}
            {inlineEntryEmbedEnabled && <EmbeddedEntryInline {...props} />}
            {blockAssetEmbedEnabled && (
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ASSET} {...props} />
            )}
          </EntryEmbedDropdown>
        ) : (
          <React.Fragment>
            {blockEntryEmbedEnabled && (
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ENTRY} isButton {...props} />
            )}
            {inlineEntryEmbedEnabled && <EmbeddedEntryInline isButton {...props} />}
            {blockAssetEmbedEnabled && (
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ASSET} isButton {...props} />
            )}
          </React.Fragment>
        )}
      </div>
    );
  };

  openHeadingMenu = () =>
    this.setState({
      headingMenuOpen: true,
    });

  closeHeadingMenu = () =>
    this.setState({
      headingMenuOpen: false,
    });

  render() {
    const { editor, isDisabled, richTextAPI } = this.props;
    if (editor.value.selection.isFocused) {
      // If the Slate input has ever been focused by the user, we can now also
      // programmatically use `editor.setFocus()` without undesired side-effects.
      this.isReadyToSetFocusProgrammatically = true;
    }
    const props = {
      editor,
      onToggle: this.onChange,
      disabled: isDisabled,
      richTextAPI,
      canAutoFocus: this.isReadyToSetFocusProgrammatically,
    };
    const { field } = richTextAPI.sdk;
    const { isAnyHyperlinkEnabled, isAnyListEnabled, isAnyMarkEnabled } = this.state;
    const currentBlockType = props.editor.value.blocks.getIn([0, 'type']);
    return (
      <Flex testId="toolbar" className={styles.toolbar} alignItems="center">
        <div className={styles.formattingOptionsWrapper}>
          <HeadingDropdown
            onOpen={this.openHeadingMenu}
            isToggleActive={true}
            isOpen={this.state.headingMenuOpen}
            onClose={this.closeHeadingMenu}
            currentBlockType={currentBlockType}
            disabled={props.disabled}>
            <Paragraph {...props} />
            {isNodeTypeEnabled(field, BLOCKS.HEADING_1) && <Heading1 {...props} />}
            {isNodeTypeEnabled(field, BLOCKS.HEADING_2) && <Heading2 {...props} />}
            {isNodeTypeEnabled(field, BLOCKS.HEADING_3) && <Heading3 {...props} />}
            {isNodeTypeEnabled(field, BLOCKS.HEADING_4) && <Heading4 {...props} />}
            {isNodeTypeEnabled(field, BLOCKS.HEADING_5) && <Heading5 {...props} />}
            {isNodeTypeEnabled(field, BLOCKS.HEADING_6) && <Heading6 {...props} />}
          </HeadingDropdown>
          {isAnyMarkEnabled && <span className={styles.divider} data-test-id="mark-divider" />}
          {isMarkEnabled(field, MARKS.BOLD) && <Bold {...props} />}
          {isMarkEnabled(field, MARKS.ITALIC) && <Italic {...props} />}
          {isMarkEnabled(field, MARKS.UNDERLINE) && <Underlined {...props} />}
          {isMarkEnabled(field, MARKS.CODE) && <Code {...props} />}
          {isAnyHyperlinkEnabled && (
            <React.Fragment>
              <span className={styles.divider} data-test-id="hyperlink-divider" />
              <Hyperlink {...props} />
            </React.Fragment>
          )}
          {isAnyListEnabled && <span className={styles.divider} data-test-id="list-divider" />}
          {isNodeTypeEnabled(field, BLOCKS.UL_LIST) && <UnorderedList {...props} />}
          {isNodeTypeEnabled(field, BLOCKS.OL_LIST) && <OrderedList {...props} />}
          {isNodeTypeEnabled(field, BLOCKS.QUOTE) && <Quote {...props} />}
          {isNodeTypeEnabled(field, BLOCKS.HR) && <Hr {...props} />}
        </div>
        {this.renderEmbeds(props)}
      </Flex>
    );
  }
}

function getValidationInfo(field) {
  const isAnyMarkEnabled =
    isMarkEnabled(field, MARKS.BOLD) ||
    isMarkEnabled(field, MARKS.ITALIC) ||
    isMarkEnabled(field, MARKS.UNDERLINE) ||
    isMarkEnabled(field, MARKS.CODE);

  const isAnyHyperlinkEnabled =
    isNodeTypeEnabled(field, INLINES.HYPERLINK) ||
    isNodeTypeEnabled(field, INLINES.ASSET_HYPERLINK) ||
    isNodeTypeEnabled(field, INLINES.ENTRY_HYPERLINK);

  const isAnyListEnabled =
    isNodeTypeEnabled(field, BLOCKS.UL_LIST) ||
    isNodeTypeEnabled(field, BLOCKS.OL_LIST) ||
    isNodeTypeEnabled(field, BLOCKS.QUOTE) ||
    isNodeTypeEnabled(field, BLOCKS.HR);
  return {
    isAnyMarkEnabled,
    isAnyHyperlinkEnabled,
    isAnyListEnabled,
  };
}
