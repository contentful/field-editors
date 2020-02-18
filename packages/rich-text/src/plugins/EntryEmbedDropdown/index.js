import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownList, Button } from '@contentful/forma-36-react-components';

class EntryEmbedDropdown extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onToggle: PropTypes.func
  };

  render() {
    const { onToggle, isOpen, onClose, children } = this.props;
    return (
      <Dropdown
        className="toolbar-entry-dropdown"
        position="bottom-right"
        toggleElement={
          <Button
            onMouseDown={onToggle}
            data-test-id="toolbar-entry-dropdown-toggle"
            className="toolbar-entry-dropdown-toggle"
            indicateDropdown
            buttonType="muted"
            size="small"
            icon="Plus"
            disabled={this.props.disabled}>
            Embed
          </Button>
        }
        isOpen={isOpen}
        onClose={onClose}>
        <DropdownList className="toolbar-entry-dropdown-list">{children}</DropdownList>
      </Dropdown>
    );
  }
}

export default EntryEmbedDropdown;
