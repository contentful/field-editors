describe('Markdown Editor / History', () => {
  const selectors = {
    getInput: () => {
      return cy.get('[data-test-id="markdown-textarea"] textarea');
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getRedoButton() {
      return cy.findByTestId('markdown-action-button-redo');
    },
    getUndoButton() {
      return cy.findByTestId('markdown-action-button-undo');
    }
  };

  const type = value => {
    return selectors.getInput().type(value, { force: true });
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

  it('should redo and undo properly', () => {
    checkValue('');
    type('Hello!{enter}');
    cy.wait(1500);
    type('This is new sentence!');

    checkValue('Hello!\nThis is new sentence!');

    selectors.getUndoButton().click();
    checkValue('Hello!\n');
    selectors.getUndoButton().click();
    checkValue('');

    selectors.getRedoButton().click();
    checkValue('Hello!\n');
    selectors.getRedoButton().click();
    checkValue('Hello!\nThis is new sentence!');
  });
});
