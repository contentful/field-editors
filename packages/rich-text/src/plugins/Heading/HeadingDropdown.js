import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BLOCKS } from '@contentful/rich-text-types';
import { Dropdown, DropdownList, Button } from '@contentful/forma-36-react-components';

export const blockTitles = {
  [BLOCKS.HEADING_1]: 'Heading 1',
  [BLOCKS.HEADING_2]: 'Heading 2',
  [BLOCKS.HEADING_3]: 'Heading 3',
  [BLOCKS.HEADING_4]: 'Heading 4',
  [BLOCKS.HEADING_5]: 'Heading 5',
  [BLOCKS.HEADING_6]: 'Heading 6',
  [BLOCKS.PARAGRAPH]: 'Normal Text',
  [BLOCKS.EMBEDDED_ENTRY]: 'Embedded Entry',
  [BLOCKS.EMBEDDED_ASSET]: 'Embedded Asset'
};

class HeadingDropdown extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onToggle: PropTypes.func,
    currentBlockType: PropTypes.string
  };
  getStyleNameForChange = () => {
    return blockTitles[this.props.currentBlockType] || blockTitles[BLOCKS.PARAGRAPH];
  };

  render() {
    const { onToggle, isOpen, onClose, children } = this.props;
    return (
      <Dropdown
        toggleElement={
          <Button
            onMouseDown={onToggle}
            data-test-id="toolbar-heading-toggle"
            className="toolbar-heading-toggle"
            indicateDropdown
            buttonType="naked"
            size="small"
            disabled={this.props.disabled}>
            {this.getStyleNameForChange()}
          </Button>
        }
        isOpen={isOpen}
        onClose={onClose}>
        <DropdownList className="toolbar-heading-dropdown-list">{children}</DropdownList>
      </Dropdown>
    );
  }
}

export default HeadingDropdown;
