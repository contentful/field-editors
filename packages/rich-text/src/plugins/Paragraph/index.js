import isHotkey from 'is-hotkey';
import { BLOCKS } from '@contentful/rich-text-types';
import { toggleChange } from '../shared/BlockToggleDecorator';
import CommonNode from '../shared/NodeDecorator';

const plugin = (type, tagName, tagProps, hotkey) => {
  return {
    renderNode: (props, _editor, next) => {
      if (props.node.type === type) {
        return CommonNode(tagName, tagProps)(props);
      }
      return next();
    },
    onKeyDown: (e, editor, next) => {
      if (isHotkey(hotkey, e)) {
        editor.call(toggleChange, type);
        return;
      }
      return next();
    }
  };
};

// TODO: move hotkeys to components
export const ParagraphPlugin = (type = BLOCKS.PARAGRAPH) =>
  // Can't use <p/> as for e.g. links we need to show a tooltip inside.
  plugin(type, 'div', { className: 'cf-slate-paragraph' }, ['mod+opt+0']);
