import { checkValue, renderMarkdownEditor } from './utils';

describe('Markdown Editor / Insert Special Character Dialog', () => {
  const selectors = {
    getInput: () => {
      return cy.findByTestId('markdown-textarea').find('[contenteditable]');
    },
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h2');
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getModalContent() {
      return cy.findByTestId('insert-special-character-modal');
    },
    getInsertCharacterButton() {
      return cy.findByRole('button', { name: 'Insert special character' });
    },
    getConfirmButton() {
      return cy.findByRole('button', { name: 'Insert selected' });
    },
    getCancelButton() {
      return cy.findByRole('button', { name: 'Cancel' });
    },
    getSpecialCharacterButtons() {
      return cy.findAllByTestId('special-character-button');
    },
    getCharButton(char: string) {
      return cy.findByText(char);
    },
  };

  beforeEach(() => {
    renderMarkdownEditor({ spyOnSetValue: true });
    selectors.getToggleAdditionalActionsButton().click();
  });

  function openDialog() {
    // we need to force the click here as a tooltip covers it
    selectors.getInsertCharacterButton().click({ force: true });
  }

  function insertSpecialCharacter(char: string) {
    selectors.getCharButton(char).click();
    selectors.getConfirmButton().click();
  }

  it('should have correct title', () => {
    openDialog();
    selectors.getDialogTitle().should('have.text', 'Insert special character');
    selectors.getCancelButton().click();
  });

  it('should insert first charter by default', () => {
    openDialog();
    selectors.getConfirmButton().click();
    checkValue('´');
  });

  it('should include any selected character', () => {
    openDialog();
    selectors.getSpecialCharacterButtons().should('have.length', 54);
    insertSpecialCharacter('¼');

    openDialog();
    insertSpecialCharacter('€');
    checkValue('¼€');
  });

  it('should include nothing if dialog was just closed', () => {
    openDialog();
    selectors.getCancelButton().click();
    cy.get('@setValue').should('not.be.called');
  });
});
