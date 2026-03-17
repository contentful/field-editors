import {
  checkValue,
  renderMarkdownEditor,
  type,
  openAdditionalActions,
  clickVisibleButtonByName,
} from './utils';

describe('Markdown Editor / History', () => {
  const selectors = {
    getToggleAdditionalActionsButton: () => {
      return cy.findByRole('button', { name: 'More actions' });
    },
    openAdditionalActions() {
      return openAdditionalActions();
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

    selectors.openAdditionalActions().should('be.visible');

    type('Hello!{enter}');
    checkValue('Hello!\n');

    cy.get('@setValue').should('be.calledWith', 'Hello!\n');
    type('This is new sentence!');

    checkValue('Hello!\nThis is new sentence!');

    clickVisibleButtonByName('Undo');
    checkValue('Hello!\n');

    clickVisibleButtonByName('Undo');
    cy.get('@removeValue').should('be.calledOnce');

    clickVisibleButtonByName('Redo');
    checkValue('Hello!\n');

    clickVisibleButtonByName('Redo');
    checkValue('Hello!\nThis is new sentence!');
  });
});
