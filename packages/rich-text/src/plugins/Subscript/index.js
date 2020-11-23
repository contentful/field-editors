import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { CUSTOM_TAGS } from '../../helpers/customTags';

export const SubscriptPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: CUSTOM_TAGS.SUBSCRIPT,
    tagName: 'sub',
    hotkey: ['mod+shift+b'], // - need to decide what key combination assign
    richTextAPI,
  });
};

class Subscript extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: CUSTOM_TAGS.SUBSCRIPT,
  title: 'Subscript',
  icon: 'Subscript',
})(Subscript);
