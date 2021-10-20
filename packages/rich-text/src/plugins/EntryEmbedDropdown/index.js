import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Menu } from '@contentful/f36-components';

import { PlusIcon, ChevronDownIcon } from '@contentful/f36-icons';

class EntryEmbedDropdown extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
  };

  render() {
    const { onOpen, isOpen, onClose, children } = this.props;
    return (
      <Menu placement="bottom-end" isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
        <Menu.Trigger>
          <Button
            endIcon={<ChevronDownIcon />}
            testId="toolbar-entry-dropdown-toggle"
            className="toolbar-entry-dropdown-toggle"
            variant="secondary"
            size="small"
            startIcon={<PlusIcon />}
            isDisabled={this.props.disabled}>
            Embed
          </Button>
        </Menu.Trigger>
        <Menu.List className="toolbar-entry-dropdown-list">{children}</Menu.List>
      </Menu>
    );
  }
}

export default EntryEmbedDropdown;
