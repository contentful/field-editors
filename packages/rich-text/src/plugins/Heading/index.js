import isHotkey from 'is-hotkey';
import { BLOCKS } from '@contentful/rich-text-types';
import { toggleChange } from '../shared/BlockToggleDecorator';
import CommonNode from '../shared/NodeDecorator';

const newPlugin = (defaultType, tagName, hotkey) => ({ type = defaultType, richTextAPI }) => ({
  renderNode: (props, _editor, next) => {
    if (props.node.type === type) {
      return CommonNode(tagName, { className: 'cf-slate-heading' })(props);
    }
    return next();
  },
  onKeyDown: (e, editor, next) => {
    if (isHotkey('enter', e)) {
      const currentBlock = editor.value.blocks.get(0);
      if (currentBlock.type === type) {
        const { value } = editor;

        if (value.selection.start.offset === 0) {
          const initialRange = value.selection;
          editor.splitBlock().setBlocksAtRange(initialRange, BLOCKS.PARAGRAPH);
        } else {
          editor.splitBlock().setBlocks(BLOCKS.PARAGRAPH);
        }

        return;
      }
    } else if (isHotkey(hotkey, e)) {
      const isActive = toggleChange(editor, type);
      const actionName = isActive ? 'insert' : 'remove';
      richTextAPI.logShortcutAction(actionName, { nodeType: type });
      return;
    }
    return next();
  }
});

// TODO: move hotkeys to components
export const Heading1Plugin = newPlugin(BLOCKS.HEADING_1, 'h1', ['mod+opt+1']);
export const Heading2Plugin = newPlugin(BLOCKS.HEADING_2, 'h2', ['mod+opt+2']);
export const Heading3Plugin = newPlugin(BLOCKS.HEADING_3, 'h3', ['mod+opt+3']);
export const Heading4Plugin = newPlugin(BLOCKS.HEADING_4, 'h4', ['mod+opt+4']);
export const Heading5Plugin = newPlugin(BLOCKS.HEADING_5, 'h5', ['mod+opt+5']);
export const Heading6Plugin = newPlugin(BLOCKS.HEADING_6, 'h6', ['mod+opt+6']);

export { default as Heading1 } from './Heading1';
export { default as Heading2 } from './Heading2';
export { default as Heading3 } from './Heading3';
export { default as Heading4 } from './Heading4';
export { default as Heading5 } from './Heading5';
export { default as Heading6 } from './Heading6';
export { default as Paragraph } from './Paragraph';
export { default as HeadingDropdown } from './HeadingDropdown';
