/* eslint-disable mocha/no-setup-in-describe */
import { RichTextPage } from './RichTextPage';

describe('Rich Text Lists', () => {
  let richText: RichTextPage;

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  it('escapes hyperlink when typing at the end', () => {
    richText.editor.click();
    richText.toolbar.hyperlink.click();

    const form = richText.forms.hyperlink;

    form.linkText.type('link');
    form.linkTarget.type('https://example.com');
    form.submit.click();

    richText.editor.click().type('outside the link');

    richText.expectSnapshotValue();
  });
});
