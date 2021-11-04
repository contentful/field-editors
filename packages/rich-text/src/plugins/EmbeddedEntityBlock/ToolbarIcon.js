import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { selectEntityAndInsert } from './Util';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';
import { toolbarActionHandlerWithSafeAutoFocus } from '../shared/Util';
import { styles } from './EmbeddedEntityBlock.styles';

import { Flex, Icon, Button, Menu } from '@contentful/f36-components';

import { AssetIcon, EmbeddedEntryBlockIcon } from '@contentful/f36-icons';

export default class EntityLinkToolbarIcon extends Component {
  static propTypes = {
    ...TOOLBAR_PLUGIN_PROP_TYPES,
    isButton: PropTypes.bool,
  };

  static defaultProps = {
    isButton: false,
  };

  handleClick = (e) => {
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
        isDisabled={this.props.disabled}
        className={`${baseClass}-button`}
        size="small"
        onClick={this.handleClick}
        startIcon={type === 'Asset' ? <AssetIcon /> : <EmbeddedEntryBlockIcon />}
        variant="secondary"
        testId={`toolbar-toggle-${nodeType}`}>
        {`Embed ${type.toLowerCase()}`}
      </Button>
    ) : (
      <Menu.Item
        disabled={this.props.disabled}
        className={`${baseClass}-list-item`}
        onClick={this.handleClick}
        testId={`toolbar-toggle-${nodeType}`}>
        <Flex alignItems="center" flexDirection="row">
          <Icon
            as={type === 'Asset' ? AssetIcon : EmbeddedEntryBlockIcon}
            className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
            variant="secondary"
          />
          <span>{type}</span>
        </Flex>
      </Menu.Item>
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
