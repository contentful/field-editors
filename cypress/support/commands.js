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

Cypress.Commands.add('editorEvents', () => {
  cy.window().then(win => {
    return win.editorEvents;
  });
});

Cypress.Commands.add('setValueExternal', value => {
  return cy.window().then(win => {
    win.setValueExternal(value);
    return win;
  });
});

Cypress.Commands.add('setGoogleMapsKey', () => {
  return cy.window().then(win => {
    win.localStorage.setItem('googleMapsKey', Cypress.env('googleMapsKey'));
    return win;
  });
});

Cypress.Commands.add('setInitialValue', initialValue => {
  return cy.window().then(win => {
    win.localStorage.setItem('initialValue', initialValue);
    return win;
  });
});

Cypress.Commands.add('setInitialDisabled', initialDisabled => {
  return cy.window().then(win => {
    win.localStorage.setItem('initialDisabled', initialDisabled);
    return win;
  });
});

Cypress.Commands.add('setInstanceParams', instanceParams => {
  return cy.window().then(win => {
    win.localStorage.setItem('instanceParams', JSON.stringify(instanceParams));
    return win;
  });
});

Cypress.Commands.add('getMarkdownInstance', () => {
  return cy.window().then(win => {
    return win.markdownEditor;
  });
});

Cypress.Commands.add('getRichTextField', () => {
  return cy.window().then(win => {
    return win.richTextField;
  });
});
