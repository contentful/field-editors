import React from 'react';
import PropTypes from 'prop-types';

import { EditorToolbar, EditorToolbarDivider } from '@contentful/forma-36-react-components';

import Bold from '../plugins/Bold';
import Italic from '../plugins/Italic';
import Underlined from '../plugins/Underlined';
import Code from '../plugins/Code';
import Quote from '../plugins/Quote';
import Hyperlink from '../plugins/Hyperlink';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Paragraph,
  HeadingDropdown
} from '../plugins/Heading';

import EmbeddedEntityBlock from '../plugins/EmbeddedEntityBlock';
import EmbeddedEntryInline from '../plugins/EmbeddedEntryInline';
import EntryEmbedDropdown from '../plugins/EntryEmbedDropdown';

import { UnorderedList, OrderedList } from '../plugins/List';
import Hr from '../plugins/Hr';

import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';

import { isNodeTypeEnabled, isMarkEnabled } from '../validations';

import Visible from 'components/shared/Visible';

export default class Toolbar extends React.Component {
  static propTypes = {
    richTextAPI: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    editor: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    permissions: PropTypes.shape({
      canAccessAssets: PropTypes.bool.isRequired
    }).isRequired
  };

  state = {
    headingMenuOpen: false,
    ...getValidationInfo(this.props.richTextAPI.widgetAPI.field)
  };

  onChange = (...args) => {
    this.setState({ headingMenuOpen: false });
    this.props.onChange(...args);
  };

  toggleEmbedDropdown = () =>
    this.setState({
      isEmbedDropdownOpen: !this.state.isEmbedDropdownOpen
    });

  handleEmbedDropdownClose = () =>
    this.setState({
      isEmbedDropdownOpen: false
    });

  renderEmbeds = props => {
    const field = this.props.richTextAPI.widgetAPI.field;

    const inlineEntryEmbedEnabled = isNodeTypeEnabled(field, INLINES.EMBEDDED_ENTRY);
    const blockEntryEmbedEnabled = isNodeTypeEnabled(field, BLOCKS.EMBEDDED_ENTRY);
    const blockAssetEmbedEnabled =
      this.props.permissions.canAccessAssets && isNodeTypeEnabled(field, BLOCKS.EMBEDDED_ASSET);

    const numEnabledEmbeds = [
      inlineEntryEmbedEnabled,
      blockEntryEmbedEnabled,
      blockAssetEmbedEnabled
    ].filter(Boolean).length;

    return (
      <div className="rich-text__toolbar__embed-actions-wrapper">
        {numEnabledEmbeds > 1 ? (
          <EntryEmbedDropdown
            onToggle={this.toggleEmbedDropdown}
            isOpen={this.state.isEmbedDropdownOpen}
            disabled={props.disabled}
            onClose={this.handleEmbedDropdownClose}>
            <Visible if={blockEntryEmbedEnabled}>
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ENTRY} {...props} />
            </Visible>
            <Visible if={inlineEntryEmbedEnabled}>
              <EmbeddedEntryInline {...props} />
            </Visible>
            <Visible if={blockAssetEmbedEnabled}>
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ASSET} {...props} />
            </Visible>
          </EntryEmbedDropdown>
        ) : (
          <React.Fragment>
            <Visible if={blockEntryEmbedEnabled}>
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ENTRY} isButton {...props} />
            </Visible>
            <Visible if={inlineEntryEmbedEnabled}>
              <EmbeddedEntryInline isButton {...props} />
            </Visible>
            <Visible if={blockAssetEmbedEnabled}>
              <EmbeddedEntityBlock nodeType={BLOCKS.EMBEDDED_ASSET} isButton {...props} />
            </Visible>
          </React.Fragment>
        )}
      </div>
    );
  };

  toggleHeadingMenu = event => {
    event.preventDefault();
    this.setState({
      headingMenuOpen: !this.state.headingMenuOpen
    });
  };

  closeHeadingMenu = () =>
    this.setState({
      headingMenuOpen: false
    });

  render() {
    const { editor, isDisabled, richTextAPI } = this.props;
    const props = {
      editor,
      onToggle: this.onChange,
      onCloseEmbedMenu: this.toggleEmbedDropdown,
      disabled: isDisabled,
      richTextAPI
    };
    const { field } = richTextAPI.widgetAPI;
    const { isAnyHyperlinkEnabled, isAnyListEnabled, isAnyMarkEnabled } = this.state;
    const currentBlockType = props.editor.value.blocks.getIn([0, 'type']);
    return (
      <EditorToolbar className="rich-text__toolbar" data-test-id="toolbar">
        <div className="rich-text__toolbar__formatting-options-wrapper">
          <HeadingDropdown
            onToggle={this.toggleHeadingMenu}
            isToggleActive={true}
            isOpen={this.state.headingMenuOpen}
            onClose={this.closeHeadingMenu}
            currentBlockType={currentBlockType}
            disabled={props.disabled}>
            <Paragraph {...props} />
            <Visible if={isNodeTypeEnabled(field, BLOCKS.HEADING_1)}>
              <Heading1 {...props} className="toolbar-h1-toggle" />
            </Visible>
            <Visible if={isNodeTypeEnabled(field, BLOCKS.HEADING_2)}>
              <Heading2 {...props} />
            </Visible>
            <Visible if={isNodeTypeEnabled(field, BLOCKS.HEADING_3)}>
              <Heading3 {...props} />
            </Visible>
            <Visible if={isNodeTypeEnabled(field, BLOCKS.HEADING_4)}>
              <Heading4 {...props} />
            </Visible>
            <Visible if={isNodeTypeEnabled(field, BLOCKS.HEADING_5)}>
              <Heading5 {...props} />
            </Visible>
            <Visible if={isNodeTypeEnabled(field, BLOCKS.HEADING_6)}>
              <Heading6 {...props} />
            </Visible>
          </HeadingDropdown>
          <Visible if={isAnyMarkEnabled}>
            <EditorToolbarDivider testId="mark-divider" />
          </Visible>
          <Visible if={isMarkEnabled(field, MARKS.BOLD)}>
            <Bold {...props} />
          </Visible>
          <Visible if={isMarkEnabled(field, MARKS.ITALIC)}>
            <Italic {...props} />
          </Visible>
          <Visible if={isMarkEnabled(field, MARKS.UNDERLINE)}>
            <Underlined {...props} />
          </Visible>
          <Visible if={isMarkEnabled(field, MARKS.CODE)}>
            <Code {...props} />
          </Visible>
          <Visible if={isAnyHyperlinkEnabled}>
            <EditorToolbarDivider testId="hyperlink-divider" />
            <Hyperlink {...props} />
          </Visible>
          <Visible if={isAnyListEnabled}>
            <EditorToolbarDivider testId="list-divider" />
          </Visible>
          <Visible if={isNodeTypeEnabled(field, BLOCKS.UL_LIST)}>
            <UnorderedList {...props} />
          </Visible>
          <Visible if={isNodeTypeEnabled(field, BLOCKS.OL_LIST)}>
            <OrderedList {...props} />
          </Visible>
          <Visible if={isNodeTypeEnabled(field, BLOCKS.QUOTE)}>
            <Quote {...props} />
          </Visible>
          <Visible if={isNodeTypeEnabled(field, BLOCKS.HR)}>
            <Hr {...props} />
          </Visible>
        </div>
        {this.renderEmbeds(props)}
      </EditorToolbar>
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
    isAnyListEnabled
  };
}
