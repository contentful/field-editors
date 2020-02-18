import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';

export const UnderlinedPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.UNDERLINE,
    tagName: 'u',
    hotkey: ['mod+u'],
    richTextAPI
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
  icon: 'FormatUnderlined'
})(Underlined);
