import { renderMarkdownEditor, type } from './utils';

describe('Markdown Editor / Void elements', () => {
  const selectors = {
    getPreviewButton() {
      return cy.findByRole('tab', { name: 'Preview' });
    },
    getPreview() {
      return cy.findByTestId('markdown-preview');
    },
  };

  it('renders even with invalid use of void elements', () => {
    renderMarkdownEditor();
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
