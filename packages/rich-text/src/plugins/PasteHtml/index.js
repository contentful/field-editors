import { getEventTransfer } from 'slate-react';
import { create as createSerializer } from './Serializer';

/**
 * The plugin allows to paste html to the Structured Text Editor
 * by deserializing html content from ClipboardEvent into
 * Slate document.
 */
export const PasteHtmlPlugin = () => {
  const serializer = createSerializer();
  return {
    onPaste(event, editor, next) {
      const transfer = getEventTransfer(event);
      if (transfer.type != 'html') {
        next();
        return;
      }
      const { document } = serializer.deserialize(transfer.html);

      editor.insertFragment(document);
      return;
    },
  };
};
