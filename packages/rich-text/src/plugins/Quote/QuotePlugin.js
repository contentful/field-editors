import isHotkey from 'is-hotkey';
import { BLOCKS } from '@contentful/rich-text-types';
import { applyChange, isSelectionInQuote } from './Util';
import commonNode from '../shared/NodeDecorator';
import { haveTextInSomeBlocks } from '../shared/UtilHave';

const newPlugin = (defaultType, tagName, hotkey) => ({
  type = defaultType,
  richTextAPI: { logShortcutAction }
}) => {
  return {
    renderNode: (props, _editor, next) => {
      if (props.node.type === type) {
        return commonNode(tagName)(props);
      }
      return next();
    },
    onKeyDown: (e, editor, next) => {
      if (isHotkey(hotkey, e)) {
        const isActive = applyChange(editor);
        const actionName = isActive ? 'insert' : 'remove';
        logShortcutAction(actionName, { nodeType: type });
        return;
      }
      if (isHotkey('Backspace', e) && isSelectionInQuote(editor) && !haveTextInSomeBlocks(editor)) {
        editor.unwrapBlock(BLOCKS.QUOTE).delete();
        return;
      }
      return next();
    }
  };
};

const QuotePlugin = newPlugin(BLOCKS.QUOTE, 'blockquote', ['mod+shift+1']);

export default QuotePlugin;
