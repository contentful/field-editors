import * as contentfulSlateJSAdapter from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

import Schema from '../../constants/Schema';
import { PlateEditor } from '../../internal/types';

export function getCharacterCount(editor: PlateEditor) {
  const document = contentfulSlateJSAdapter.toContentfulDocument({
    // eslint-disable-next-line -- parameter type is not exported @typescript-eslint/no-explicit-any
    document: editor.children as any,
    schema: Schema,
  });

  return documentToPlainTextString(document).length;
}
