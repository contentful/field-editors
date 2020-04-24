describe('Markdown Editor / Simple Actions', () => {
  const selectors = {
    getInput: () => {
      return cy.get('[data-test-id="markdown-textarea"] textarea');
    },
    getHeadingsSelectorButton: () => {
      return cy.findByTestId('markdown-action-button-heading');
    },
    getHeadingButton: type => {
      return cy.findByTestId('markdown-action-button-heading-' + type);
    },
    getBoldButton: () => {
      return cy.findByTestId('markdown-action-button-bold');
    },
    getItalicButton: () => {
      return cy.findByTestId('markdown-action-button-italic');
    },
    getQuoteButton: () => {
      return cy.findByTestId('markdown-action-button-quote');
    },
    getUnorderedListButton: () => {
      return cy.findByTestId('markdown-action-button-ul');
    },
    getOrderedListButton: () => {
      return cy.findByTestId('markdown-action-button-ol');
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getStrikeButton: () => {
      return cy.findByTestId('markdown-action-button-strike');
    },
    getCodeButton: () => {
      return cy.findByTestId('markdown-action-button-code');
    },
    getHorizontalLineButton: () => {
      return cy.findByTestId('markdown-action-button-hr');
    },
    getIndentButton: () => {
      return cy.findByTestId('markdown-action-button-indent');
    },
    getDedentButton: () => {
      return cy.findByTestId('markdown-action-button-dedent');
    }
  };

  const examples = {
    long:
      'This course helps you understand the basics behind Contentful. It contains modules that introduce you to core concepts and how your app consumes content from Contentful. This content is pulled from Contentful APIs using a Contentful SDK.',
    code: 'console.log("This is Javascript code!");'
  };

  const type = value => {
    return selectors.getInput().type(value, { force: true });
  };

  const unveilAdditionalButtonsRow = () => {
    selectors.getToggleAdditionalActionsButton().click();
  };

  const clearAll = () => {
    cy.getMarkdownInstance().then(markdown => {
      markdown.clear();
    });
  };

  const selectAll = () => {
    cy.getMarkdownInstance().then(markdown => {
      markdown.selectAll();
    });
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

      type('{enter}{enter}');
      type(examples.long);

      clickHeading('h3');
      checkValue(`### Heading 3\nFuture heading 2\n\n### ${examples.long}`);
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

    it('should remove boldness to already applied', () => {
      checkValue('');
      type('text');
      selectBackwards(0, 4);
      clickBold();
      checkValue('__text__');
      selectBackwards(0, 8);
      clickBold();
      checkValue('text');
    });
  });

  describe('italic', () => {
    const clickItalic = () => {
      selectors.getItalicButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      clickItalic();
      checkValue('*text in italic*');

      type('italic text');
      checkValue('*italic text*');

      type('{rightarrow}{rightarrow}{enter}');

      type('Sentence an italic word.');
      selectBackwards(1, 11); // select 'italic word'
      clickItalic();
      type(' and not an italic word');
      checkValue('*italic text*\nSentence an *italic word* and not an italic word.');
    });

    it('should remove italicness to already applied', () => {
      checkValue('');
      type('text');
      selectBackwards(0, 4);
      clickItalic();
      checkValue('*text*');
      selectBackwards(0, 6);
      clickItalic();
      checkValue('text');
    });
  });

  describe('quote', () => {
    const clickQuote = () => {
      selectors.getQuoteButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      clickQuote();
      checkValue('> ');
      type('some really smart wisdom');
      type('{enter}');
      type('by some really smart person');
      checkValue('> some really smart wisdom\n> by some really smart person');

      clearAll();
      checkValue('');

      type(examples.long);
      clickQuote();
      checkValue(`> ${examples.long}`);
      clickQuote();
      checkValue(examples.long);
    });
  });

  describe('code', () => {
    const clickCode = () => {
      selectors.getCodeButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      unveilAdditionalButtonsRow();
      clickCode();
      checkValue('    ');
      type('var i = 0;');
      type('{enter}');
      type('i++;');
      checkValue('    var i = 0;\n    i++;');

      clearAll();
      checkValue('');

      type(examples.code);
      clickCode();
      checkValue(`    ${examples.code}`);
      clickCode();
      checkValue(examples.code);
    });
  });

  describe('strike', () => {
    const clickStrike = () => {
      selectors.getStrikeButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      unveilAdditionalButtonsRow();
      clickStrike();
      checkValue('~~striked out~~');

      type('striked text');
      checkValue('~~striked text~~');

      type('{rightarrow}{rightarrow}{enter}');

      type('Sentence a striked out word.');
      selectBackwards(1, 16); // select 'striked word'
      clickStrike();
      type(' and not a striked out word');
      checkValue('~~striked text~~\nSentence a ~~striked out word~~ and not a striked out word.');
    });

    it('should remove strike to already applied', () => {
      checkValue('');
      unveilAdditionalButtonsRow();
      type('text');
      selectBackwards(0, 4);
      clickStrike();
      checkValue('~~text~~');
      selectBackwards(0, 8);
      clickStrike();
      checkValue('text');
    });
  });

  describe('unordered list', () => {
    const clickUnorderedList = () => {
      selectors.getUnorderedListButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      clickUnorderedList();
      type('first item');
      type('{enter}');
      type('second item');
      type('{enter}{enter}');
      checkValue('- first item\n- second item\n\n\n');

      clearAll();
      checkValue('');

      type('sentence at the very beginning.');
      clickUnorderedList();
      type('first item{enter}second item');
      checkValue('sentence at the very beginning.\n\n- first item\n- second item\n');

      clearAll();
      checkValue('');

      type('- first item');
      clickUnorderedList();
      checkValue('first item');

      selectBackwards(0, 4);
      clickUnorderedList();
      checkValue('- first item');
      type('{enter}');
      checkValue('- first item\n- ');
      clickUnorderedList();
      checkValue('- first item\n');
    });

    it('should work properly with selection', () => {
      checkValue('');
      type('first item{enter}');
      type('second item{enter}');
      type('third item');

      selectAll();
      clickUnorderedList();

      checkValue('- first item\n- second item\n- third item');
    });
  });

  describe('ordered list', () => {
    const clickOrderedList = () => {
      selectors.getOrderedListButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      clickOrderedList();
      type('first item');
      type('{enter}');
      type('second item');
      type('{enter}{enter}');
      checkValue('1. first item\n2. second item\n\n\n');

      clearAll();
      checkValue('');

      type('sentence at the very beginning.');
      clickOrderedList();
      type('first item{enter}second item');
      checkValue('sentence at the very beginning.\n\n1. first item\n2. second item\n');

      clearAll();
      checkValue('');

      type('1. first item');
      clickOrderedList();
      checkValue('first item');

      selectBackwards(0, 4);
      clickOrderedList();
      checkValue('1. first item');
      type('{enter}');
      checkValue('1. first item\n2. ');
      clickOrderedList();
      checkValue('1. first item\n');
    });

    it('should work properly with selection', () => {
      checkValue('');
      type('first item{enter}');
      type('second item{enter}');
      type('third item');

      selectAll();
      clickOrderedList();

      checkValue('1. first item\n2. second item\n3. third item');
    });
  });

  describe('horizontal line', () => {
    const clickHorizontalButton = () => {
      selectors.getHorizontalLineButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      unveilAdditionalButtonsRow();
      clickHorizontalButton();
      checkValue('\n---\n\n');
      clickHorizontalButton();
      checkValue('\n---\n\n\n---\n\n');

      clearAll();

      type('something');
      clickHorizontalButton();
      checkValue('something\n\n---\n\n');
    });
  });

  describe('indent and dedent', () => {
    const clickIndentButton = () => {
      selectors.getIndentButton().click();
    };

    const clickDedentButton = () => {
      selectors.getDedentButton().click();
    };

    it('should work properly', () => {
      checkValue('');
      unveilAdditionalButtonsRow();
      type('something');
      clickIndentButton();
      checkValue('  something');

      type('{enter}');
      clickIndentButton();
      type('line two{enter}');
      clickDedentButton();
      type('line three{enter}');
      clickDedentButton();
      clickDedentButton();
      type('final line');

      checkValue('  something\n    line two\n  line three\nfinal line');
    });
  });
});
