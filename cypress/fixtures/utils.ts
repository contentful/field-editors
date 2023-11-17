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

export const openEditLink = () => {
  return getIframe()
    .findByTestId('cf-ui-popover-content')
    .should('exist')
    .findByLabelText('Edit link')
    .should('exist')
    .click({ force: true });
};

export const getIframeWindow = () => {
  return cy
    .get('#storybook-preview-iframe')
    .its('0.contentWindow')
    .should('not.be.empty')
    .then(cy.wrap);
};

// copied from the 'is-hotkey' library we use for RichText shortcuts
const IS_MAC =
  typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
export const mod = IS_MAC ? 'meta' : 'control';
