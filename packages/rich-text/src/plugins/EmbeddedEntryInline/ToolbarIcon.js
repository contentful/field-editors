import React, { Component } from 'react';
import { DropdownListItem, Icon, Button } from '@contentful/forma-36-react-components';
import { INLINES } from '@contentful/rich-text-types';

import WidgetAPIContext from 'app/widgets/WidgetApi/WidgetApiContext';
import { selectEntryAndInsert, canInsertInline } from './Utils';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';

export default class EntryLinkToolbarIcon extends Component {
  static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

  static defaultProps = {
    isButton: false
  };
  handleClick = async (event, widgetAPI) => {
    this.props.onCloseEmbedMenu();
    event.preventDefault();
    const {
      editor,
      richTextAPI: { logToolbarAction }
    } = this.props;
    await selectEntryAndInsert(widgetAPI, editor, logToolbarAction);
    this.props.onToggle(editor);
  };
  render() {
    return (
      <WidgetAPIContext.Consumer>
        {({ widgetAPI }) =>
          this.props.isButton ? (
            <Button
              disabled={this.props.disabled}
              className={`${INLINES.EMBEDDED_ENTRY}-button`}
              size="small"
              onClick={event => this.handleClick(event, widgetAPI)}
              icon="EmbeddedEntryInline"
              buttonType="muted"
              testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}>
              Embed inline entry
            </Button>
          ) : (
            <DropdownListItem
              isDisabled={this.props.disabled || !canInsertInline(this.props.editor)}
              className="rich-text__entry-link-block-button"
              size="small"
              icon="Entry"
              buttonType="muted"
              testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}
              onClick={event => this.handleClick(event, widgetAPI)}>
              <div className="cf-flex-grid">
                <Icon
                  icon="EmbeddedEntryInline"
                  color="secondary"
                  className="rich-text__embedded-entry-list-icon"
                />
                Inline entry
              </div>
            </DropdownListItem>
          )
        }
      </WidgetAPIContext.Consumer>
    );
  }
}
