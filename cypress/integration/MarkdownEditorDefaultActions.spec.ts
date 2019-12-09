describe('Markdown Editor', () => {
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
    },
    getBoldButton: () => {
      return cy.findByTestId('markdown-action-button-bold');
    }
  };

  const type = value => {
    return selectors.getInput().type(value, { force: true });
  };

  const checkValue = value => {
    cy.getMarkdownInstance().then(markdown => {
      expect(markdown.getContent()).eq(value);
    });
  };

  const selectBackwards = (skip, len) => {
    cy.getMarkdownInstance().then(markdown => {
      markdown.selectBackwards(skip, len);
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

  describe('bold', () => {
    const clickBold = () => {
      selectors.getBoldButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      clickBold();
      checkValue('__text in bold__');

      type('bold text');
      checkValue('__bold text__');

      type('{rightarrow}{rightarrow}{enter}');

      type('Sentence a bold word.');
      selectBackwards(1, 9); // select 'bold word'
      clickBold();
      type(' and not a bold word');
      checkValue('__bold text__\nSentence a __bold word__ and not a bold word.');
    });

    it('should remove boldness to already applied', () => {});

    it('should be triggered by a hotkey', () => {});
  });

  describe('italic', () => {});

  describe('quote', () => {});
});
