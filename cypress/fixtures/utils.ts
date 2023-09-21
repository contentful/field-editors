import { Link } from '@contentful/app-sdk';

export const newLink = (linkType: string, id: string): Link => ({
  sys: {
    id,
    linkType,
    type: 'Link',
  },
});

export const getIframe = (): Cypress.Chainable<JQuery<HTMLBodyElement>> => {
  return cy
    .get('#storybook-preview-iframe')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then((body) => cy.wrap(body as HTMLBodyElement));
};

export const getIframeWindow = () => {
  return cy
    .get('#storybook-preview-iframe')
    .its('0.contentWindow')
    .should('not.be.empty')
    .then(cy.wrap);
};
