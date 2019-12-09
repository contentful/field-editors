describe('JSON Editor', () => {
  const selectors = {
    getInput: () => {
      return cy.findByTestId('markdown-textarea').get('textarea');
    },
    getValue: () => {
      return cy.findByTestId('markdown-textarea').get('.CodeMirror-code');
    },
    getHeadingsSelectorButton: () => {
      return cy.findByTestId('markdown-action-button-heading');
    },
    getHeadingButton: type => {
      return cy.findByTestId('markdown-action-button-heading-' + type);
    }
  };

  const type = value => {
    selectors.getInput().type(value, { force: true });
    cy.wait(500);
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
  });

  describe('headings', () => {
    const clickHeading = value => {
      selectors.getHeadingsSelectorButton().click();
      selectors.getHeadingButton(value).click();
    };

    it('should work properly', () => {
      checkValue('');

      clickHeading('h1');
      checkValue('# ');
      cy.get('.cm-header-1').should('have.text', '# ');

      clickHeading('h2');
      checkValue('## ');
      cy.get('.cm-header-2').should('have.text', '## ');

      clickHeading('h3');
      checkValue('### ');
      cy.get('.cm-header-3').should('have.text', '### ');

      type('Heading 3{enter}');

      cy.get('.cm-header-3').should('have.text', '### Heading 3');

      type('Future heading 2');
      clickHeading('h2');
      checkValue('### Heading 3\n## Future heading 2');

      clickHeading('h2');
      checkValue('### Heading 3\nFuture heading 2');

      const longParagraph =
        'This course helps you understand the basics behind Contentful. It contains modules that introduce you to core concepts and how your app consumes content from Contentful. This content is pulled from Contentful APIs using a Contentful SDK.';

      type('{enter}{enter}');
      type(longParagraph);

      clickHeading('h3');
      checkValue(`### Heading 3\nFuture heading 2\n\n### ${longParagraph}`);
    });
  });
});
