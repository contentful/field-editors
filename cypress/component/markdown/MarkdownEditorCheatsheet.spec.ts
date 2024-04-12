import { renderMarkdownEditor } from './utils';

describe('Markdown Editor / Cheatsheet Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h2');
    },
    getOpenCheatsheetButton() {
      return cy.findByRole('button', { name: 'markdown cheatsheet' });
    },
    getCheatsheetContent() {
      return cy.findByTestId('markdown-cheatsheet-dialog-content');
    },
  };

  it('should be visible after user clicks on help button', () => {
    renderMarkdownEditor();
    selectors.getOpenCheatsheetButton().click();
    selectors.getCheatsheetContent().should('exist');
    selectors.getDialogTitle().should('have.text', 'Markdown formatting help');
  });
});
