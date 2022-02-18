import * as contentfulSlateJSAdapter from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

import Schema from '../../constants/Schema';
import { TrackingProvider } from '../../TrackingProvider';
import { RichTextEditor, RichTextPlugin } from '../../types';

function getCharacterCount(editor: RichTextEditor) {
  const document = contentfulSlateJSAdapter.toContentfulDocument({
    document: editor.children,
    schema: Schema,
  });

  return documentToPlainTextString(document).length;
}

export const createTrackingPlugin = (tracking: TrackingProvider): RichTextPlugin => ({
  key: 'TrackingPlugin',
  withOverrides: (editor) => {
    const { insertData } = editor;

    editor.tracking = tracking;

    editor.insertData = (data) => {
      const isCopyAndPaste = data.types.length !== 0;
      if (isCopyAndPaste) {
        const characterCountSelection = window.getSelection()?.toString().length;
        const characterCountBefore = getCharacterCount(editor);

        setTimeout(() => {
          const characterCountAfter = getCharacterCount(editor);

          tracking.onShortcutAction('paste', {
            characterCountAfter,
            characterCountBefore,
            characterCountSelection,
          });
        });
      }

      insertData(data);
    };

    return editor;
  },
});
