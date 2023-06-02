import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / Insert Special Character Dialog', () => {
  const selectors = {
    getInput: () => {
      return getIframe().findByTestId('markdown-textarea').find('[contenteditable]');
    },
    getDialogTitle() {
      return getIframe().findByTestId('dialog-title').find('h2');
    },
    getToggleAdditionalActionsButton: () => {
      return getIframe().findByTestId('markdown-action-button-toggle-additional');
    },
    getModalContent() {
      return getIframe().findByTestId('insert-special-character-modal');
    },
    getInsertCharacterButton() {
      return getIframe().findByTestId('markdown-action-button-special');
    },
    getConfirmButton() {
      return getIframe().findByTestId('insert-character-confirm');
    },
    getCancelButton() {
      return getIframe().findByTestId('insert-character-cancel');
    },
    getSpecialCharacterButtons() {
      return getIframe().findAllByTestId('special-character-button');
    },
    getCharButton(char: string) {
      return getIframe().findByText(char);
    },
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
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
  });

  it('should insert first charter by default', () => {
    checkValue('');
    openDialog();
    selectors.getConfirmButton().click();
    checkValue('´');
  });

  it('should include any selected character', () => {
    checkValue('');
    openDialog();
    selectors.getSpecialCharacterButtons().should('have.length', 54);
    insertSpecialCharacter('¼');

    openDialog();
    insertSpecialCharacter('€');
    checkValue('¼€');
  });

  it('should include nothing if dialog was just closed', () => {
    checkValue('');
    openDialog();
    selectors.getCancelButton().click();
    checkValue('');
  });
});
