import {
  checkValue,
  renderMarkdownEditor,
  clickVisibleButtonByName,
  openAdditionalActions,
} from './utils';

describe('Markdown Editor / Embed External Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h2');
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByRole('button', { name: 'More actions' });
    },
    getModalContent() {
      return cy.findByTestId('embed-external-dialog');
    },
    getEmbedExternalContentButton() {
      return cy.findByRole('button', { name: 'Embed external content' });
    },
    getConfirmButton() {
      return cy.findByRole('button', { name: 'Insert' });
    },
    getCancelButton() {
      return cy.findByRole('button', { name: 'Cancel' });
    },
    inputs: {
      getUrlInput() {
        return cy.findByRole('textbox', { name: 'Content URL(required)' });
      },
      getWidthInput() {
        return cy.findByRole('spinbutton', { name: 'Width(required)' });
      },
      getPercentRadio() {
        return cy.findByRole('radio', { name: 'percent' });
      },
      getPixelRadio() {
        return cy.findByRole('radio', { name: 'pixels' });
      },
    },
  };

  function openDialog() {
    clickVisibleButtonByName('Embed external content');
  }

  beforeEach(() => {
    renderMarkdownEditor({ spyOnSetValue: true });
    openAdditionalActions().should('be.visible');
  });

  it('should have correct title', () => {
    openDialog();
    selectors.getDialogTitle().should('have.text', 'Embed external content');
    selectors.getCancelButton().click();
  });

  it('should have correct default state', () => {
    openDialog();

    selectors.inputs.getUrlInput().should('have.value', 'https://');

    selectors.inputs.getWidthInput().should('have.value', '100');
    selectors.inputs.getPercentRadio().should('be.checked');
    selectors.inputs.getPixelRadio().should('not.be.checked');
    selectors.getCancelButton().click();
  });

  it('should insert a correct embedly script with percentage width', () => {
    openDialog();
    selectors.inputs.getUrlInput().clear().type('https://contentful.com');
    selectors.getConfirmButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue(
      `<a href="https://contentful.com" class="embedly-card" data-card-width="100%" data-card-controls="0">Embedded content: https://contentful.com</a>`,
    );
  });

  it('should insert a correct embedly script with pixel width', () => {
    openDialog();
    selectors.inputs.getUrlInput().clear().type('https://contentful.com');
    selectors.inputs.getPixelRadio().click();
    selectors.inputs.getWidthInput().clear().type('500');
    selectors.getConfirmButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue(
      `<a href="https://contentful.com" class="embedly-card" data-card-width="500px" data-card-controls="0">Embedded content: https://contentful.com</a>`,
    );
  });
});
