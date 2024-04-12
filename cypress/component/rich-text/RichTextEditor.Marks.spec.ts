/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS, MARKS } from '@contentful/rich-text-types';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Marks', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;

  beforeEach(() => {
    richText = new RichTextPage();

    mountRichTextEditor();
  });

  const findMarkViaToolbar = (mark: string) => {
    if (mark === 'code' || mark === 'superscript' || mark === 'subscript') {
      cy.findByTestId('dropdown-toolbar-button').click();
      return cy.findByTestId(`${mark}-toolbar-button`);
    } else {
      return cy.findByTestId(`${mark}-toolbar-button`);
    }
  };

  const toggleMarkViaToolbar = (mark: string) => {
    if (mark === 'code' || mark === 'superscript' || mark === 'subscript') {
      cy.findByTestId('dropdown-toolbar-button').click();
      cy.findByTestId(`${mark}-toolbar-button`).click();
    } else {
      cy.findByTestId(`${mark}-toolbar-button`).click();
    }
  };

  it(`shows ${MARKS.BOLD}, ${MARKS.ITALIC}, ${MARKS.UNDERLINE}, ${MARKS.CODE} if not explicitly allowed`, () => {
    const sdk = createRichTextFakeSdk({ validations: [] });
    mountRichTextEditor({ sdk });
    findMarkViaToolbar(MARKS.BOLD).should('be.visible');
    findMarkViaToolbar(MARKS.ITALIC).should('be.visible');
    findMarkViaToolbar(MARKS.UNDERLINE).should('be.visible');
    findMarkViaToolbar(MARKS.CODE).should('be.visible');
  });

  [
    [MARKS.BOLD, `{${mod}}b`],
    [MARKS.ITALIC, `{${mod}}i`],
    [MARKS.UNDERLINE, `{${mod}}u`],
    [MARKS.CODE, `{${mod}}/`],
    [MARKS.SUPERSCRIPT],
    [MARKS.SUBSCRIPT],
  ].forEach(([mark, shortcut]) => {
    describe(`${mark} mark toggle via toolbar`, () => {
      it('allows writing marked text', () => {
        richText.editor.click();

        toggleMarkViaToolbar(mark);

        richText.editor.type('some text');

        const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }])));

        richText.expectValue(expectedValue);
      });

      // @TODO: FIX TEST [italic via shortcut, ]
      it('allows writing marked text by selecting text', () => {
        richText.editor.click().type('some text{selectall}');

        toggleMarkViaToolbar(mark);

        const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }])));

        richText.expectValue(expectedValue);
      });

      it('allows writing unmarked text', () => {
        richText.editor.click();

        toggleMarkViaToolbar(mark);
        toggleMarkViaToolbar(mark);

        richText.editor.type('some text');

        const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

        richText.expectValue(expectedValue);
      });

      it('allows writing unmarked text by selecting text', () => {
        richText.editor.click().type('some text{selectall}');

        toggleMarkViaToolbar(mark);

        // Wait until the mark is applied
        richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))));

        richText.editor.click().type('{selectall}');

        toggleMarkViaToolbar(mark);

        const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

        richText.expectValue(expectedValue);
      });
    });

    if (shortcut) {
      describe(`${mark} mark toggle via shortcut`, () => {
        it('allows writing marked text', () => {
          richText.editor.click().type(shortcut).type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          richText.editor.click().type('some text');

          cy.wait(100);

          richText.editor.type('{selectall}').type(shortcut);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          richText.editor.click().type(shortcut).type(shortcut).type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          richText.editor.click().type('some text');

          cy.wait(100);

          richText.editor.type('{selectall}').type(shortcut).type('{selectall}').type(shortcut);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });
      });
    }
  });

  it('should remove subscript when superscript mark is selected', () => {
    richText.editor.click().type('should only be superscript{selectall}');
    toggleMarkViaToolbar(MARKS.SUBSCRIPT);
    richText.editor.click().type('{selectall}');
    toggleMarkViaToolbar(MARKS.SUPERSCRIPT);

    const expectedValue = doc(
      block(BLOCKS.PARAGRAPH, {}, text('should only be superscript', [{ type: MARKS.SUPERSCRIPT }]))
    );
    richText.expectValue(expectedValue);
  });

  it('should remove superscript when subscript mark is selected', () => {
    richText.editor.click().type('should only be subscript{selectall}');
    toggleMarkViaToolbar(MARKS.SUPERSCRIPT);
    richText.editor.click().type('{selectall}');
    toggleMarkViaToolbar(MARKS.SUBSCRIPT);

    const expectedValue = doc(
      block(BLOCKS.PARAGRAPH, {}, text('should only be subscript', [{ type: MARKS.SUBSCRIPT }]))
    );
    richText.expectValue(expectedValue);
  });
});
