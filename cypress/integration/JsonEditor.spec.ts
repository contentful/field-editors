describe('JSON Editor', () => {
  const type = value => {
    cy.get('@input').type(value, { force: true });
    cy.wait(500);
  };

  beforeEach(() => {
    cy.visit('/json');
    cy.findByTestId('json-editor-integration-test').should('be.visible');
    cy.findByTestId('json-editor-code-mirror').within(() => {
      cy.get('textarea').as('input');
      cy.get('.CodeMirror-code').as('code');
    });
    cy.findByTestId('json-editor-redo').as('redoButton');
    cy.findByTestId('json-editor-undo').as('undoButton');
  });

  it('should set and clear values properly', () => {
    cy.editorEvents().should('deep.equal', []);

    cy.get('@input').should('have.value', '');

    type('{}');

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: {} },
      { id: 1, type: 'setValue', value: {} }
    ]);

    type('{backspace}{backspace}');

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: undefined },
      { id: 3, type: 'removeValue', value: undefined },
      { id: 2, type: 'onValueChanged', value: {} },
      { id: 1, type: 'setValue', value: {} }
    ]);
  });

  it.only('should undo and redo properly', () => {
    cy.get('@undoButton').should('be.disabled');
    cy.get('@redoButton').should('be.disabled');

    type('{ "foo": ');
    type('"bar" }');

    cy.get('@undoButton').should('not.be.disabled');
    cy.get('@redoButton').should('be.disabled');

    cy.get('@undoButton').click();
    cy.get('@redoButton').should('not.be.disabled');

    cy.get('@code').should('have.text', '{ "foo": "bar" ');

    cy.get('@undoButton').click();

    cy.get('@code').should('have.text', '{ "foo": ');

    cy.get('@redoButton')
      .click()
      .click();

    cy.get('@redoButton').should('be.disabled');

    cy.get('@code').should('have.text', '{ "foo": "bar" }');
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: { foo: 'bar' } },
      { id: 3, type: 'setValue', value: { foo: 'bar' } },
      { id: 2, type: 'onValueChanged', value: { foo: 'bar' } },
      { id: 1, type: 'setValue', value: { foo: 'bar' } }
    ]);
  });
});
