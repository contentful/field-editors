describe('Markdown Editor / Void elements', () => {
  const selectors = {
    getInput() {
      return cy.get('[data-test-id="markdown-textarea"] [contenteditable]');
    },
    getPreviewButton() {
      return cy.findByTestId('markdown-tab-preview');
    },
    getVoidElementsWarning() {
      return cy.findByTestId('markdown-void-elements-warning');
    },
    getPreview() {
      return cy.findByTestId('markdown-preview');
    },
  };

  const type = (value) => {
    return selectors.getInput().focus().type(value, { force: true });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
  });

  it('renders even with invalid use of void elements', () => {
    type(`
      <br>br</br>
      <link>link</link>
      <img></img>
    `);

    selectors.getPreviewButton().click();
    selectors.getPreview().should('contain.text', 'br');
    selectors.getPreview().should('contain.text', 'link');
  });
});
