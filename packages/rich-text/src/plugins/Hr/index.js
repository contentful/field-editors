import React, { Component } from 'react';
import { BLOCKS } from '@contentful/rich-text-types';
import ToolbarIcon from '../shared/ToolbarIcon';
import blockSelectDecorator from '../shared/BlockSelectDecorator';
import { haveTextInSomeBlocks } from '../shared/UtilHave';

export const HrPlugin = () => {
  return {
    renderNode: (props, _editor, next) => {
      if (props.node.type === BLOCKS.HR) {
        return (
          <hr
            className={props.isSelected ? 'cf-slate-hr cf-slate-hr--selected' : 'cf-slate-hr'}
            {...props.attributes}
          />
        );
      }
      return next();
    }
  };
};

class Hr extends Component {
  render() {
    return <ToolbarIcon {...this.props} />;
  }
}

export default blockSelectDecorator({
  type: BLOCKS.HR,
  title: 'HR',
  icon: 'HorizontalRule',
  applyChange: (editor, type) => {
    const hr = {
      type,
      object: 'block'
    };

    if (editor.value.blocks.size === 0 || haveTextInSomeBlocks(editor)) {
      editor.insertBlock(hr);
    } else {
      editor.setBlocks(hr);
    }

    editor.insertBlock(BLOCKS.PARAGRAPH).focus();
  }
})(Hr);
