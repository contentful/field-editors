import * as React from 'react';
import { haveMarks } from './UtilHave';
import { TOOLBAR_PLUGIN_PROP_TYPES } from './PluginApi';

export default ({ type, title, icon }) => Mark => {
  return class CommonToggleMark extends React.Component {
    static propTypes = TOOLBAR_PLUGIN_PROP_TYPES;

    handleToggle = e => {
      const {
        editor,
        onToggle,
        richTextAPI: { logToolbarAction }
      } = this.props;
      e.preventDefault();
      onToggle(editor.toggleMark(type));
      const action = haveMarks(editor, type) ? 'mark' : 'unmark';
      logToolbarAction(action, { markType: type });
    };

    render() {
      const { editor, disabled } = this.props;
      return (
        <Mark
          type={type}
          icon={icon}
          title={title}
          onToggle={this.handleToggle}
          isActive={haveMarks(editor, type)}
          disabled={disabled}
        />
      );
    }
  };
};
