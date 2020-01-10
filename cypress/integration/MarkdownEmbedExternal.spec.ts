describe('Markdown Editor / Embed External Dialog', () => {
  const selectors = {
    getInput: () => {
      return cy.findByTestId('markdown-textarea').get('textarea');
    },
    getDialogTitle() {
      return cy.findByTestId('markdown-dialog-title').within(() => {
        return cy.get('h1');
      });
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getModalContent() {
      return cy.findByTestId('embed-external-dialog');
    },
    getEmbedExternalContentButton() {
      return cy.findByTestId('markdown-action-button-embed');
    },
    getConfirmButton() {
      return cy.findByTestId('embed-external-confirm');
    },
    getCancelButton() {
      return cy.findByTestId('embed-external-cancel');
    },
    inputs: {
      getUrlInput() {
        return cy.findByTestId('external-link-url-field');
      },
      getWidthInput() {
        return cy.findByTestId('embedded-content-width');
      },
      getPercentRadio() {
        return cy.findByLabelText('percent');
      },
      getPixelRadio() {
        return cy.findByLabelText('pixels');
      }
    }
  };

  const checkValue = value => {
    cy.getMarkdownInstance().then(markdown => {
      expect(markdown.getContent()).eq(value);
    });
  };

  const clearAll = () => {
    cy.getMarkdownInstance().then(markdown => {
      markdown.clear();
    });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
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

    selectors.inputs
      .getUrlInput()
      .should('have.value', 'https://')
      .should('have.focus');

    selectors.inputs.getWidthInput().should('have.value', '100');
    selectors.inputs.getPercentRadio().should('be.checked');
    selectors.inputs.getPixelRadio().should('not.be.checked');
  });

  it('should insert a correct embedly script', () => {
    checkValue('');

    openDialog();
    selectors.inputs
      .getUrlInput()
      .clear()
      .type('https://contentful.com');
    selectors.getConfirmButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue(
      `<a href="https://contentful.com" class="embedly-card" data-card-width="100%" data-card-controls="0">Embedded content: https://contentful.com</a>`
    );

    clearAll();

    openDialog();
    selectors.inputs
      .getUrlInput()
      .clear()
      .type('https://contentful.com');
    selectors.inputs.getPixelRadio().click();
    selectors.inputs
      .getWidthInput()
      .clear()
      .type('500');
    selectors.getConfirmButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue(
      `<a href="https://contentful.com" class="embedly-card" data-card-width="500px" data-card-controls="0">Embedded content: https://contentful.com</a>`
    );
  });
});
