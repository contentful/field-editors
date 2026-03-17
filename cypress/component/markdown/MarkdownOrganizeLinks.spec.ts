import {
  checkValue,
  renderMarkdownEditor,
  type,
  clickVisibleButtonByName,
  openAdditionalActions,
} from './utils';

describe('Markdown Editor / Organize Links', () => {
  const selectors = {
    getToggleAdditionalActionsButton: () => {
      return cy.findByRole('button', { name: 'More actions' });
    },
    getOrganizeLinksButton() {
      return cy.findByRole('button', { name: 'Organize links' });
    },
    getSuccessNotification() {
      return cy.findByTestId('cf-ui-notification');
    },
  };

  it('should organize links properly', () => {
    renderMarkdownEditor({ spyOnSetValue: true });

    openAdditionalActions().should('be.visible');

    const initialText = `Content editors use [Contentful](https://contentful.com "CMS that you will love") to make ongoing improvements and updates to their websites without relying on engineering, while developers focus their talents on building software without the distraction of [CMS](https://en.wikipedia.org/wiki/Content_management_system) complexities or hard-coding content. [Contentful](https://contentful.com "CMS that you will love") is your choice.`;
    const expectedText = `Content editors use [Contentful][1] to make ongoing improvements and updates to their websites without relying on engineering, while developers focus their talents on building software without the distraction of [CMS][2] complexities or hard-coding content. [Contentful][1] is your choice.\n\n[1]: https://contentful.com "CMS that you will love"\n[2]: https://en.wikipedia.org/wiki/Content_management_system`;

    type(initialText);
    clickVisibleButtonByName('Organize links');

    checkValue(expectedText);
    selectors
      .getSuccessNotification()
      .should('include.text', 'All your links are now references at the bottom of your document');
  });
});
