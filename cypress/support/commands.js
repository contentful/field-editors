// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import '@testing-library/cypress/add-commands';
import { configure } from '@testing-library/cypress';

configure({ testIdAttribute: 'data-test-id' });

Cypress.Commands.add('editorEvents', (lastN = Infinity) => {
  cy.window().then((win) => {
    return win.editorEvents.slice(0, lastN);
  });
});

Cypress.Commands.add('setValueExternal', (value) => {
  return cy.window().then((win) => {
    win.setValueExternal(value);
    return win;
  });
});

Cypress.Commands.add('setGoogleMapsKey', () => {
  return cy.window().then((win) => {
    win.localStorage.setItem('googleMapsKey', Cypress.env('googleMapsKey'));
    return win;
  });
});

Cypress.Commands.add('setInitialValue', (initialValue) => {
  return cy.window().then((win) => {
    win.localStorage.setItem('initialValue', JSON.stringify(initialValue));
    return win;
  });
});

Cypress.Commands.add('setInitialDisabled', (initialDisabled) => {
  return cy.window().then((win) => {
    win.localStorage.setItem('initialDisabled', initialDisabled);
    return win;
  });
});

Cypress.Commands.add('setFieldValidations', (validations) => {
  return cy.window().then((win) => {
    win.localStorage.setItem('fieldValidations', JSON.stringify(validations));
    return win;
  });
});

Cypress.Commands.add('setInstanceParams', (instanceParams) => {
  return cy.window().then((win) => {
    win.localStorage.setItem('instanceParams', JSON.stringify(instanceParams));
    return win;
  });
});

Cypress.Commands.add('getMarkdownInstance', () => {
  return cy.window().then((win) => {
    return win.markdownEditor;
  });
});

Cypress.Commands.add('getRichTextField', () => {
  return cy.window().then((win) => {
    return win.richTextField;
  });
});

Cypress.Commands.add('typeInSlate', { prevSubject: true }, (subject, text) => {
  // Needed because cypress's `type` doesn't trigger `beforeinput` events by default.
  // This is the primary way Slate picks up on UI events
  // cf. https://github.com/ianstormtaylor/slate/issues/3476
  // TODO: this is solved in cypress 5.5.0, but upgrading breaks several other
  // test suites. We should update and tweak those spots so we don't have to
  // type using this hack.
  return cy.wrap(subject).then(subject => {
    const event = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: text
    });
    subject[0].dispatchEvent(event);
    return subject;
  });
});