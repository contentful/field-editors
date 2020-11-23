import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { CUSTOM_TAGS } from '../../helpers/customTags';

export const SuperscriptPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: CUSTOM_TAGS.SUPERSCRIPT,
    tagName: 'sup',
    hotkey: ['mod+shift+s'], // - need to decide what key combination assign
    richTextAPI,
  });
};

class Superscript extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: CUSTOM_TAGS.SUPERSCRIPT,
  title: 'Superscript',
  icon: 'Superscript',
})(Superscript);
