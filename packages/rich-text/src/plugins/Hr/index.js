import React, { Component } from 'react';
import { BLOCKS } from '@contentful/rich-text-types';
import ToolbarIcon from '../shared/ToolbarIcon';
import blockSelectDecorator from '../shared/BlockSelectDecorator';
import { haveTextInSomeBlocks } from '../shared/UtilHave';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  hr: css({
    height: tokens.spacingM,
    background: 'transparent',
    position: 'relative',
    margin: `0 0 ${tokens.spacingL}`,
    '&:hover': {
      cursor: 'pointer'
    },
    '&:after': {
      content: '',
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: tokens.colorElementMid,
      top: '50%'
    }
  }),
  hrSelected: css({
    '&:after': {
      background: tokens.colorPrimary,
      '-webkit-box-shadow': `0px 0px 5px ${tokens.colorPrimary}`,
      'box-shadow': `0px 0px 5px ${tokens.colorPrimary}`
    }
  })
};

export const HrPlugin = () => {
  return {
    renderNode: (props, _editor, next) => {
      if (props.node.type === BLOCKS.HR) {
        return (
          <hr
            className={cx(styles.hr, props.isSelected && styles.hrSelected)}
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
