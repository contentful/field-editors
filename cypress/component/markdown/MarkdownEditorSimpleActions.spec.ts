import { renderMarkdownEditor, type, clearAll, checkValue, selectCharsBackwards } from './utils';

describe('Markdown Editor / Simple Actions', () => {
  const selectors = {
    getHeadingsSelectorButton: () => {
      return cy.findByRole('button', { name: 'Headings' });
    },
    getHeadingButton: (type) => {
      return cy.findByRole('menuitem', { name: `Heading ${type}` });
    },
    getBoldButton: () => {
      return cy.findByRole('button', { name: 'Bold' });
    },
    getItalicButton: () => {
      return cy.findByRole('button', { name: 'Italic' });
    },
    getQuoteButton: () => {
      return cy.findByRole('button', { name: 'Quote' });
    },
    getUnorderedListButton: () => {
      return cy.findByRole('button', { name: 'Unordered list' });
    },
    getOrderedListButton: () => {
      return cy.findByRole('button', { name: 'Ordered list' });
    },
    getToggleAdditionalActionsButton: () => {
      return cy.findByTestId('markdown-action-button-toggle-additional');
    },
    getStrikeButton: () => {
      return cy.findByRole('button', { name: 'Strike out' });
    },
    getCodeButton: () => {
      return cy.findByRole('button', { name: 'Code block' });
    },
    getHorizontalLineButton: () => {
      return cy.findByRole('button', { name: 'Horizontal rule' });
    },
    getIndentButton: () => {
      return cy.findByRole('button', { name: 'Increase indentation' });
    },
    getDedentButton: () => {
      return cy.findByRole('button', { name: 'Decrease indentation' });
    },
  };

  const examples = {
    long: 'This course helps you understand the basics behind Contentful. It contains modules that introduce you to core concepts and how your app consumes content from Contentful. This content is pulled from Contentful APIs using a Contentful SDK.',
    code: 'console.log("This is Javascript code!");',
  };

  const unveilAdditionalButtonsRow = () => {
    selectors.getToggleAdditionalActionsButton().click();
  };

  describe('headings', () => {
    const clickHeading = (value) => {
      selectors.getHeadingsSelectorButton().click({ force: true });
      selectors.getHeadingButton(value).click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickHeading('1');
      checkValue('# ');
      cy.get('.cm-header-1').should('have.text', '# ');

      clickHeading('2');
      checkValue('## ');
      cy.get('.cm-header-2').should('have.text', '## ');

      clickHeading('3');
      checkValue('### ');
      cy.get('.cm-header-3').should('have.text', '### ');

      type('Heading 3{enter}');

      checkValue('### Heading 3\n');
      cy.get('.cm-header-3').should('have.text', '### Heading 3');

      type('Future heading 2');
      clickHeading('2');
      checkValue('### Heading 3\n## Future heading 2');

      clickHeading('2');
      checkValue('### Heading 3\nFuture heading 2');

      type('{enter}{enter}');
      type(examples.long);

      clickHeading('3');
      checkValue(`### Heading 3\nFuture heading 2\n\n### ${examples.long}`);
    });
  });

  describe('bold', () => {
    const clickBold = () => {
      selectors.getBoldButton().click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickBold();
      checkValue('__text in bold__');

      type('bold text');
      checkValue('__bold text__');

      type('{rightarrow}{rightarrow}{enter}');

      type('Sentence a bold word.');
      selectCharsBackwards(1, 9);

      clickBold();
      type(' and not a bold word');
      checkValue('__bold text__\nSentence a __bold word__ and not a bold word.');
    });

    it('should remove boldness to already applied', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('text');

      selectCharsBackwards(0, 4);
      clickBold();

      checkValue('__text__');

      selectCharsBackwards(0, 4);
      clickBold();

      checkValue('text');
    });
  });

  describe('italic', () => {
    const clickItalic = () => {
      selectors.getItalicButton().click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickItalic();
      checkValue('*text in italic*');

      type('italic text');
      checkValue('*italic text*');

      type('{rightarrow}{rightarrow}{enter}');

      type('Sentence an italic word.');

      selectCharsBackwards(1, 11);
      clickItalic();

      type(' and not an italic word');
      checkValue('*italic text*\nSentence an *italic word* and not an italic word.');
    });

    it('should remove italicness to already applied', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('text');

      selectCharsBackwards(0, 4);
      clickItalic();

      checkValue('*text*');

      selectCharsBackwards(0, 4);
      clickItalic();

      checkValue('text');
    });
  });

  describe('quote', () => {
    const clickQuote = () => {
      selectors.getQuoteButton().click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      clickQuote();
      checkValue('> ');

      type('some really smart wisdom');
      type('{enter}');
      type('by some really smart person');
      checkValue('> some really smart wisdom\n> by some really smart person');

      clearAll();

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
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      unveilAdditionalButtonsRow();
      clickCode();
      type('var i = 0;');
      type('{enter}');
      type('i++;');
      checkValue('    var i = 0;\n    i++;');

      clearAll();

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
      renderMarkdownEditor({ spyOnSetValue: true });

      unveilAdditionalButtonsRow();
      clickStrike();
      checkValue('~~striked out~~');

      type('striked text');
      checkValue('~~striked text~~');

      type('{rightarrow}{rightarrow}{enter}');

      type('Sentence a striked out word.');
      selectCharsBackwards(1, 16);
      clickStrike();
      type(' and not a striked out word');
      checkValue('~~striked text~~\nSentence a ~~striked out word~~ and not a striked out word.');
    });

    it('should remove strike to already applied', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      unveilAdditionalButtonsRow();
      type('text');

      selectCharsBackwards(0, 4);
      clickStrike();
      checkValue('~~text~~');

      selectCharsBackwards(0, 4);
      clickStrike();
      checkValue('text');
    });
  });

  describe('unordered list', () => {
    const clickUnorderedList = () => {
      selectors.getUnorderedListButton().click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      clickUnorderedList();
      type('first item');
      type('{enter}');
      type('second item');
      type('{enter}{enter}');
      checkValue('- first item\n- second item\n');

      clearAll();

      type('sentence at the very beginning.');
      clickUnorderedList();
      type('first item{enter}second item');
      checkValue('sentence at the very beginning.\n\n- first item\n- second item\n');

      clearAll();

      type('- first item');
      clickUnorderedList();
      checkValue('first item');

      selectCharsBackwards(0, 4);
      clickUnorderedList();
      checkValue('- first item');
      type('{enter}');
      checkValue('- first item\n- ');
      clickUnorderedList();
      checkValue('- first item\n');
    });

    it('should work properly with selection', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('first item{enter}');
      type('second item{enter}');
      type('third item');

      type('{selectall}{selectall}');
      clickUnorderedList();
      checkValue('- first item\n- second item\n- third item');
    });
  });

  describe('ordered list', () => {
    const clickOrderedList = () => {
      selectors.getOrderedListButton().click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      clickOrderedList();
      type('first item');
      type('{enter}');
      type('second item');
      type('{enter}{enter}');
      checkValue('1. first item\n2. second item\n');

      clearAll();

      type('sentence at the very beginning.');
      clickOrderedList();
      type('first item{enter}second item');
      checkValue('sentence at the very beginning.\n\n1. first item\n2. second item\n');

      clearAll();

      type('1. first item');
      clickOrderedList();
      checkValue('first item');

      selectCharsBackwards(0, 4);
      clickOrderedList();
      checkValue('1. first item');
      type('{enter}');
      checkValue('1. first item\n2. ');
      clickOrderedList();
      checkValue('1. first item\n');
    });

    it('should work properly with selection', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('first item{enter}');
      type('second item{enter}');
      type('third item');

      type('{selectall}{selectall}');
      clickOrderedList();

      checkValue('1. first item\n2. second item\n3. third item');
    });
  });

  describe('horizontal line', () => {
    const clickHorizontalButton = () => {
      selectors.getHorizontalLineButton().click();
    };

    it('should work properly', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      unveilAdditionalButtonsRow();
      clickHorizontalButton();
      checkValue('\n---\n');

      clickHorizontalButton();
      checkValue('\n---\n\n---\n');

      clearAll();

      type('something');
      clickHorizontalButton();
      checkValue('something\n\n---\n');
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
      renderMarkdownEditor({ spyOnSetValue: true });

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
      type('final line');

      checkValue('  something\n    line two\n  line three\nfinal line');
    });
  });
});
