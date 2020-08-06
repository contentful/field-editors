import React, { Component } from 'react';
import ToolbarDropdownListItem from '../shared/ToolbarDropdownListItem';
import blockSelectDecorator from '../shared/BlockSelectDecorator';
import { blockTitles } from './HeadingDropdown';

export default function newHeadingDropdownItem(nodeType) {
  const title = blockTitles[nodeType];

  class Heading extends Component {
    static displayName = title.replace(/\s/g, '');
    render() {
      return (
        <ToolbarDropdownListItem {...this.props} data-test-id={nodeType}>
          {title}
        </ToolbarDropdownListItem>
      );
    }
  }

  return blockSelectDecorator({
    type: nodeType,
    title,
  })(Heading);
}
