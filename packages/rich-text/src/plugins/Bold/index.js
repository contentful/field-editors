import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';
import { FormatBoldIcon } from '@contentful/f36-icons';

export const BoldPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.BOLD,
    tagName: 'b',
    hotkey: ['mod+b'],
    richTextAPI,
  });
};

class Bold extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: MARKS.BOLD,
  title: 'Bold',
  children: <FormatBoldIcon />,
})(Bold);
