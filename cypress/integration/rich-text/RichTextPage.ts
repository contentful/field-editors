export class RichTextPage {
  visit() {
    cy.visit('/rich-text');

    this.editor.should('be.visible');
  }

  get editor() {
    return cy.findByTestId('rich-text-editor-integration-test').find('[data-slate-editor=true]');
  }

  get toolbar() {
    return {
      get ul() {
        return cy.findByTestId('ul-toolbar-button');
      },

      get ol() {
        return cy.findByTestId('ol-toolbar-button');
      },

      get quote() {
        return cy.findByTestId('quote-toolbar-button');
      },
    };
  }

  expectValue(expectedValue: any, editorEvents?: any) {
    cy.getRichTextField().should((field) => {
      expect(field.getValue()).to.deep.equal(expectedValue);
    });

    if (editorEvents) {
      cy.editorEvents().should('deep.include', { ...editorEvents, value: expectedValue });
    }
  }
}
