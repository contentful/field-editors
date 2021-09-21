import React, { Component } from 'react';
import { DropdownListItem } from '@contentful/forma-36-react-components';
import { INLINES } from '@contentful/rich-text-types';

import { selectEntryAndInsert, canInsertInline } from './Utils';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';
import { toolbarActionHandlerWithSafeAutoFocus } from '../shared/Util';
import { styles } from './EmbeddedEntryInline.styles';

import { Flex, Button } from '@contentful/f36-components';

import { EmbeddedEntryInlineIcon } from '@contentful/f36-icons';

export default class EntryLinkToolbarIcon extends Component {
  static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

  static defaultProps = {
    isButton: false,
  };

  handleClick = (e) => {
    this.props.onCloseEmbedMenu();
    this.handleAction(e);
  };

  handleAction = toolbarActionHandlerWithSafeAutoFocus(this, async () => {
    const {
      editor,
      richTextAPI: { sdk, logToolbarAction },
    } = this.props;
    await selectEntryAndInsert(sdk, editor, logToolbarAction);
    this.props.onToggle(editor);
  });

  render() {
    return this.props.isButton ? (
      <Button
        isDisabled={this.props.disabled}
        className={`${INLINES.EMBEDDED_ENTRY}-button`}
        size="small"
        onClick={(event) => this.handleClick(event)}
        startIcon={<EmbeddedEntryInlineIcon />}
        variant="secondary"
        testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}>
        Embed inline entry
      </Button>
    ) : (
      <DropdownListItem
        isDisabled={this.props.disabled || !canInsertInline(this.props.editor)}
        className="rich-text__entry-link-block-button"
        size="small"
        icon="Entry"
        testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}
        onClick={this.handleClick}>
        <Flex alignItems="center" flexDirection="row">
          <EmbeddedEntryInlineIcon
            variant="secondary"
            className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
          />
          <span>Inline entry</span>
        </Flex>
      </DropdownListItem>
    );
  }
}
