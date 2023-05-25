// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { register } from '@cypress/snapshot';
import { configure } from '@testing-library/cypress';
import '@testing-library/cypress/add-commands';

register();
configure({ testIdAttribute: 'data-test-id' });

const getIframeWindow = () => {
  return cy
    .get('#storybook-preview-iframe')
    .its('0.contentWindow')
    .should('not.be.empty')
    .then(cy.wrap);
};

Cypress.Commands.add('editorEvents', (lastN = Infinity) => {
  getIframeWindow().then((win) => {
    return win.editorEvents.slice(0, lastN);
  });
});

Cypress.Commands.add('editorActions', (lastN = Infinity) => {
  getIframeWindow().then((win) => {
    return win.actions.slice(0, lastN);
  });
});

Cypress.Commands.add('setValueExternal', (value) => {
  return getIframeWindow().then((win) => {
    console.log('does it have', win);
    win.setValueExternal(value);
    return win;
  });
});

Cypress.Commands.add('setGoogleMapsKey', () => {
  return getIframeWindow().then((win) => {
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
  return getIframeWindow().then((win) => {
    win.localStorage.setItem('initialValue', JSON.stringify(initialValue));
    return win;
  });
});

Cypress.Commands.add('setInitialDisabled', (initialDisabled) => {
  return getIframeWindow().then((win) => {
    win.localStorage.setItem('initialDisabled', initialDisabled);
    return win;
  });
});

Cypress.Commands.add('setRestrictedMarks', (restrictedMarks) => {
  return getIframeWindow().then((win) => {
    win.localStorage.setItem('restrictedMarks', JSON.stringify(restrictedMarks));
    return win;
  });
});

Cypress.Commands.add('setFieldValidations', (validations) => {
  return getIframeWindow().then((win) => {
    win.localStorage.setItem('fieldValidations', JSON.stringify(validations));
    return win;
  });
});

Cypress.Commands.add('setInstanceParams', (instanceParams) => {
  return getIframeWindow().then((win) => {
    win.localStorage.setItem('instanceParams', JSON.stringify(instanceParams));
    return win;
  });
});

Cypress.Commands.add('getMarkdownInstance', () => {
  return cy
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

/**
 * Drag & drop a parent element to the targetElement. The parent element's HTML is used for data transfer.
 * Allows drag & dropping block elements.
 */
Cypress.Commands.add('dragTo', { prevSubject: true }, (subject, target) => {
  const dataTransfer = new DataTransfer();
  dataTransfer.setData('text/html', subject[0].outerHTML);

  cy.wrap(subject).trigger('dragstart', { dataTransfer });

  target().trigger('drop', { dataTransfer });
});

// https://frontend.irish/how-mock-google-places-cypress
Cypress.Commands.add('mockGoogleMapsResponse', (mockData) => {
  cy.intercept('https://maps.googleapis.com/maps/api/js/GeocodeService.Search*', (request) => {
    const searchParams = new URLSearchParams(request.url);
    const callbackParam = searchParams.get('callback');
    request.reply(`${callbackParam} && ${callbackParam}(${JSON.stringify(mockData)})`);
  });
});

Cypress.Commands.add('getComponentFixtures', () => {
  return cy.get('@componentFixtures');
});

Cypress.on(
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
);
