import React, { Component } from 'react';
import { INLINES } from '@contentful/rich-text-types';
import ToolbarIcon from '../shared/ToolbarIcon';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';
import { toolbarActionHandlerWithSafeAutoFocus } from '../shared/Util';
import { hasHyperlink, toggleLink, hasOnlyHyperlinkInlines } from './Util';
import { LinkIcon } from '@contentful/f36-icons';

export default class HyperlinkToolbarIcon extends Component {
  static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

  handleClick = toolbarActionHandlerWithSafeAutoFocus(this, async () => {
    const {
      onToggle,
      editor,
      richTextAPI: { sdk, logToolbarAction },
    } = this.props;
    await toggleLink(editor, sdk, logToolbarAction);
    onToggle(editor);
  });

  render() {
    const { disabled, editor } = this.props;
    const isDisabled = disabled || !hasOnlyHyperlinkInlines(editor.value);
    return (
      <ToolbarIcon
        disabled={isDisabled}
        type={INLINES.HYPERLINK}
        title="Hyperlink"
        onToggle={this.handleClick}
        isActive={hasHyperlink(editor.value)}>
        <LinkIcon />
      </ToolbarIcon>
    );
  }
}
