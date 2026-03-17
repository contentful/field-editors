import { checkValue, renderMarkdownEditor, clickToolbarButton } from './utils';

describe('Markdown Editor / Insert Special Character Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findAllByTestId('dialog-title').last().find('h2');
    },
    getModalContent() {
      return cy.findAllByTestId('insert-special-character-modal').last();
    },
    getConfirmButton() {
      return cy.findAllByTestId('insert-character-confirm').last();
    },
    getCancelButton() {
      return cy.findAllByTestId('insert-character-cancel').last();
    },
    getSpecialCharacterButtons() {
      return selectors.getModalContent().findAllByTestId('special-character-button');
    },
    getCharButton(char: string) {
      return selectors
        .getSpecialCharacterButtons()
        .filter((_, element) => element.textContent?.trim() === char);
    },
    getSelectedCharPreview() {
      return selectors.getModalContent().findAllByTestId('cf-ui-text').first();
    },
  };

  beforeEach(() => {
    renderMarkdownEditor({ spyOnSetValue: true });
    clickToolbarButton('markdown-action-button-toggle-additional');
  });

  function openDialog() {
    clickToolbarButton('markdown-action-button-special');
  }

  function insertSpecialCharacter(char: string) {
    selectors.getCharButton(char).click({ force: true });
    selectors.getSelectedCharPreview().should('have.text', char);
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
