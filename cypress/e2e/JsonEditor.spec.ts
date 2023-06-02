import { getIframe } from '../fixtures/utils';

describe('JSON Editor', () => {
  const selectors = {
    getInput: () => {
      return getIframe().findByTestId('json-editor-code-mirror').find('.cm-content');
    },
    getCode: () => {
      return getIframe().findByTestId('json-editor-code-mirror').find('.cm-editor');
    },
    getRedoButton: () => {
      return getIframe().findByTestId('json-editor-redo');
    },
    getUndoButton: () => {
      return getIframe().findByTestId('json-editor-undo');
    },
    getValidationError: () => {
      return getIframe().findByTestId('json-editor.invalid-json');
    },
  };

  const type = (value) => {
    selectors.getInput().type(value, { force: true });
    cy.wait(500);
  };

  const checkCode = (value) => {
    selectors.getCode().should(($div) => {
      expect($div.get(0).innerText).to.eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/?path=/docs/editors-json--docs');
    getIframe().findByTestId('json-editor-integration-test').should('be.visible');
  });

  it('should set and clear values properly', () => {
    cy.debug();
    cy.editorEvents().should('deep.equal', []);

    selectors.getInput().should('have.value', '');

    type('{}');

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: {} },
      { id: 1, type: 'setValue', value: {} },
    ]);

    type('{backspace}{backspace}');

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: undefined },
      { id: 3, type: 'removeValue', value: undefined },
      { id: 2, type: 'onValueChanged', value: {} },
      { id: 1, type: 'setValue', value: {} },
    ]);
  });

  it('should undo and redo properly', () => {
    selectors.getUndoButton().should('be.disabled');
    selectors.getRedoButton().should('be.disabled');

    type('{ "foo": ');
    type('"bar" }');

    selectors.getUndoButton().should('not.be.disabled');
    selectors.getRedoButton().should('be.disabled');

    selectors.getUndoButton().click();
    selectors.getRedoButton().should('not.be.disabled');

    checkCode('{ "foo": "bar" ');

    selectors.getUndoButton().click();

    checkCode('{ "foo": ');

    selectors.getRedoButton().click().click();

    selectors.getRedoButton().should('be.disabled');

    checkCode('{ "foo": "bar" }');
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: { foo: 'bar' } },
      { id: 3, type: 'setValue', value: { foo: 'bar' } },
      { id: 2, type: 'onValueChanged', value: { foo: 'bar' } },
      { id: 1, type: 'setValue', value: { foo: 'bar' } },
    ]);
  });

  it('should reset field state on external change', () => {
    type('{"foo": {');
    type('"bar": "xyz" }}');

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: { foo: { bar: 'xyz' } } },
      { id: 1, type: 'setValue', value: { foo: { bar: 'xyz' } } },
    ]);

    cy.setValueExternal({ something: 'new' });
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 3, type: 'onValueChanged', value: { something: 'new' } },
      { id: 2, type: 'onValueChanged', value: { foo: { bar: 'xyz' } } },
      { id: 1, type: 'setValue', value: { foo: { bar: 'xyz' } } },
    ]);

    selectors.getCode().should(($div) => {
      expect($div.get(0).innerText).to.include('something');
    });

    selectors.getRedoButton().should('be.disabled');
    selectors.getUndoButton().should('be.disabled');
  });

  it('should show validation warning if object is invalid', () => {
    selectors.getValidationError().should('not.exist');

    type('{ "foo": ');

    selectors.getValidationError().should('exist').should('have.text', 'This is not valid JSON');

    type('"bar" }');

    selectors.getValidationError().should('not.exist');
  });
});
