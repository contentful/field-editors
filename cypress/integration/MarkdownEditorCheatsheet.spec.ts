describe('Markdown Editor / Cheatsheet Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findByTestId('markdown-dialog-title').within(() => {
        return cy.get('h1');
      });
    },
    getOpenCheatsheetButton() {
      return cy.findByTestId('open-markdown-cheatsheet-button');
    },
    getCheatsheetContent() {
      return cy.findByTestId('markdown-cheatsheet-dialog-content');
    }
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
  });

  it('should be visible after user clicks on help button', () => {
    selectors.getOpenCheatsheetButton().click();
    selectors.getCheatsheetContent().should('exist');
    selectors.getDialogTitle().should('have.text', 'Markdown formatting help');
  });
});
