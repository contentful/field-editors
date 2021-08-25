import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';
import { FormatUnderlinedIcon } from '@contentful/f36-icons';

export const UnderlinedPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.UNDERLINE,
    tagName: 'u',
    hotkey: ['mod+u'],
    richTextAPI,
  });
};

class Underlined extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: MARKS.UNDERLINE,
  title: 'Underline',
  children: <FormatUnderlinedIcon />,
})(Underlined);
