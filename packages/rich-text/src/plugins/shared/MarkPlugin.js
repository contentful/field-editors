import isHotkey from 'is-hotkey';
import markDecorator from './MarkDecorator';
import { haveMarks } from './UtilHave';

export default function({ type, tagName, hotkey, richTextAPI }) {
  return {
    renderMark: (props, _editor, next) => {
      if (props.mark.type === type) {
        return markDecorator(tagName, { className: `cf-slate-mark-${type}` })(props);
      }
      return next();
    },
    onKeyDown(event, editor, next) {
      if (isHotkey(hotkey, event)) {
        editor.toggleMark(type);

        const action = haveMarks(editor, type) ? 'mark' : 'unmark';
        richTextAPI.logShortcutAction(action, { markType: type });
        return;
      }
      return next();
    }
  };
}
