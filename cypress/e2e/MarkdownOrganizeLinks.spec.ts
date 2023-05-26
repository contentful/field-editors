import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / Organize Links', () => {
  const selectors = {
    getInput: () => {
      return getIframe().findByTestId('markdown-textarea').find('.CodeMirror-code');
    },
    getToggleAdditionalActionsButton: () => {
      return getIframe().findByTestId('markdown-action-button-toggle-additional');
    },
    getOrganizeLinksButton() {
      return getIframe().findByTestId('markdown-action-button-organizeLinks');
    },
    getSuccessNotification() {
      return getIframe().findByTestId('cf-ui-notification');
    },
  };

  const type = (value) => {
    return selectors.getInput().focus().type(value, { force: true });
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
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
