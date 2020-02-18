import { getCharacterCount } from './Paste';
import * as contentfulSlateJSAdapter from '@contentful/contentful-slatejs-adapter';
import * as richTextPlainTextRenderer from '@contentful/rich-text-plain-text-renderer';
import schema from '../../constants/Schema';

describe('PastePlugin utils', () => {
  describe('getCharacterCount', () => {
    beforeEach(() => {
      jest.spyOn(contentfulSlateJSAdapter, 'toContentfulDocument').mockImplementationOnce(args => {
        if (args.document === 'document-json' && args.schema === schema) {
          return 'contentful-document';
        }
      });
      jest
        .spyOn(richTextPlainTextRenderer, 'documentToPlainTextString')
        .mockImplementationOnce(arg => {
          if (arg === 'contentful-document') {
            return 'x'.repeat(2342);
          }
        });
    });

    it("returns the character count of the editor's plain text state", () => {
      const editor = {
        value: {
          document: {
            toJSON: () => 'document-json'
          }
        }
      };
      const result = getCharacterCount(editor);
      expect(result).toBe(2342);
    });
  });
});
