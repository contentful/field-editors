import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownListItem, Button, Icon } from '@contentful/forma-36-react-components';

import { selectEntityAndInsert } from './Util';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';
import { toolbarActionHandlerWithSafeAutoFocus } from '../shared/Util';

export default class EntityLinkToolbarIcon extends Component {
  static propTypes = {
    ...TOOLBAR_PLUGIN_PROP_TYPES,
    isButton: PropTypes.bool,
  };

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
      nodeType,
      richTextAPI: { sdk, logToolbarAction },
    } = this.props;
    await selectEntityAndInsert(nodeType, sdk, editor, logToolbarAction);
    this.props.onToggle(editor);
  });

  render() {
    const { nodeType } = this.props;
    const type = getEntityTypeFromNodeType(nodeType);
    const baseClass = `rich-text__${nodeType}`;
    return this.props.isButton ? (
      <Button
        disabled={this.props.disabled}
        className={`${baseClass}-button`}
        size="small"
        onClick={this.handleClick}
        icon={type === 'Asset' ? 'Asset' : 'EmbeddedEntryBlock'}
        buttonType="muted"
        testId={`toolbar-toggle-${nodeType}`}>
        {`Embed ${type.toLowerCase()}`}
      </Button>
    ) : (
      <DropdownListItem
        isDisabled={this.props.disabled}
        className={`${baseClass}-list-item`}
        size="small"
        onClick={this.handleClick}
        testId={`toolbar-toggle-${nodeType}`}>
        <div className="cf-flex-grid">
          <Icon
            icon={type === 'Asset' ? 'Asset' : 'EmbeddedEntryBlock'}
            className="rich-text__embedded-entry-list-icon"
            color="secondary"
          />
          {type}
        </div>
      </DropdownListItem>
    );
  }
}

/**
 * Returns the entity type depending on the given node type.
 * @param {string} nodeType
 * @returns {string}
 */
function getEntityTypeFromNodeType(nodeType) {
  const words = nodeType.toLowerCase().split('-');
  if (words.includes('entry')) {
    return 'Entry';
  }
  if (words.includes('asset')) {
    return 'Asset';
  }
  throw new Error(`Node type \`${nodeType}\` has no associated \`entityType\``);
}
