describe('Markdown Editor / Insert Table Dialog', () => {
  const selectors = {
    getInput: () => {
      return cy.get('[data-test-id="markdown-textarea"] textarea');
    },
    getDialogTitle() {
      return cy.findByTestId('dialog-title').within(() => {
        return cy.get('h1');
      });
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getInsertTableButton() {
      return cy.findByTestId('markdown-action-button-table');
    },
    getModalContent() {
      return cy.findByTestId('insert-table-modal');
    },
    inputs: {
      getRowsInput() {
        return cy.findByTestId('insert-table-rows-number-field');
      },
      getColsInput() {
        return cy.findByTestId('insert-table-columns-number-field');
      },
    },
    getConfirmButton() {
      return cy.findByTestId('insert-table-confirm');
    },
    getCancelButton() {
      return cy.findByTestId('insert-table-cancel');
    },
  };

  const clearAll = () => {
    cy.getMarkdownInstance().then((markdown) => {
      markdown.clear();
    });
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
  });

  it('should have correct title', () => {
    selectors.getToggleAdditionalActionsButton().click();
    selectors.getInsertTableButton().click({ force: true });
    selectors.getDialogTitle().should('have.text', 'Insert table');
  });

  it('should insert nothing if click on cancel button or close window with ESC', () => {
    checkValue('');
    selectors.getToggleAdditionalActionsButton().click();

    // close with button
    selectors.getInsertTableButton().click({ force: true });
    selectors.getCancelButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue('');

    // close with esc
    selectors.getInsertTableButton().click();
    selectors.inputs.getRowsInput().type('{esc}');
    selectors.getModalContent().should('not.exist');
    checkValue('');
  });

  it('should have a correct default state', () => {
    checkValue('');
    selectors.getToggleAdditionalActionsButton().click();
    selectors.getInsertTableButton().click({ force: true });

    selectors.inputs.getRowsInput().should('have.value', '2');
    selectors.inputs.getColsInput().should('have.value', '1');

    selectors.getConfirmButton().should('not.be.disabled');
  });

  it('should validate incorrect values', () => {
    checkValue('');
    selectors.getToggleAdditionalActionsButton().click();
    selectors.getInsertTableButton().click({ force: true });

    selectors.inputs.getRowsInput().focus().type('{selectall}').type('1');

    cy.findByText('Should be between 2 and 100').should('be.visible');

    selectors.inputs.getColsInput().focus().type('{selectall}').type('100');

    cy.findByText('Should be between 1 and 100').should('be.visible');

    selectors.getConfirmButton().should('be.disabled');
  });

  it('should insert table with correct number rows and cols', () => {
    checkValue('');
    selectors.getToggleAdditionalActionsButton().click();

    selectors.getInsertTableButton().click({ force: true });
    selectors.getConfirmButton().click();
    checkValue('\n| Header     |\n| ---------- |\n| Cell       |\n| Cell       |\n\n');

    clearAll();

    selectors.getInsertTableButton().click();
    selectors.inputs.getRowsInput().focus().type('{selectall}').type('3');
    selectors.inputs.getColsInput().focus().type('{selectall}').type('2');
    selectors.getConfirmButton().click();
    checkValue(
      '\n| Header     | Header     |\n| ---------- | ---------- |\n| Cell       | Cell       |\n| Cell       | Cell       |\n| Cell       | Cell       |\n\n'
    );
  });
});
