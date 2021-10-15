import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BLOCKS } from '@contentful/rich-text-types';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';

import { Button, Menu } from '@contentful/f36-components';

import { ChevronDownIcon } from '@contentful/f36-icons';

const styles = {
  root: css({
    padding: 0,
    marginRight: tokens.spacing2Xs,
    width: '110px',

    [`@media (min-width: ${tokens.contentWidthDefault})`]: {
      width: '145px',
    },
  }),
};

export const blockTitles = {
  [BLOCKS.HEADING_1]: 'Heading 1',
  [BLOCKS.HEADING_2]: 'Heading 2',
  [BLOCKS.HEADING_3]: 'Heading 3',
  [BLOCKS.HEADING_4]: 'Heading 4',
  [BLOCKS.HEADING_5]: 'Heading 5',
  [BLOCKS.HEADING_6]: 'Heading 6',
  [BLOCKS.PARAGRAPH]: 'Normal Text',
  [BLOCKS.EMBEDDED_ENTRY]: 'Embedded Entry',
  [BLOCKS.EMBEDDED_ASSET]: 'Embedded Asset',
};

class HeadingDropdown extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
    currentBlockType: PropTypes.string,
  };
  getStyleNameForChange = () => {
    return blockTitles[this.props.currentBlockType] || blockTitles[BLOCKS.PARAGRAPH];
  };

  render() {
    const { onOpen, isOpen, onClose, children } = this.props;
    return (
      <Menu isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
        <Menu.Trigger>
          <Button
            endIcon={<ChevronDownIcon />}
            data-test-id="toolbar-heading-toggle"
            className={styles.root}
            variant="transparent"
            size="small"
            isDisabled={this.props.disabled}>
            {this.getStyleNameForChange()}
          </Button>
        </Menu.Trigger>
        <Menu.List className="toolbar-heading-dropdown-list">{children}</Menu.List>
      </Menu>
    );
  }
}

export default HeadingDropdown;
