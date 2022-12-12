import * as contentfulSlateJSAdapter from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

import Schema from '../../constants/Schema';
import { PlateEditor } from '../../internal/types';

export function getCharacterCount(editor: PlateEditor) {
  const document = contentfulSlateJSAdapter.toContentfulDocument({
    document: editor.children,
    schema: Schema,
  });

  return documentToPlainTextString(document).length;
}
