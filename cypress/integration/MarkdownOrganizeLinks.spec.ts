describe('Markdown Editor / Organize Links', () => {
  const selectors = {
    getInput: () => {
      return cy.get('[data-test-id="markdown-textarea"] textarea');
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getOrganizeLinksButton() {
      return cy.findByTestId('markdown-action-button-organizeLinks');
    },
    getSuccessNotification() {
      return cy.get('[data-test-id="cf-ui-notification"][data-intent="success"]');
    }
  };

  const type = value => {
    return selectors.getInput().type(value, { force: true });
  };

  const checkValue = value => {
    cy.getMarkdownInstance().then(markdown => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
    selectors.getToggleAdditionalActionsButton().click();
  });

  it('should organize links properly', () => {
    const initialText = `Content editors use [Contentful](https://contentful.com "CMS that you will love") to make ongoing improvements and updates to their websites without relying on engineering, while developers focus their talents on building software without the distraction of [CMS](https://en.wikipedia.org/wiki/Content_management_system) complexities or hard-coding content. [Contentful](https://contentful.com "CMS that you will love") is your choice.`;
    const expectedText = `Content editors use [Contentful][1] to make ongoing improvements and updates to their websites without relying on engineering, while developers focus their talents on building software without the distraction of [CMS][2] complexities or hard-coding content. [Contentful][1] is your choice.\n\n\n[1]: https://contentful.com "CMS that you will love"\n[2]: https://en.wikipedia.org/wiki/Content_management_system`;

    checkValue('');
    type(initialText);
    selectors.getOrganizeLinksButton().click();

    checkValue(expectedText);
    selectors
      .getSuccessNotification()
      .should('include.text', 'All your links are now references at the bottom of your document');
  });
});
