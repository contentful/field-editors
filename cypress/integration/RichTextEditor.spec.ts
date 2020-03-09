// @ts-ignore
const { MARKS, BLOCKS } = require('@contentful/rich-text-types');
// @ts-ignore
const { document: doc, block, text } = require('../../packages/rich-text/src/helpers/nodeFactory');

function expectRichTextFieldValue(expectedValue) {
  cy.getRichTextField().then(field => {
    expect(field.getValue()).to.deep.eq(expectedValue);
  });

  cy.editorEvents().should('include', { id: 1, type: 'setValue', value: expectedValue });
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

  describe('Marks', () => {
    [
      [MARKS.BOLD, `{${mod}}b`],
      [MARKS.ITALIC, `{${mod}}i`]
      // TODO: debug failing tests for 'underline' and 'code' marks
      // [MARKS.UNDERLINE, `{${mod}}u`],
      // [MARKS.CODE, `{${mod}}/`]
    ].forEach(([mark, shortcut]) => {
      const toggleMarkViaToolbar = () => cy.findByTestId(`toolbar-toggle-${mark}`).click();
      const toggleMarkViaShortcut = () => editor.type(shortcut);

      [
        ['toolbar', toggleMarkViaToolbar],
        ['shortcut', toggleMarkViaShortcut]
      ].forEach(([toggleType, toggleMark]) => {
        describe(`${mark} mark toggle via ${toggleType}`, () => {
          it('allows writing marked text', () => {
            editor.click();

            // @ts-ignore
            toggleMark();
            // TODO: this click should not be needed
            editor.click().type('some text');

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

            // TODO: this click should not be needed
            editor.click().type('some text');

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
