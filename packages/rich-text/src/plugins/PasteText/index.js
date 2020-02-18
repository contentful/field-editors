import { getEventTransfer } from 'slate-react';
import PlainSerializer from 'slate-plain-serializer';
import { BLOCKS } from '@contentful/rich-text-types';

/**
 * This plugin changes how pasting text is handled in the Rich text editor by
 * deserializing text content from ClipboardEvent into a Slate document. We
 * use it to handle converting new lines to paragraphs. Without this plugin,
 * lines of text separated by an empty new line will result in extra empty
 * paragraphs.
 */
export const PasteTextPlugin = () => {
  return {
    onPaste(event, editor, next) {
      const transfer = getEventTransfer(event);
      if (transfer.type !== 'text') {
        next();
        return;
      }

      const string = transfer.text;

      const { document } = PlainSerializer.deserialize(string, {
        defaultBlock: BLOCKS.PARAGRAPH,
        delimiter: '\n\n' // We look for double new lines as a delimiter for paragraphs
      });

      editor.insertFragment(document);
      return;
    }
  };
};
