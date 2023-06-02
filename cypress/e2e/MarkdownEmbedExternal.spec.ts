import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / Embed External Dialog', () => {
  const selectors = {
    getInput: () => {
      return getIframe().findByTestId('markdown-textarea').find('[contenteditable]');
    },
    getDialogTitle() {
      return getIframe().findByTestId('dialog-title').find('h2');
    },
    getToggleAdditionalActionsButton: () => {
      return getIframe().findByTestId('markdown-action-button-toggle-additional');
    },
    getModalContent() {
      return getIframe().findByTestId('embed-external-dialog');
    },
    getEmbedExternalContentButton() {
      return getIframe().findByTestId('markdown-action-button-embed');
    },
    getConfirmButton() {
      return getIframe().findByTestId('embed-external-confirm');
    },
    getCancelButton() {
      return getIframe().findByTestId('embed-external-cancel');
    },
    inputs: {
      getUrlInput() {
        return getIframe().findByTestId('external-link-url-field');
      },
      getWidthInput() {
        return getIframe().findByTestId('embedded-content-width');
      },
      getPercentRadio() {
        return getIframe().findByLabelText('percent');
      },
      getPixelRadio() {
        return getIframe().findByLabelText('pixels');
      },
    },
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  const clearAll = () => {
    cy.getMarkdownInstance().then((markdown) => {
      markdown.clear();
    });
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
    selectors.getToggleAdditionalActionsButton().click();
  });

  function openDialog() {
    selectors.getEmbedExternalContentButton().click();
  }

  it('should have correct title', () => {
    openDialog();
    selectors.getDialogTitle().should('have.text', 'Embed external content');
  });

  it('should have correct default state', () => {
    openDialog();

    selectors.inputs.getUrlInput().should('have.value', 'https://');

    selectors.inputs.getWidthInput().should('have.value', '100');
    selectors.inputs.getPercentRadio().should('be.checked');
    selectors.inputs.getPixelRadio().should('not.be.checked');
  });

  it('should insert a correct embedly script', () => {
    checkValue('');

    openDialog();
    selectors.inputs.getUrlInput().clear().type('https://contentful.com');
    selectors.getConfirmButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue(
      `<a href="https://contentful.com" class="embedly-card" data-card-width="100%" data-card-controls="0">Embedded content: https://contentful.com</a>`
    );

    clearAll();

    openDialog();
    selectors.inputs.getUrlInput().clear().type('https://contentful.com');
    selectors.inputs.getPixelRadio().click();
    selectors.inputs.getWidthInput().clear().type('500');
    selectors.getConfirmButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue(
      `<a href="https://contentful.com" class="embedly-card" data-card-width="500px" data-card-controls="0">Embedded content: https://contentful.com</a>`
    );
  });
});
