describe('Markdown Editor / Insert Link Dialog', () => {
  const selectors = {
    getInput: () => {
      return cy.get('[data-test-id="markdown-textarea"] textarea');
    },
    getDialogTitle() {
      return cy.findByTestId('dialog-title').find('h1');
    },
    getInsertDialogButton() {
      return cy.findByTestId('markdown-action-button-link');
    },
    getModalContent() {
      return cy.findByTestId('insert-link-modal');
    },
    inputs: {
      getLinkTextInput() {
        return cy.findByTestId('link-text-field');
      },
      getTargetUrlInput() {
        return cy.findByTestId('target-url-field');
      },
      getLinkTitle() {
        return cy.findByTestId('link-title-field');
      },
    },
    getConfirmButton() {
      return cy.findByTestId('insert-link-confirm');
    },
    getCancelButton() {
      return cy.findByTestId('insert-link-cancel');
    },
    getInvalidMessage() {
      return cy.findByText('Invalid URL');
    },
  };

  const type = (value) => {
    return selectors.getInput().type(value, { force: true });
  };

  const clearAll = () => {
    cy.getMarkdownInstance().then((markdown) => {
      markdown.clear();
    });
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  const selectBackwards = (skip, len) => {
    cy.getMarkdownInstance().then((markdown) => {
      markdown.selectBackwards(skip, len);
    });
  };

  beforeEach(() => {
    cy.visit('/markdown');
    cy.wait(500);
    cy.findByTestId('markdown-editor').should('be.visible');
  });

  it('should have correct title', () => {
    selectors.getInsertDialogButton().click();
    selectors.getDialogTitle().should('have.text', 'Insert link');
  });

  it('should insert nothing if click on cancel button or close window with ESC', () => {
    checkValue('');

    // close with button
    selectors.getInsertDialogButton().click();
    selectors.getCancelButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue('');

    // close with esc
    selectors.getInsertDialogButton().click();
    selectors.inputs.getTargetUrlInput().type('{esc}');
    selectors.getModalContent().should('not.exist');
    checkValue('');
  });

  it('should show validation error when url is incorrect', () => {
    checkValue('');

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
  });

  describe('when there is no text selected', () => {
    it('should have correct default state', () => {
      checkValue('');

      selectors.getInsertDialogButton().click();

      selectors.inputs
        .getLinkTextInput()
        .should('be.visible')
        .should('have.value', '')
        .should('not.be.disabled');
      selectors.inputs
        .getTargetUrlInput()
        .should('be.visible')
        .should('have.value', '')
        .should('have.focus');
      selectors.inputs.getLinkTitle().should('be.visible').should('have.value', '');

      selectors.getConfirmButton().should('be.disabled');
      selectors.getInvalidMessage().should('not.exist');
    });

    it('should paste link in a correct format', () => {
      checkValue('');

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
      checkValue('');
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      checkValue('[best headless CMS ever](https://contentful.com)');

      // only with url
      clearAll();
      checkValue('');
      selectors.getInsertDialogButton().click();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      checkValue('<https://contentful.com>');
    });
  });

  describe('when there is text selected', () => {
    it('should have correct default state', () => {
      type('check out Contentful');
      selectBackwards(0, 10);
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
    });

    it('should paste link in a correct format', () => {
      type('check out Contentful');
      selectBackwards(0, 10);

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
      selectBackwards(0, 10);
      selectors.getInsertDialogButton().click();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      checkValue('check out [Contentful](https://contentful.com)');
    });
  });
});
