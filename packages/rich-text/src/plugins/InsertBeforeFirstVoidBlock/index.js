import isHotkey from 'is-hotkey';
import { isVoidBlockFirstAndFocused, insertParagraphAndFocusToStartOfDocument } from './Util';

/**
 *  Provides a way to insert content before the first void block in the document.
 */
export const InsertBeforeFirstVoidBlockPlugin = () => ({
  onKeyDown: (event, editor, next) => {
    if (isHotkey('enter', event) && isVoidBlockFirstAndFocused(editor)) {
      insertParagraphAndFocusToStartOfDocument(editor);
      return;
    }

    return next();
  }
});
