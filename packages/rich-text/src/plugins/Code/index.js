import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';
import { CodeIcon } from '@contentful/f36-icons';

export const CodePlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.CODE,
    tagName: 'code',
    hotkey: ['mod+/'],
    richTextAPI,
  });
};

class Code extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: MARKS.CODE,
  title: 'Code',
  children: <CodeIcon />,
})(Code);
