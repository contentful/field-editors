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
    win.localStorage.setItem('googleMapsKey', Cypress.env('googleMapsKey') || '');
    return win;
  });
});

// https://frontend.irish/how-mock-google-places-cypress
Cypress.Commands.add('mockGoogleMapsResponse', (mockData) => {
  cy.intercept('https://maps.googleapis.com/maps/api/js/GeocodeService.Search*', (request) => {
    const searchParams = new URLSearchParams(request.url);
    const callbackParam = searchParams.get('callback');
    request.reply(`${callbackParam} && ${callbackParam}(${JSON.stringify(mockData)})`);
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
  return cy
    .window()
    .then((win) => {
      return win.markdownEditor;
      // we want to make sure any kind of debounced behaviour
      // is already triggered before we go on and assert the
      // content of the field in any test
    })
    .wait(100);
});

Cypress.Commands.add('getRichTextField', () => {
  return cy
    .window()
    .then((win) => {
      return win.richTextField;
      // we want to make sure any kind of debounced behaviour
      // is already triggered before we go on and assert the
      // content of the field in any test
    })
    .wait(100);
});

Cypress.Commands.add('paste', { prevSubject: 'element' }, function (subject, data) {
  const dataTransfer = new DataTransfer();

  for (const [format, value] of Object.entries(data)) {
    dataTransfer.setData(format, value);
  }

  // this is a weird combination of Event class, type & other properties
  // but necessary to pass all the Slate guard
  const inputEvent = new InputEvent('beforeinput', {
    inputType: 'insertFromPaste',
    bubbles: true,
    cancelable: true,
    // @ts-expect-ignore Slate looks for this property specifically
    dataTransfer,
  });
  const event = Object.assign(inputEvent, {
    getTargetRanges: () => [],
  });

  cy.wrap(subject).trigger('beforeinput', event);
});
