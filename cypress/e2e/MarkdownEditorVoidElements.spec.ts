import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / Void elements', () => {
  const selectors = {
    getInput() {
      return getIframe().findByTestId('markdown-textarea').find('[contenteditable]');
    },
    getPreviewButton() {
      return getIframe().findByTestId('markdown-tab-preview');
    },
    getVoidElementsWarning() {
      return getIframe().findByTestId('markdown-void-elements-warning');
    },
    getPreview() {
      return getIframe().findByTestId('markdown-preview');
    },
  };

  const type = (value) => {
    return selectors.getInput().focus().type(value, { force: true });
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
  });

  it('renders even with invalid use of void elements', () => {
    type(`
      <br>br</br>
      <link>link</link>
      <img></img>
    `);

    selectors.getPreviewButton().click();
    selectors.getPreview().should('contain.text', 'br');
    selectors.getPreview().should('contain.text', 'link');
  });
});
