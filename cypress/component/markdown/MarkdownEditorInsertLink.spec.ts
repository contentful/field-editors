import { checkValue, clearAll, renderMarkdownEditor, selectCharsBackwards, type } from './utils';

describe('Markdown Editor / Insert Link Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h2');
    },
    getInsertDialogButton() {
      return cy.findByTestId('markdown-action-button-link');
    },
    getModalContent() {
      return cy.findByTestId('insert-link-modal');
    },
    inputs: {
      getLinkTextInput() {
        return cy.findByRole('textbox', { name: 'Link text' });
      },
      getTargetUrlInput() {
        return cy.findByRole('textbox', { name: 'Target URL' });
      },
      getLinkTitle() {
        return cy.findByRole('textbox', { name: 'Link title' });
      },
    },
    getConfirmButton() {
      return cy.findByRole('button', { name: 'Insert' });
    },
    getCancelButton() {
      return cy.findByRole('button', { name: 'Cancel' });
    },
    getInvalidMessage() {
      return cy.findByText('Invalid URL');
    },
  };

  it('should have correct title', () => {
    renderMarkdownEditor();
    selectors.getInsertDialogButton().click();
    selectors.getDialogTitle().should('have.text', 'Insert link');
    selectors.getCancelButton().click();
  });

  it('should insert nothing if click on cancel button or close window with ESC', () => {
    renderMarkdownEditor();

    // close with button
    selectors.getInsertDialogButton().click();
    selectors.getCancelButton().click();
    selectors.getModalContent().should('not.exist');

    // close with esc
    selectors.getInsertDialogButton().click();
    selectors.inputs.getTargetUrlInput().type('{esc}');
    selectors.getModalContent().should('not.exist');
  });

  it('should show validation error when url is incorrect', () => {
    renderMarkdownEditor();

    selectors.getInsertDialogButton().click();

    // type correct value

    const correctValues = ['https://contentful.com', 'http://google.com', 'ftp://somefile'];

    correctValues.forEach((value) => {
      selectors.inputs.getTargetUrlInput().clear().type(value);
      selectors.getInvalidMessage().should('not.exist');
      selectors.getConfirmButton().should('not.be.disabled');
    });

    // clear and type incorrect value

    const incorrectValues = [
      'does not look like an url, bro',
      'htp://contentful.com',
      'http:/oops.com',
    ];

    incorrectValues.forEach((value) => {
      selectors.inputs.getTargetUrlInput().clear().type(value);
      selectors.getInvalidMessage().should('be.visible');
      selectors.getConfirmButton().should('be.disabled');
    });
    selectors.getCancelButton().click();
  });

  describe('when there is no text selected', () => {
    it('should have correct default state', () => {
      renderMarkdownEditor();

      selectors.getInsertDialogButton().click();

      selectors.inputs
        .getLinkTextInput()
        .should('be.visible')
        .should('have.value', '')
        .should('not.be.disabled');
      selectors.inputs.getTargetUrlInput().should('be.visible').should('have.value', '');

      selectors.inputs.getLinkTitle().should('be.visible').should('have.value', '');

      selectors.getConfirmButton().should('be.disabled');
      selectors.getInvalidMessage().should('not.exist');
      selectors.getCancelButton().click();
    });

    it('should paste link in a correct format', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      // with all fields provided
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.inputs.getLinkTitle().clear().type('Contentful');

      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('[best headless CMS ever](https://contentful.com "Contentful")');

      // without title field
      clearAll();
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('[best headless CMS ever](https://contentful.com)');

      // only with url
      clearAll();
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().clear();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('<https://contentful.com>');
    });
  });

  describe('when there is text selected', () => {
    it('should have correct default state', () => {
      renderMarkdownEditor();

      type('check out Contentful');
      selectCharsBackwards(0, 10);
      selectors.getInsertDialogButton().click();

      selectors.inputs
        .getLinkTextInput()
        .should('be.visible')
        .should('have.value', 'Contentful')
        .should('be.disabled');
      selectors.inputs
        .getTargetUrlInput()
        .should('be.visible')
        .should('have.value', '')
        .should('have.focus');
      selectors.inputs.getLinkTitle().should('be.visible').should('have.value', '');

      selectors.getConfirmButton().should('be.disabled');
      selectors.getInvalidMessage().should('not.exist');
      selectors.getCancelButton().click();
    });

    it('should paste link in a correct format', () => {
      renderMarkdownEditor({ spyOnRemoveValue: true, spyOnSetValue: true });
      type('check out Contentful');
      selectCharsBackwards(0, 10);

      // with all fields provided

      selectors.getInsertDialogButton().click();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.inputs.getLinkTitle().clear().type('The best headless CMS ever');

      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('check out [Contentful](https://contentful.com "The best headless CMS ever")');

      // without title field

      clearAll();
      type('check out Contentful');
      selectCharsBackwards(0, 10);
      selectors.getInsertDialogButton().click();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('check out [Contentful](https://contentful.com)');
    });
  });
});
