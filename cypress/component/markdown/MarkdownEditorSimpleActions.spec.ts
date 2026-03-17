import {
  renderMarkdownEditor,
  type,
  checkValue,
  selectCharsBackwards,
  clickVisibleButtonByName,
  openAdditionalActions,
} from './utils';

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
      return cy.findByRole('button', { name: 'More actions' });
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
    openAdditionalActions().should('be.visible');
  };

  describe('headings', () => {
    const clickHeading = (value) => {
      selectors.getHeadingsSelectorButton().click();
      selectors.getHeadingButton(value).click();
    };

    it('should insert heading prefixes', () => {
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
    });

    it('should keep heading formatting while typing', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickHeading('3');
      type('Heading 3{enter}');

      checkValue('### Heading 3\n');
      cy.get('.cm-header-3').should('have.text', '### Heading 3');
    });

    it('should toggle headings on existing text', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('### Heading 3{enter}Future heading 2');
      clickHeading('2');
      checkValue('### Heading 3\n## Future heading 2');

      clickHeading('2');
      checkValue('### Heading 3\nFuture heading 2');

      type('{enter}{enter}' + examples.long);
      clickHeading('3');
      checkValue(`### Heading 3\nFuture heading 2\n\n### ${examples.long}`);
    });
  });

  describe('bold', () => {
    const clickBold = () => {
      clickVisibleButtonByName('Bold');
    };

    it('should wrap new text in bold markers', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickBold();
      checkValue('__text in bold__');

      type('bold text');
      checkValue('__bold text__');
    });

    it('should apply bold formatting to selected text', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('__bold text__{rightarrow}{rightarrow}{enter}Sentence a bold word.');
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
      clickVisibleButtonByName('Italic');
    };

    it('should wrap new text in italic markers', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickItalic();
      checkValue('*text in italic*');

      type('italic text');
      checkValue('*italic text*');
    });

    it('should apply italic formatting to selected text', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type('*italic text*{rightarrow}{rightarrow}{enter}Sentence an italic word.');
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
      clickVisibleButtonByName('Quote');
    };

    it('should prefix new lines as a quote', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      clickQuote();
      checkValue('> ');

      type('some really smart wisdom{enter}by some really smart person');
      checkValue('> some really smart wisdom\n> by some really smart person');
    });

    it('should toggle quote formatting on existing text', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type(examples.long);

      clickQuote();
      checkValue(`> ${examples.long}`);

      clickQuote();
      checkValue(examples.long);
    });
  });

  describe('code', () => {
    const clickCode = () => {
      clickVisibleButtonByName('Code block');
    };

    it('should indent new lines as code', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      unveilAdditionalButtonsRow();
      clickCode();
      type('var i = 0;{enter}i++;');
      checkValue('    var i = 0;\n    i++;');
    });

    it('should toggle existing text as code', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      type(examples.code);

      unveilAdditionalButtonsRow();
      clickCode();
      checkValue(`    ${examples.code}`);

      clickCode();
      checkValue(examples.code);
    });
  });

  describe('strike', () => {
    const clickStrike = () => {
      clickVisibleButtonByName('Strike out');
    };

    it('should wrap new text in strike markers', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      unveilAdditionalButtonsRow();
      clickStrike();
      checkValue('~~striked out~~');

      type('striked text');
      checkValue('~~striked text~~');
    });

    it('should apply strike formatting to selected text', () => {
      renderMarkdownEditor({ spyOnSetValue: true });

      unveilAdditionalButtonsRow();
      type('~~striked text~~{rightarrow}{rightarrow}{enter}Sentence a striked out word.');
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
      clickVisibleButtonByName('Unordered list');
    };

    it('should create a list from new lines', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      clickUnorderedList();
      type('first item{enter}second item{enter}{enter}');
      checkValue('- first item\n- second item\n');
    });

    it('should create a list after existing text', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      type('sentence at the very beginning.');
      clickUnorderedList();
      type('first item{enter}second item');
      checkValue('sentence at the very beginning.\n\n- first item\n- second item\n');
    });

    it('should toggle unordered list items off and on', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

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

      type('first item{enter}second item{enter}third item');

      type('{selectall}{selectall}');
      clickUnorderedList();
      checkValue('- first item\n- second item\n- third item');
    });
  });

  describe('ordered list', () => {
    const clickOrderedList = () => {
      clickVisibleButtonByName('Ordered list');
    };

    it('should create an ordered list from new lines', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      clickOrderedList();
      type('first item{enter}second item{enter}{enter}');
      checkValue('1. first item\n2. second item\n');
    });

    it('should create an ordered list after existing text', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      type('sentence at the very beginning.');
      clickOrderedList();
      type('first item{enter}second item');
      checkValue('sentence at the very beginning.\n\n1. first item\n2. second item\n');
    });

    it('should toggle ordered list items off and on', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

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

      type('first item{enter}second item{enter}third item');

      type('{selectall}{selectall}');
      clickOrderedList();

      checkValue('1. first item\n2. second item\n3. third item');
    });
  });

  describe('horizontal line', () => {
    const clickHorizontalButton = () => {
      clickVisibleButtonByName('Horizontal rule');
    };

    it('should insert horizontal rules', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      unveilAdditionalButtonsRow();
      clickHorizontalButton();
      checkValue('\n---\n');

      clickHorizontalButton();
      checkValue('\n---\n\n---\n');
    });

    it('should insert a horizontal rule after text', () => {
      renderMarkdownEditor({ spyOnSetValue: true, spyOnRemoveValue: true });

      type('something');
      unveilAdditionalButtonsRow();
      clickHorizontalButton();
      checkValue('something\n\n---\n');
    });
  });

  describe('indent and dedent', () => {
    const clickIndentButton = () => {
      clickVisibleButtonByName('Increase indentation');
    };

    const clickDedentButton = () => {
      clickVisibleButtonByName('Decrease indentation');
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
