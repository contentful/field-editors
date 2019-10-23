describe('JSON Editor', () => {
  const type = value => {
    cy.get('@input').type(value, { force: true });
    cy.wait(500);
  };

  const checkCode = value => {
    cy.get('@code').should($div => {
      expect($div.get(0).innerText).to.eq(value);
    });
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

  it('should undo and redo properly', () => {
    cy.get('@undoButton').should('be.disabled');
    cy.get('@redoButton').should('be.disabled');

    type('{ "foo": ');
    type('"bar" }');

    cy.get('@undoButton').should('not.be.disabled');
    cy.get('@redoButton').should('be.disabled');

    cy.get('@undoButton').click();
    cy.get('@redoButton').should('not.be.disabled');

    checkCode('{ "foo": "bar" ');

    cy.get('@undoButton').click();

    checkCode('{ "foo": ');

    cy.get('@redoButton')
      .click()
      .click();

    cy.get('@redoButton').should('be.disabled');

    checkCode('{ "foo": "bar" }');
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: { foo: 'bar' } },
      { id: 3, type: 'setValue', value: { foo: 'bar' } },
      { id: 2, type: 'onValueChanged', value: { foo: 'bar' } },
      { id: 1, type: 'setValue', value: { foo: 'bar' } }
    ]);
  });

  it('should reset field state on external change', () => {
    type('{"foo": {');
    type('"bar": "xyz" }}');

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: { foo: { bar: 'xyz' } } },
      { id: 1, type: 'setValue', value: { foo: { bar: 'xyz' } } }
    ]);

    cy.setValueExternal({ something: 'new' });
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 3, type: 'onValueChanged', value: { something: 'new' } },
      { id: 2, type: 'onValueChanged', value: { foo: { bar: 'xyz' } } },
      { id: 1, type: 'setValue', value: { foo: { bar: 'xyz' } } }
    ]);

    checkCode('{\n    "something": "new"\n}');
    cy.findByTestId('json-editor-redo').should('be.disabled');
    cy.findByTestId('json-editor-undo').should('be.disabled');
  });

  it('should show validation warning if object is invalid', () => {
    cy.findByTestId('json-editor.invalid-json').should('not.exist');

    type('{ "foo": ');

    cy.findByTestId('json-editor.invalid-json')
      .should('exist')
      .should('have.text', 'This is not valid JSON');

    type('"bar" }');

    cy.findByTestId('json-editor.invalid-json').should('not.exist');
  });
});
