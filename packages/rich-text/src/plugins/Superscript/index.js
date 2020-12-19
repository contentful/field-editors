import React, { Component } from 'react';
import ToolbarIcon from '../shared/ToolbarIcon';
import markPlugin from '../shared/MarkPlugin';
import markToggleDecorator from '../shared/MarkToggleDecorator';
import { MARKS } from '@contentful/rich-text-types';

export const SuperscriptPlugin = ({ richTextAPI }) => {
  return markPlugin({
    type: MARKS.SUPERSCRIPT,
    tagName: 'sup',
    hotkey: ['mod+shift++'],
    richTextAPI
  });
};

class Superscript extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default markToggleDecorator({
  type: MARKS.SUPERSCRIPT,
  title: 'Superscript',
  icon: 'Superscript'
})(Superscript);
