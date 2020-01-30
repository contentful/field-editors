import React, { Component } from 'react';
import { INLINES } from '@contentful/rich-text-types';
import ToolbarIcon from '../shared/ToolbarIcon';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';
import { hasHyperlink, toggleLink, hasOnlyHyperlinkInlines } from './Util';

export default class HyperlinkToolbarIcon extends Component {
  static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

  handleClick = async event => {
    event.preventDefault();
    const {
      onToggle,
      editor,
      richTextAPI: { widgetAPI, logToolbarAction }
    } = this.props;
    await toggleLink(editor, widgetAPI.dialogs.createHyperlink, logToolbarAction);
    onToggle(editor);
  };

  render() {
    const { disabled, editor } = this.props;
    const isDisabled = disabled || !hasOnlyHyperlinkInlines(editor.value);
    return (
      <ToolbarIcon
        disabled={isDisabled}
        type={INLINES.HYPERLINK}
        icon="Link"
        title="Hyperlink"
        onToggle={event => this.handleClick(event)}
        isActive={hasHyperlink(editor.value)}
      />
    );
  }
}
