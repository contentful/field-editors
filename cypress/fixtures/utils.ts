import { Link } from '@contentful/app-sdk';

export const newLink = (linkType: string, id: string): Link => ({
  sys: {
    id,
    linkType,
    type: 'Link',
  },
});

export const getIframe = () => {
  return cy
    .get('#storybook-preview-iframe')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
};

export const getIframeWindow = () => {
  return cy
    .get('#storybook-preview-iframe')
    .its('0.contentWindow')
    .should('not.be.empty')
    .then(cy.wrap);
};
