import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';

export const SubscriptPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.SUBSCRIPT,
    tagName: 'sub',
    hotkey: ['mod+='],
    richTextAPI
  });
};

class Subscript extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: MARKS.SUBSCRIPT,
  title: 'Subscript',
  icon: 'Subscript'
})(Subscript);
