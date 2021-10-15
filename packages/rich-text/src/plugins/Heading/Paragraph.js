import React, { Component } from 'react';
import ToolbarDropdownListItem from '../shared/ToolbarDropdownListItem';
import { BLOCKS } from '@contentful/rich-text-types';
import blockSelectDecorator from '../shared/BlockSelectDecorator';
import { blockTitles } from './HeadingDropdown';

class Paragraph extends Component {
  render() {
    return (
      <ToolbarDropdownListItem {...this.props}>
        {blockTitles[BLOCKS.PARAGRAPH]}
      </ToolbarDropdownListItem>
    );
  }
}

export default blockSelectDecorator({
  type: BLOCKS.PARAGRAPH,
  title: blockTitles[BLOCKS.PARAGRAPH],
  shouldToggle: false,
})(Paragraph);
