import * as React from 'react';

import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';

import JsonEditor from '../../../packages/json/src/JsonEditor';
import { mount } from '../mount';

const renderJsonEditor = () => {
  const [fieldSdk] = createFakeFieldAPI();
  mount(<JsonEditor isInitiallyDisabled={false} field={fieldSdk} />);
  return fieldSdk;
};

describe('JSON Editor', () => {
  const selectors = {
    getInput: () => {
      return cy.findByTestId('json-editor-code-mirror').find('.cm-content');
    },
    getCode: () => {
      return cy.findByTestId('json-editor-code-mirror').find('.cm-editor');
    },
    getRedoButton: () => {
      return cy.findByRole('button', { name: 'Redo' });
    },
    getUndoButton: () => {
      return cy.findByRole('button', { name: 'Undo' });
    },
    getValidationError: () => {
      return cy.findByTestId('json-editor.invalid-json');
    },
  };

  const type = (value) => {
    selectors.getInput().type(value);
    cy.wait(500);
  };

  const checkCode = (value) => {
    selectors.getCode().should(($div) => {
      expect($div.get(0).innerText).to.eq(value);
    });
  };

  it('should set and clear values properly', () => {
    const fieldSdk = renderJsonEditor();
    cy.spy(fieldSdk, 'setValue').as('setValue');
    cy.spy(fieldSdk, 'removeValue').as('removeValue');

    selectors.getInput().should('have.value', '');

    type('{}');

    cy.get('@setValue').should('be.calledOnceWith', {});

    type('{backspace}{backspace}');

    cy.get('@removeValue').should('be.calledOnce');
  });

  it('should undo and redo properly', () => {
    const fieldSdk = renderJsonEditor();
    cy.spy(fieldSdk, 'setValue').as('setValue');

    selectors.getUndoButton().should('be.disabled');
    selectors.getRedoButton().should('be.disabled');

    type('{ "foo": ');
    type('"bar" }');

    cy.get('@setValue').should('be.calledOnceWith', { foo: 'bar' });

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

    cy.get('@setValue').should('be.calledWith', { foo: 'bar' });

    cy.get('@setValue').its('callCount').should('eq', 2);
  });

  it('should reset field state on external change', () => {
    const fieldSdk = renderJsonEditor();
    cy.spy(fieldSdk, 'setValue').as('setValue');

    type('{"foo": {');
    type('"bar": "xyz" }}');

    cy.get('@setValue')
      .should('be.calledOnceWith', { foo: { bar: 'xyz' } })
      .then(() => {
        fieldSdk.setValue({ something: 'new' });
      });

    selectors.getCode().should(($div) => {
      expect($div.get(0).innerText).to.include('something');
    });

    selectors.getRedoButton().should('be.disabled');
    selectors.getUndoButton().should('be.disabled');
  });

  it('should show validation warning if object is invalid', () => {
    renderJsonEditor();

    selectors.getValidationError().should('not.exist');

    type('{ "foo": ');

    selectors.getValidationError().should('exist').should('have.text', 'This is not valid JSON');

    type('"bar" }');

    selectors.getValidationError().should('not.exist');
  });
});
