import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / Cheatsheet Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return getIframe().findByTestId('dialog-title').find('h2');
    },
    getOpenCheatsheetButton() {
      return getIframe().findByTestId('open-markdown-cheatsheet-button');
    },
    getCheatsheetContent() {
      return getIframe().findByTestId('markdown-cheatsheet-dialog-content');
    },
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
  });

  it('should be visible after user clicks on help button', () => {
    selectors.getOpenCheatsheetButton().click();
    selectors.getCheatsheetContent().should('exist');
    selectors.getDialogTitle().should('have.text', 'Markdown formatting help');
  });
});
