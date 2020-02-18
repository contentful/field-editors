import * as React from 'react';
import { TOOLBAR_PLUGIN_PROP_TYPES } from '../shared/PluginApi';
import EditList from './EditListWrapper';

const applyChange = (editor, type, logAction) => {
  const {
    utils,
    changes: { unwrapList, wrapInList }
  } = EditList();

  if (utils.isSelectionInList(editor.value)) {
    if (utils.getCurrentList(editor.value).type !== type) {
      const currentList = utils.getCurrentList(editor.value);
      editor.setNodeByKey(currentList.key, type);
      logAction('insert', { nodeType: type });
    } else {
      unwrapList(editor);
      logAction('remove', { nodeType: type });
    }
  } else {
    wrapInList(editor, type);
    logAction('insert', { nodeType: type });
  }

  return editor.focus();
};

const isActive = (editor, type) => {
  const list = EditList().utils.getCurrentList(editor.value);

  if (list) {
    return list.type === type;
  }
  return false;
};

export default ({ type, title, icon }) => Block => {
  return class ToolbarDecorator extends React.Component {
    static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

    handleToggle = e => {
      const {
        editor,
        onToggle,
        richTextAPI: { logToolbarAction }
      } = this.props;
      e.preventDefault();
      applyChange(editor, type, logToolbarAction);
      onToggle(editor);
    };

    render() {
      const { editor } = this.props;
      return (
        <Block
          type={type}
          icon={icon}
          title={title}
          onToggle={this.handleToggle}
          isActive={isActive(editor, type)}
          disabled={this.props.disabled}
        />
      );
    }
  };
};
