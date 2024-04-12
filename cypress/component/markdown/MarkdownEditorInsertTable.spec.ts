import { checkValue, clearAll, renderMarkdownEditor } from './utils';

describe('Markdown Editor / Insert Table Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h2');
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getInsertTableButton() {
      return cy.findByRole('button', { name: 'Insert table' });
    },
    getModalContent() {
      return cy.findByTestId('insert-table-modal');
    },
    inputs: {
      getRowsInput() {
        return cy.findByRole('spinbutton', { name: 'Number of rows(required)' });
      },
      getColsInput() {
        return cy.findByRole('spinbutton', { name: 'Number of columns(required)' });
      },
    },
    getConfirmButton() {
      return cy.findByRole('button', { name: 'Insert' });
    },
    getCancelButton() {
      return cy.findByRole('button', { name: 'Cancel' });
    },
  };

  it('should have correct title', () => {
    renderMarkdownEditor();

    selectors.getToggleAdditionalActionsButton().click();
    selectors.getInsertTableButton().click({ force: true });
    selectors.getDialogTitle().should('have.text', 'Insert table');
    selectors.getCancelButton().click();
  });

  it('should insert nothing if click on cancel button or close window with ESC', () => {
    renderMarkdownEditor({ spyOnSetValue: true });
    selectors.getToggleAdditionalActionsButton().click();

    // close with button
    selectors.getInsertTableButton().click({ force: true });
    selectors.getCancelButton().click();
    selectors.getModalContent().should('not.exist');

    // close with esc
    selectors.getInsertTableButton().click();
    selectors.inputs.getRowsInput().type('{esc}');
    selectors.getModalContent().should('not.exist');

    cy.get('@setValue').should('not.be.called');
  });

  it('should have a correct default state', () => {
    renderMarkdownEditor();

    selectors.getToggleAdditionalActionsButton().click();
    selectors.getInsertTableButton().click({ force: true });

    selectors.inputs.getRowsInput().should('have.value', '2');
    selectors.inputs.getColsInput().should('have.value', '1');

    selectors.getConfirmButton().should('not.be.disabled');
    selectors.getCancelButton().click();
  });

  it('should validate incorrect values', () => {
    renderMarkdownEditor();

    selectors.getToggleAdditionalActionsButton().click();
    selectors.getInsertTableButton().click({ force: true });

    selectors.inputs.getRowsInput().focus().type('{selectall}').type('1');

    cy.findByText('Should be between 2 and 100').should('be.visible');

    selectors.inputs.getColsInput().focus().type('{selectall}').type('100');

    cy.findByText('Should be between 1 and 100').should('be.visible');

    selectors.getConfirmButton().should('be.disabled');
    selectors.getCancelButton().click();
  });

  it('should insert table with correct number rows and cols', () => {
    renderMarkdownEditor({ spyOnRemoveValue: true, spyOnSetValue: true });
    selectors.getToggleAdditionalActionsButton().click();

    selectors.getInsertTableButton().click({ force: true });
    selectors.getConfirmButton().click();
    checkValue('\n| Header     |\n| ---------- |\n| Cell       |\n| Cell       |\n');

    clearAll();

    selectors.getInsertTableButton().click();
    selectors.inputs.getRowsInput().focus().type('{selectall}').type('3');
    selectors.inputs.getColsInput().focus().type('{selectall}').type('2');
    selectors.getConfirmButton().click();
    checkValue(
      '\n| Header     | Header     |\n| ---------- | ---------- |\n| Cell       | Cell       |\n| Cell       | Cell       |\n| Cell       | Cell       |\n'
    );
  });
});
