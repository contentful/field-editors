import * as React from 'react';
import { BLOCKS } from '@contentful/rich-text-types';
import { haveBlocks } from './UtilHave';
import { TOOLBAR_PLUGIN_PROP_TYPES } from './PluginApi';

/**
 * Toggles formatting between a given node type and a plain paragraph.
 *
 * @param {slate.Editor} editor
 * @param {stirng} type
 * @returns {boolean} New toggle state after the change.
 */
export const toggleChange = (editor, type) => {
  const isActive = haveBlocks(editor, type);
  editor.setBlocks(isActive ? BLOCKS.PARAGRAPH : type);
  return !isActive;
};

const isBlockActive = (editor, type) => haveBlocks(editor, type);

export default ({
  type,
  title,
  icon,
  applyChange = toggleChange,
  isActive = isBlockActive
}) => Block => {
  return class BlockToggleDecorator extends React.Component {
    static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

    handleToggle = e => {
      const {
        editor,
        onToggle,
        richTextAPI: { logToolbarAction }
      } = this.props;
      e.preventDefault();

      const isActive = applyChange(editor, type);
      onToggle(editor);
      const actionName = isActive ? 'insert' : 'remove';
      logToolbarAction(actionName, { nodeType: type });
    };

    render() {
      const { editor, disabled, richTextAPI } = this.props;

      return (
        <Block
          type={type}
          icon={icon}
          title={title}
          onToggle={this.handleToggle}
          isActive={isActive(editor, type)}
          disabled={disabled}
          richTextAPI={richTextAPI}
        />
      );
    }
  };
};
