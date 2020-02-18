import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';

export const ItalicPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.ITALIC,
    tagName: 'em',
    hotkey: ['mod+i'],
    richTextAPI
  });
};

class Italic extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: MARKS.ITALIC,
  title: 'Italic',
  icon: 'FormatItalic'
})(Italic);
