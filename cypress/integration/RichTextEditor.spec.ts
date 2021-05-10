import { MARKS, BLOCKS } from '@contentful/rich-text-types';
import { document as doc, block, text } from '../../packages/rich-text/src/helpers/nodeFactory';

function expectRichTextFieldValue(expectedValue) {
  cy.getRichTextField().then((field) => {
    expect(field.getValue()).to.deep.eq(expectedValue);
  });

  cy.editorEvents().should('deep.include', { id: 1, type: 'setValue', value: expectedValue });
}

describe('Rich Text Editor', () => {
  let editor;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const mod = IS_MAC ? 'meta' : 'control';

  beforeEach(() => {
    cy.visit('/rich-text');
    const wrapper = cy.findByTestId('rich-text-editor-integration-test').should('be.visible');
    editor = wrapper.find('[data-slate-editor=true]').should('be.visible');
  });

  it('is empty by default', () => {
    cy.editorEvents().should('deep.equal', []);
  });

  it('allows typing', () => {
    editor.click().typeInSlate('some text').click();

    cy.wait(500);

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    expectRichTextFieldValue(expectedValue);
  });

  describe('Marks', () => {
    [
      [MARKS.BOLD, `{${mod}}b`],
      [MARKS.ITALIC, `{${mod}}i`],
      [MARKS.UNDERLINE, `{${mod}}u`],
      [MARKS.CODE, `{${mod}}/`],
    ].forEach(([mark, shortcut]) => {
      // TODO: unskip when toolbar is available
      // const toggleMarkViaToolbar = () => cy.findByTestId(`toolbar-toggle-${mark}`).click();
      const toggleMarkViaShortcut = () => editor.type(shortcut);

      [
        // TODO: unskip when toolbar is available
        // ['toolbar', toggleMarkViaToolbar],
        ['shortcut', toggleMarkViaShortcut],
      ].forEach(([toggleType, toggleMark]) => {
        describe(`${mark} mark toggle via ${toggleType}`, () => {
          it('allows writing marked text', () => {
            editor.click();

            // @ts-ignore
            toggleMark();

            editor.type('some text');

            // updates to RichText value are debounced with 500
            cy.wait(500);

            const expectedValue = doc(
              block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
            );

            expectRichTextFieldValue(expectedValue);
          });

          it('allows writing unmarked text', () => {
            editor.click();
            // @ts-ignore
            toggleMark();
            // @ts-ignore
            toggleMark();

            editor.type('some text');

            // updates to RichText value are debounced with 500
            cy.wait(500);

            const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

            expectRichTextFieldValue(expectedValue);
          });
        });
      });
    });
  });
});
