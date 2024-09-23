import { BLOCKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { emptyParagraph, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - HR', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;
  const expectDocumentToBeEmpty = () => richText.expectValue(undefined);

  function addBlockquote(content = '') {
    richText.editor.click().type(content);

    richText.toolbar.quote.click();

    const expectedValue = doc(
      block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text(content, []))),
      block(BLOCKS.PARAGRAPH, {}, text('', []))
    );

    richText.expectValue(expectedValue);

    return expectedValue;
  }

  beforeEach(() => {
    richText = new RichTextPage();

    mountRichTextEditor();
  });

  describe('toolbar button', () => {
    it('should be visible', () => {
      richText.toolbar.hr.should('be.visible');
    });

    it('should add a new line when clicking', () => {
      richText.editor.click().type('some text');

      richText.toolbar.hr.click();

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
        block(BLOCKS.HR, {}),
        block(BLOCKS.PARAGRAPH, {}, text('', []))
      );

      richText.expectValue(expectedValue);
    });

    it('should end with an empty paragraph', () => {
      richText.editor.click().type('some text');

      richText.toolbar.hr.click();
      richText.toolbar.hr.click();
      richText.toolbar.hr.click();

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
        block(BLOCKS.HR, {}),
        block(BLOCKS.HR, {}),
        block(BLOCKS.HR, {}),
        block(BLOCKS.PARAGRAPH, {}, text('', []))
      );

      richText.expectValue(expectedValue);
    });

    it('should split blockquote', () => {
      addBlockquote('some text');

      richText.editor.type('{enter}some text{uparrow}');

      richText.toolbar.hr.click();

      const expectedValue = doc(
        block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
        block(BLOCKS.HR, {}),
        block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
        block(BLOCKS.PARAGRAPH, {}, text('', []))
      );

      richText.expectValue(expectedValue);
    });

    // TODO: Seems to be failing on CI
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('should add line if HR is the first void block', () => {
      richText.editor.click();

      richText.toolbar.hr.click();

      // Not necessary for the test but here to "force" waiting until
      // we have the expected document structure
      richText.expectValue(doc(block(BLOCKS.HR, {}), block(BLOCKS.PARAGRAPH, {}, text('', []))));

      // Move arrow up to select the HR then press ENTER
      richText.editor.click().type('{uparrow}{enter}');

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text('', [])),
        block(BLOCKS.HR, {}),
        block(BLOCKS.PARAGRAPH, {}, text('', []))
      );

      richText.expectValue(expectedValue);
    });

    it('should select all and delete if HR is the first void block', () => {
      richText.editor.click();

      richText.toolbar.hr.click();

      richText.editor.click().type('hey').type('{selectall}{del}');

      // editor is empty
      richText.expectValue(undefined);
    });

    it('should be selected on backspace', () => {
      richText.editor.click();

      richText.toolbar.hr.click();
      richText.editor.type('X');

      richText.expectValue(doc(block(BLOCKS.HR, {}), paragraphWithText('X')));

      richText.editor.type('{backspace}{backspace}');

      richText.expectValue(doc(block(BLOCKS.HR, {}), emptyParagraph()));

      richText.editor.type('{backspace}');

      expectDocumentToBeEmpty();
    });
  });
});
