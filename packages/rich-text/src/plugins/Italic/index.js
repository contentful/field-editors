import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';
import { FormatItalicIcon } from '@contentful/f36-icons';

export const ItalicPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.ITALIC,
    tagName: 'em',
    hotkey: ['mod+i'],
    richTextAPI,
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
  children: <FormatItalicIcon />,
})(Italic);
