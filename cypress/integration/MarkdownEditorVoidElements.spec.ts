describe('Markdown Editor / Void elements', () => {
  const selectors = {
    getInput() {
      return cy.get('[data-test-id="markdown-textarea"] textarea');
    },
    getPreviewButton() {
      return cy.findByTestId('markdown-tab-preview');
    },
    getVoidElementsWarning() {
      return cy.findByTestId('markdown-void-elements-warning');
    },
    getPreview() {
      return cy.findByTestId('markdown-preview');
    }
  };

  const type = value => {
    return selectors.getInput().type(value, { force: true });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
  });

  it('renders warning if void elements are used', () => {
    type('<link>link children</link>');

    selectors.getPreviewButton().click();

    selectors.getVoidElementsWarning().should('be.visible');
    selectors.getPreview().should('not.contain.text', 'link children');
  });

  it('does not render warning if void elements are able to render', () => {
    type('<link>link children');

    selectors.getPreviewButton().click();

    selectors.getVoidElementsWarning().should('not.be.visible');
    selectors.getPreview().should('contain.text', 'link children');
  });
});
