/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

describe('Rich Text Lists', () => {
  let richText: RichTextPage;

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  beforeEach(() => {
    richText = new RichTextPage();
    mountRichTextEditor();
  });

  it('escapes hyperlink when typing at the end', () => {
    richText.editor.click();
    richText.toolbar.hyperlink.click();

    const form = richText.forms.hyperlink;

    form.linkText.type('link');
    form.linkTarget.type('https://example.com');
    form.submit.click();

    richText.editor.click().type('outside the link');

    const expectedValue = doc(
      block(
        BLOCKS.PARAGRAPH,
        {},
        text(''),
        block(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('link')),
        text('outside the link')
      )
    );

    richText.expectValue(expectedValue);
  });
});
