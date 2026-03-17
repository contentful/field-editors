import { checkValue, renderMarkdownEditor, clickToolbarButton } from './utils';

describe('Markdown Editor / Insert Special Character Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findAllByTestId('dialog-title').last().find('h2');
    },
    getModalContent() {
      return cy.findAllByTestId('insert-special-character-modal').last();
    },
    queryModalContent() {
      return cy.get('body').find('[data-test-id="insert-special-character-modal"]');
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
        .filter((_, element) => element.textContent?.trim() === char)
        .last();
    },
    getSelectedCharPreview() {
      return selectors.getModalContent().findAllByTestId('cf-ui-text').first();
    },
  };

  beforeEach(() => {
    renderMarkdownEditor({ spyOnSetValue: true });
    cy.get('body').then(($body) => {
      if ($body.find('[data-test-id="insert-special-character-modal"]').length > 0) {
        selectors.getCancelButton().click();
        selectors.queryModalContent().should('not.exist');
      }
    });
    clickToolbarButton('markdown-action-button-toggle-additional');
    openDialog();
  });

  function openDialog() {
    clickToolbarButton('markdown-action-button-special');
  }

  function insertSpecialCharacter(char: string) {
    selectors.getCharButton(char).click();
    selectors.getCharButton(char).should('have.class', 'css-l8bxk9');
    selectors.getSelectedCharPreview().should('have.text', char);
    selectors.getConfirmButton().click();
  }

  it('should have correct title', () => {
    selectors.getDialogTitle().should('have.text', 'Insert special character');
    selectors.getCancelButton().click();
    selectors.queryModalContent().should('not.exist');
  });

  it('should insert first charter by default', () => {
    selectors.getConfirmButton().click();
    selectors.queryModalContent().should('not.exist');
    checkValue('´');
  });

  it('should include any selected character', () => {
    selectors.getSpecialCharacterButtons().should('have.length', 54);
    insertSpecialCharacter('¼');

    openDialog();
    insertSpecialCharacter('€');
    checkValue('¼€');
  });

  it('should include nothing if dialog was just closed', () => {
    selectors.getCancelButton().click();
    selectors.queryModalContent().should('not.exist');
    cy.get('@setValue').should('not.be.called');
  });
});
