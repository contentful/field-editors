import { checkValue, renderMarkdownEditor, type } from './utils';

describe('Markdown Editor / History', () => {
  const selectors = {
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getRedoButton() {
      return cy.findByRole('button', { name: 'Redo' });
    },
    getUndoButton() {
      return cy.findByRole('button', { name: 'Undo' });
    },
  };

  it('should redo and undo properly', () => {
    renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

    selectors.getToggleAdditionalActionsButton().click();

    type('Hello!{enter}');
    checkValue('Hello!\n');

    cy.wait(1500);
    type('This is new sentence!');

    checkValue('Hello!\nThis is new sentence!');

    selectors.getUndoButton().click();
    checkValue('Hello!\n');

    selectors.getUndoButton().click();
    cy.get('@removeValue').should('be.calledOnce');

    selectors.getRedoButton().click();
    checkValue('Hello!\n');

    selectors.getRedoButton().click();
    checkValue('Hello!\nThis is new sentence!');
  });
});
