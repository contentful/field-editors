import {
  checkValue,
  renderMarkdownEditor,
  selectCharsBackwards,
  type,
  clickVisibleButtonByName,
} from './utils';

describe('Markdown Editor / Insert Link Dialog', () => {
  const selectors = {
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h2');
    },
    getInsertDialogButton() {
      return cy.findByRole('button', { name: 'Link' });
    },
    openInsertDialog() {
      return clickVisibleButtonByName('Link');
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
    selectors.openInsertDialog();
    selectors.getDialogTitle().should('have.text', 'Insert link');
    selectors.getCancelButton().click();
  });

  it('should insert nothing if click on cancel button or close window with ESC', () => {
    renderMarkdownEditor();

    // close with button
    selectors.openInsertDialog();
    selectors.getCancelButton().click();
    selectors.getModalContent().should('not.exist');

    // close with esc
    selectors.openInsertDialog();
    selectors.inputs.getTargetUrlInput().type('{esc}');
    selectors.getModalContent().should('not.exist');
  });

  it('should show validation error when url is incorrect', () => {
    renderMarkdownEditor();

    selectors.openInsertDialog();

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

      selectors.openInsertDialog();

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

    it('should paste link in a correct format with all fields provided', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      selectors.openInsertDialog();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.inputs.getLinkTitle().clear().type('Contentful');

      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('[best headless CMS ever](https://contentful.com "Contentful")');
    });

    it('should paste link in a correct format without a title', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      selectors.openInsertDialog();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('[best headless CMS ever](https://contentful.com)');
    });

    it('should paste bare url format when only the url is provided', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      selectors.openInsertDialog();
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
      selectors.openInsertDialog();

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

    it('should paste link in a correct format with all fields provided', () => {
      renderMarkdownEditor({ spyOnRemoveValue: true, spyOnSetValue: true });
      type('check out Contentful');
      selectCharsBackwards(0, 10);

      selectors.openInsertDialog();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.inputs.getLinkTitle().clear().type('The best headless CMS ever');

      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('check out [Contentful](https://contentful.com "The best headless CMS ever")');
    });

    it('should paste link in a correct format without a title', () => {
      renderMarkdownEditor({ spyOnRemoveValue: true, spyOnSetValue: true });
      type('check out Contentful');
      selectCharsBackwards(0, 10);
      selectors.openInsertDialog();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('check out [Contentful](https://contentful.com)');
    });
  });
});
