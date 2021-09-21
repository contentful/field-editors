import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownList } from '@contentful/forma-36-react-components';

import { Button } from "@contentful/f36-components";

import { PlusIcon, ChevronDownIcon } from "@contentful/f36-icons";

class EntryEmbedDropdown extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onToggle: PropTypes.func,
  };

  render() {
    const { onToggle, isOpen, onClose, children } = this.props;
    return (
      <Dropdown
        className="toolbar-entry-dropdown"
        position="bottom-right"
        toggleElement={
          <Button
            endIcon={<ChevronDownIcon />}
            onClick={onToggle}
            data-test-id="toolbar-entry-dropdown-toggle"
            className="toolbar-entry-dropdown-toggle"
            variant="secondary"
            size="small"
            startIcon={<PlusIcon />}
            isDisabled={this.props.disabled}>
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
