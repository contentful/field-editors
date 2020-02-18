import isHotkey from 'is-hotkey';

export default function() {
  return {
    onKeyDown(event, editor, next) {
      if (isHotkey('shift+enter', event)) {
        editor.insertText('\n');
        return;
      }
      return next();
    }
  };
}
