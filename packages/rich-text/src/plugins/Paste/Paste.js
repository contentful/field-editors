import * as contentfulSlateJSAdapter from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import schema from '../../constants/Schema';

export const getCharacterCount = (editor) => {
  const document = contentfulSlateJSAdapter.toContentfulDocument({
    document: editor.value.document.toJSON(),
    schema,
  });
  return documentToPlainTextString(document).length;
};
