import * as React from 'react';
import { haveBlocks } from './UtilHave';
import { TOOLBAR_PLUGIN_PROP_TYPES } from './PluginApi';

export default ({
  type,
  title,
  icon,
  applyChange = (editor, type) => editor.setBlocks(type)
}) => Block => {
  return class BlockSelectDecorator extends React.Component {
    static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

    handleSelect = e => {
      const {
        editor,
        onToggle,
        richTextAPI: { logToolbarAction }
      } = this.props;
      e.preventDefault();

      applyChange(editor, type);
      onToggle(editor);
      logToolbarAction('insert', { nodeType: type });
    };

    render() {
      const { editor, disabled } = this.props;

      return (
        <Block
          type={type}
          icon={icon}
          title={title}
          onToggle={this.handleSelect}
          isActive={haveBlocks(editor, type)}
          disabled={disabled}
        />
      );
    }
  };
};
