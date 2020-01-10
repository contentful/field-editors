describe('Markdown Editor / Insert Special Character Dialog', () => {
  const selectors = {
    getInput: () => {
      return cy.findByTestId('markdown-textarea').get('textarea');
    },
    getDialogTitle() {
      return cy.findByTestId('markdown-dialog-title').within(() => {
        return cy.get('h1');
      });
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getModalContent() {
      return cy.findByTestId('insert-special-character-modal');
    },
    getInsertCharacterButton() {
      return cy.findByTestId('markdown-action-button-special');
    },
    getConfirmButton() {
      return cy.findByTestId('insert-character-confirm');
    },
    getCancelButton() {
      return cy.findByTestId('insert-character-cancel');
    },
    getSpecialCharacterButtons() {
      return cy.findAllByTestId('special-character-button');
    }
  };

  const checkValue = value => {
    cy.getMarkdownInstance().then(markdown => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
    selectors.getToggleAdditionalActionsButton().click();
  });

  function openDialog() {
    selectors.getInsertCharacterButton().click();
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
    selectors
      .getSpecialCharacterButtons()
      .eq(10)
      .click();
    selectors.getConfirmButton().click();

    openDialog();
    selectors
      .getSpecialCharacterButtons()
      .eq(30)
      .click();
    selectors.getConfirmButton().click();
    checkValue('¼€');
  });

  it('should include nothing if dialog was just closed', () => {
    checkValue('');
    openDialog();
    selectors.getCancelButton().click();
    checkValue('');
  });
});
