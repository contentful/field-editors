import * as contentfulSlateJSAdapter from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { PlateEditor } from '@udecode/plate-core';

import Schema from '../../constants/Schema';

export function getCharacterCount(editor: PlateEditor) {
  const document = contentfulSlateJSAdapter.toContentfulDocument({
    document: editor.children,
    schema: Schema,
  });

  return documentToPlainTextString(document).length;
}
