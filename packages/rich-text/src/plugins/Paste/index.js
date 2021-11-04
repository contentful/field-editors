import { getCharacterCount } from './Paste';

/**
 * This plugin tracks the character count before and after a paste event,
 * including the text selected during the event. This creates parity with our
 * tracking for the markdown editor.
 */
export const PastePlugin = ({ richTextAPI: { logShortcutAction } }) => ({
  onPaste(_event, editor, next) {
    const characterCountSelection = global.getSelection().toString().length;
    const characterCountBefore = getCharacterCount(editor);

    setTimeout(() => {
      const characterCountAfter = getCharacterCount(editor);
      logShortcutAction('paste', {
        characterCountAfter,
        characterCountBefore,
        characterCountSelection,
      });
    });
    next();
    return;
  },
});
