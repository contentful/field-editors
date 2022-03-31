/* eslint-disable mocha/no-setup-in-describe */

import { MARKS, BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  document as doc,
  block,
  inline,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import documentWithLinks from './document-mocks/documentWithLinks';
import invalidDocumentNormalizable from './document-mocks/invalidDocumentNormalizable';
import { EmbedType, RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const mod = IS_MAC ? 'meta' : 'control';
  const buildHelper =
    (type) =>
    (...children) =>
      block(type, {}, ...children);
  const paragraph = buildHelper(BLOCKS.PARAGRAPH);
  const paragraphWithText = (t) => paragraph(text(t, []));
  const emptyParagraph = () => paragraphWithText('');
  const expectDocumentToBeEmpty = () => richText.expectValue(undefined);
  const entryBlock = () =>
    block(BLOCKS.EMBEDDED_ENTRY, {
      target: {
        sys: {
          id: 'example-entity-id',
          type: 'Link',
          linkType: 'Entry',
        },
      },
    });
  const assetBlock = () =>
    block(BLOCKS.EMBEDDED_ASSET, {
      target: {
        sys: {
          id: 'example-entity-id',
          type: 'Link',
          linkType: 'Asset',
        },
      },
    });

  const keys = {
    enter: { keyCode: 13, which: 13, key: 'Enter' },
    backspace: { keyCode: 8, which: 8, key: 'Backspace' },
  };

  const headings = [
    [BLOCKS.PARAGRAPH, 'Normal text'],
    [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
    [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
    [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
    [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
    [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
    [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
  ];

  function pressEnter() {
    richText.editor.trigger('keydown', keys.enter);
  }

  function getDropdownList() {
    return cy.findByTestId('dropdown-heading-list');
  }

  function getDropdownItem(type: string) {
    return cy.findByTestId(`dropdown-option-${type}`);
  }

  function addBlockquote(content = '') {
    richText.editor.click().type(content);

    richText.toolbar.quote.click();

    const expectedValue = doc(
      block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text(content, []))),
      block(BLOCKS.PARAGRAPH, {}, text('', []))
    );

    richText.expectValue(expectedValue);

    return expectedValue;
  }

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  it('is empty by default', () => {
    cy.editorEvents().should('deep.equal', []);
  });

  it('disable all editor actions on readonly mode', () => {
    cy.setInitialValue(
      doc(
        paragraphWithText('text'),
        block(
          BLOCKS.TABLE,
          {},
          block(
            BLOCKS.TABLE_ROW,
            {},
            block(BLOCKS.TABLE_HEADER_CELL, {}, paragraphWithText('heading 1')),
            block(BLOCKS.TABLE_HEADER_CELL, {}, paragraphWithText('heading 2'))
          ),
          block(
            BLOCKS.TABLE_ROW,
            {},
            block(BLOCKS.TABLE_CELL, {}, paragraphWithText('cell 1')),
            block(BLOCKS.TABLE_CELL, {}, paragraphWithText('cell 2'))
          )
        ),
        emptyParagraph()
      )
    );

    cy.setInitialDisabled(true);

    // Necessary for reading the correct LocalStorage values as we do
    // the initial page load on the beforeEach hook
    cy.reload();

    richText.toolbar.bold.should('be.disabled');
    richText.toolbar.headingsDropdown.should('be.disabled');
    richText.toolbar.hr.should('be.disabled');
    richText.toolbar.hyperlink.should('be.disabled');
    richText.toolbar.italic.should('be.disabled');
    richText.toolbar.ol.should('be.disabled');
    richText.toolbar.quote.should('be.disabled');
    richText.toolbar.table.should('be.disabled');
    richText.toolbar.ul.should('be.disabled');
    richText.toolbar.underline.should('be.disabled');
    richText.toolbar.embedDropdown.should('be.disabled');
  });

  it('allows typing', () => {
    richText.editor.click().type('some text').click();

    const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text')));

    richText.expectValue(expectedValue);
  });

  describe('history', () => {
    it('supports undo and redo', () => {
      const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text.')));

      // type
      richText.editor.click().type('some text.').click();

      richText.expectValue(expectedValue);

      // undo
      richText.editor.click().type(`{${mod}}z`).click();
      richText.expectValue(undefined);

      // redo
      richText.editor.click().type(`{${mod}}{shift}z`).click();
      richText.expectValue(expectedValue);
    });

    it('correctly undoes after drag&drop', () => {
      const paragraph = block(BLOCKS.PARAGRAPH, {}, text('some text.'));
      const docBeforeDragAndDrop = doc(paragraph, entryBlock(), emptyParagraph());

      // type text, insert entry block
      richText.editor.click().type('some text.').click();
      richText.toolbar.embed('entry-block');
      richText.expectValue(docBeforeDragAndDrop);

      // drag & drop
      cy.findByTestId('cf-ui-entry-card')
        .parent()
        .parent()
        .dragTo(() => richText.editor.findByText('some text.'));
      if (Cypress.browser.name === 'firefox') {
        richText.expectValue(doc(entryBlock(), paragraph, emptyParagraph()));
      } else {
        richText.expectValue(
          doc(
            block(BLOCKS.PARAGRAPH, {}, text('some')),
            entryBlock(),
            block(BLOCKS.PARAGRAPH, {}, text(' text.')),
            emptyParagraph()
          )
        );
      }

      // undo
      // Ensures that drag&drop was recoreded in a separate history batch,
      // undoing should not delete the entry block.
      // See the Slate bug report: https://github.com/ianstormtaylor/slate/issues/4694
      richText.editor.click().type(`{${mod}}z`).click();
      richText.expectValue(docBeforeDragAndDrop);
    });
  });

  describe('Marks', () => {
    [
      [MARKS.BOLD, `{${mod}}b`],
      [MARKS.ITALIC, `{${mod}}i`],
      [MARKS.UNDERLINE, `{${mod}}u`],
      [MARKS.CODE, `{${mod}}/`],
    ].forEach(([mark, shortcut]) => {
      const toggleMarkViaToolbar = () => cy.findByTestId(`${mark}-toolbar-button`).click();

      describe(`${mark} mark toggle via toolbar`, () => {
        it('allows writing marked text', () => {
          richText.editor.click();

          toggleMarkViaToolbar();

          richText.editor.type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          richText.editor.click().type('some text{selectall}');

          toggleMarkViaToolbar();

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          richText.editor.click();

          toggleMarkViaToolbar();
          toggleMarkViaToolbar();

          richText.editor.type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          richText.editor.click().type('some text{selectall}');

          toggleMarkViaToolbar();

          cy.wait(100);

          richText.editor.click().type('{selectall}');

          toggleMarkViaToolbar();

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });
      });

      describe(`${mark} mark toggle via shortcut`, () => {
        it('allows writing marked text', () => {
          richText.editor.click().type(shortcut).type('some text');

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing marked text by selecting text', () => {
          richText.editor.click().type('some text');

          cy.wait(100);

          richText.editor.type('{selectall}').type(shortcut);

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [{ type: mark }]))
          );

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text', () => {
          richText.editor.click().type(shortcut).type(shortcut).type('some text');

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });

        it('allows writing unmarked text by selecting text', () => {
          richText.editor.click().type('some text');

          cy.wait(100);

          richText.editor.type('{selectall}').type(shortcut).type('{selectall}').type(shortcut);

          const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('some text', [])));

          richText.expectValue(expectedValue);
        });
      });
    });
  });

  describe('HR', () => {
    describe('toolbar button', () => {
      it('should be visible', () => {
        richText.toolbar.hr.should('be.visible');
      });

      it('should add a new line when clicking', () => {
        richText.editor.click().type('some text');

        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should end with an empty paragraph', () => {
        richText.editor.click().type('some text');

        richText.toolbar.hr.click();
        richText.toolbar.hr.click();
        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should split blockquote', () => {
        addBlockquote('some text');

        richText.editor.type('{enter}some text{uparrow}');

        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
          block(BLOCKS.HR, {}),
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      // TODO: Seems to be failing on CI
      // eslint-disable-next-line mocha/no-skipped-tests
      it.skip('should add line if HR is the first void block', () => {
        richText.editor.click();

        richText.toolbar.hr.click();

        // Not necessary for the test but here to "force" waiting until
        // we have the expected document structure
        richText.expectValue(doc(block(BLOCKS.HR, {}), block(BLOCKS.PARAGRAPH, {}, text('', []))));

        // Move arrow up to select the HR then press ENTER
        richText.editor.click().type('{uparrow}{enter}');

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('', [])),
          block(BLOCKS.HR, {}),
          block(BLOCKS.PARAGRAPH, {}, text('', []))
        );

        richText.expectValue(expectedValue);
      });

      it('should select all and delete if HR is the first void block', () => {
        richText.editor.click();

        richText.toolbar.hr.click();

        richText.editor.click().type('hey').type('{selectall}{del}');

        // editor is empty
        richText.expectValue(undefined);
      });

      it('should be selected on backspace', () => {
        richText.editor.click();

        richText.toolbar.hr.click();
        richText.editor.type('X');

        richText.expectValue(doc(block(BLOCKS.HR, {}), paragraphWithText('X')));

        richText.editor.type('{backspace}{backspace}');

        richText.expectValue(doc(block(BLOCKS.HR, {}), emptyParagraph()));

        richText.editor.type('{backspace}');

        expectDocumentToBeEmpty();
      });
    });
  });

  describe('Headings', () => {
    headings.forEach(([type, label, shortcut]) => {
      describe(label, () => {
        it(`allows typing ${label} (${type})`, () => {
          richText.editor.click().type('some text');

          richText.toolbar.toggleHeading(type);

          // TODO: We should somehow assert that the editor is focused after this.

          // Account for trailing paragraph
          const expectedValue =
            type === BLOCKS.PARAGRAPH
              ? doc(block(type, {}, text('some text', [])))
              : doc(block(type, {}, text('some text', [])), emptyParagraph());

          richText.expectValue(expectedValue);
        });

        if (shortcut) {
          it(`allows writing ${label} (${type}) via hotkeys ${shortcut}`, () => {
            richText.editor.click().type(shortcut).type('some text');

            const expectedValue = doc(block(type, {}, text('some text', [])), emptyParagraph());

            richText.expectValue(expectedValue);
          });
        }

        it(`should set the dropdown label to ${label}`, () => {
          richText.editor.click().type('some text');

          richText.toolbar.toggleHeading(type);

          richText.toolbar.headingsDropdown.should('have.text', label);
        });

        // TODO: Move this test to either a single test with multiple assertions or for only one heading type due to performance
        if (type !== BLOCKS.PARAGRAPH) {
          it('should unwrap blockquote', () => {
            addBlockquote('some text');

            richText.toolbar.toggleHeading(type);

            const expectedHeadingValue = doc(
              block(type, {}, text('some text', [])),
              block(BLOCKS.PARAGRAPH, {}, text('', []))
            );

            richText.expectValue(expectedHeadingValue);
          });
        } else {
          it('should not unwrap blockquote', () => {
            const expectedQuoteValue = addBlockquote('some text');

            richText.toolbar.toggleHeading(type);

            richText.expectValue(expectedQuoteValue);
          });
        }

        it('should be deleted if empty when pressing delete', () => {
          richText.editor.click(); // to set an initial editor.location

          richText.toolbar.toggleHeading(type);

          richText.editor.type('x{enter}');

          richText.toolbar.embed('entry-block');

          // To make sure paragraph/heading is present
          richText.expectValue(doc(block(type, {}, text('x')), entryBlock(), emptyParagraph()));

          richText.editor
            .click('bottom')
            // Using `delay` to avoid flakiness, cypress triggers a keypress every 10ms and the editor was not responding correcrly
            .type('{uparrow}{uparrow}{uparrow}{del}{del}', { delay: 100 });

          richText.expectValue(doc(entryBlock(), emptyParagraph()));
        });

        it('should delete next block if not empty when pressing delete', () => {
          const value = 'some text';
          richText.editor.click().type(value);

          richText.toolbar.toggleHeading(type);

          richText.toolbar.embed('entry-block');

          // Using `delay` to avoid flakiness, cypress triggers a keypress every 10ms and the editor was not responding correcrly
          richText.editor.type('{leftarrow}{del}', { delay: 100 });

          richText.expectValue(doc(block(type, {}, text(value)), emptyParagraph()));
        });
      });
    });

    describe('Toolbar', () => {
      it('should be visible', () => {
        richText.toolbar.headingsDropdown.should('be.visible');

        richText.toolbar.headingsDropdown.click();
        getDropdownList().should('be.visible');
      });

      it(`should have ${headings.length} items`, () => {
        richText.toolbar.headingsDropdown.click();
        getDropdownList().children().should('have.length', headings.length);

        headings.forEach(([, label], index) => {
          getDropdownList().children().eq(index).should('have.text', label);
        });
      });
    });
  });

  describe('Quote', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar',
        () => {
          richText.toolbar.quote.click();
        },
      ],
      [
        'using hotkey (mod+shift+1)',
        () => {
          richText.editor.type(`{${mod}}{shift}1`);
        },
      ],
    ];

    for (const [scenario, toggleQuote] of methods) {
      describe(scenario, () => {
        it('the toolbar button should be visible', () => {
          richText.toolbar.quote.should('be.visible');
        });

        it('should toggle off empty quotes on backspace', () => {
          richText.editor.click();

          toggleQuote();

          richText.editor.type('{backspace}');

          richText.expectSnapshotValue();
        });

        it('should add a block quote when clicking followed by a trailing empty paragraph', () => {
          richText.editor.click();

          toggleQuote();

          const expectedValue = doc(
            block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('', []))),
            block(BLOCKS.PARAGRAPH, {}, text('', []))
          );

          richText.expectValue(expectedValue);
        });

        it('should convert existing paragraph into a block quote', () => {
          richText.editor.click().type('some text');

          toggleQuote();

          const expectedValue = doc(
            block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', []))),
            block(BLOCKS.PARAGRAPH, {}, text('', []))
          );

          richText.expectValue(expectedValue);
        });

        it('should convert block quote back to paragraph', () => {
          richText.editor.click().type('some text');

          toggleQuote();
          toggleQuote();

          const expectedValue = doc(
            block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
            block(BLOCKS.PARAGRAPH, {}, text('', []))
          );

          richText.expectValue(expectedValue);
        });

        it('should add multi-paragraph block quotes', () => {
          richText.editor.click().type('paragraph 1');

          toggleQuote();

          richText.editor.type('{enter}').type('paragraph 2');

          const expectedValue = doc(
            block(
              BLOCKS.QUOTE,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('paragraph 1', [])),
              block(BLOCKS.PARAGRAPH, {}, text('paragraph 2', []))
            ),
            block(BLOCKS.PARAGRAPH, {}, text('', []))
          );

          richText.expectValue(expectedValue);
        });

        it('should preserve marks & inline elements', () => {
          richText.editor.click();
          // bold underline italic code [link] [inline-entry] more text
          richText.editor.paste({
            'application/x-slate-fragment':
              'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmJvbGQlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIwJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjJpdGFsaWMlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyaXRhbGljJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMnVuZGVybGluZSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJ1bmRlcmxpbmUlMjIlM0F0cnVlJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMCUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyY29kZSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJjb2RlJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ1cmklMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUuY29tJTIyJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMmxpbmslMjIlN0QlNUQlN0QlMkMlN0IlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIydGV4dCUyMiUzQSUyMiUyMCUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJlbWJlZGRlZC1lbnRyeS1pbmxpbmUlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjJleGFtcGxlLWVudGl0eS1pZCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJMaW5rJTIyJTJDJTIybGlua1R5cGUlMjIlM0ElMjJFbnRyeSUyMiU3RCU3RCU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBtb3JlJTIwdGV4dCUyMiU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RA==',
          });

          toggleQuote();

          richText.expectSnapshotValue();
        });
      });
    }
  });

  describe('New Line', () => {
    it('should add a new line on a paragraph', () => {
      richText.editor
        .click()
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

      const expectedValue = doc(
        block(BLOCKS.PARAGRAPH, {}, text('some text 1\nsome text 2\nsome text 3'))
      );

      richText.expectValue(expectedValue);
    });

    it('should add a new line on a heading', () => {
      richText.editor.click();

      richText.toolbar.toggleHeading(BLOCKS.HEADING_1);

      richText.editor
        .type('some text 1')
        .type('{shift+enter}')
        .type('some text 2')
        .type('{shift+enter}')
        .type('some text 3');

      const expectedValue = doc(
        block(BLOCKS.HEADING_1, {}, text('some text 1\nsome text 2\nsome text 3')),
        emptyParagraph()
      );

      richText.expectValue(expectedValue);
    });

    describe('in a list', () => {
      it('should add a new line', () => {
        richText.editor.click();

        richText.toolbar.ul.click();

        richText.editor
          .type('some text 1')
          .type('{shift+enter}')
          .type('some text 2')
          .type('{shift+enter}')
          .type('some text 3');

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('some text 1\nsome text 2\nsome text 3', []))
            )
          ),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should add a new line after entity block in same list item', () => {
        richText.editor.click();

        richText.toolbar.ul.click();

        richText.editor
          .type('some text 1')
          .type('{enter}')
          .type(`{${mod}+shift+e}`)
          .type('{enter}')
          .type('some more text')
          .type(`{${mod}+shift+e}`)
          .type('{enter}');

        richText.expectSnapshotValue();
      });
    });
  });

  describe('Tables', () => {
    const table = buildHelper(BLOCKS.TABLE);
    const row = buildHelper(BLOCKS.TABLE_ROW);
    const cell = buildHelper(BLOCKS.TABLE_CELL);
    const header = buildHelper(BLOCKS.TABLE_HEADER_CELL);
    const emptyCell = () => cell(emptyParagraph());
    const emptyHeader = () => header(emptyParagraph());
    const cellWithText = (t) => cell(paragraphWithText(t));
    const headerWithText = (t) => header(paragraphWithText(t));
    const insertTable = () => {
      richText.editor.click();
      richText.toolbar.table.click();
      return richText.editor;
    };
    const insertTableWithExampleData = () => {
      insertTable()
        .type('foo')
        .type('{rightarrow}')
        .type('bar')
        .type('{rightarrow}')
        .type('baz')
        .type('{rightarrow}')
        .type('quux');
    };
    const expectDocumentStructure = (...elements) => {
      richText.expectValue(doc(...elements, emptyParagraph()));
    };
    const expectTable = (...tableElements) => expectDocumentStructure(table(...tableElements));

    // We know this feature doesn't work on firefox, we skip it
    if (Cypress.browser.family !== 'firefox') {
      it('inserts new line before table', () => {
        // prevent expected error `Cannot resolve a Slate point from DOM point` from failing this test
        Cypress.on('uncaught:exception', (err) => {
          if (
            err.message.includes(
              'Cannot resolve a Slate point from DOM point: [object HTMLDivElement],0'
            )
          ) {
            return false;
          }

          // we still want the test to fail in case there's any other error
          return true;
        });

        insertTable();

        richText.editor.type('{uparrow}{enter}');

        richText.expectValue(
          doc(
            emptyParagraph(),

            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph()
          )
        );
      });
    }

    it('disables block element toolbar buttons when selected', () => {
      insertTable();

      const blockElements = ['quote', 'ul', 'ol', 'hr', 'table'];

      blockElements.forEach((el) => {
        richText.toolbar[el].should('be.disabled');
      });

      richText.toolbar.headingsDropdown.should('be.disabled');

      // select outside the table
      richText.editor.click().type('{downarrow}').wait(100);

      blockElements.forEach((el) => {
        cy.findByTestId(`${el}-toolbar-button`).should('not.be.disabled');
      });

      richText.toolbar.headingsDropdown.click();
      [
        BLOCKS.PARAGRAPH,
        BLOCKS.HEADING_1,
        BLOCKS.HEADING_2,
        BLOCKS.HEADING_3,
        BLOCKS.HEADING_4,
        BLOCKS.HEADING_5,
        BLOCKS.HEADING_6,
      ].map((type) => getDropdownItem(type).get('button').should('not.be.disabled'));
    });

    describe('Inserting Tables', () => {
      it('replaces empty paragraphs with tables', () => {
        insertTable();

        richText.expectValue(
          doc(
            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph()
          )
        );
      });

      it('inserts new table below if paragraph is not empty', () => {
        richText.editor.type('foo');

        insertTable();

        richText.expectValue(
          doc(
            paragraphWithText('foo'),
            table(row(emptyHeader(), emptyHeader()), row(emptyCell(), emptyCell())),
            emptyParagraph()
          )
        );
      });

      describe('Toolbar', () => {
        const buttonsToDisableTable = ['ul', 'ol', 'quote'];

        it(`should disable table button if ${buttonsToDisableTable.join(
          ', '
        )} elements are focused`, () => {
          buttonsToDisableTable.forEach((button) => {
            richText.editor.click();

            cy.findByTestId(`${button}-toolbar-button`).click();

            richText.toolbar.table.should('be.disabled');
          });
        });
      });
    });

    describe('Deleting text', () => {
      describe('Backward deletion', () => {
        it('removes the text, not the cell', () => {
          insertTableWithExampleData();
          richText.editor.find('table > tbody > tr:last-child > td:last-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell())
          );

          // make sure it works for table header cells, too
          richText.editor.find('table > tbody > tr:first-child > th:first-child').click();
          richText.editor
            .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Backspace' }); // 8 = delete/backspace

          expectTable(
            row(emptyHeader(), headerWithText('bar')),
            row(cellWithText('baz'), emptyCell())
          );
        });
      });

      describe('Forward deletion', () => {
        it('removes the text, not the cell', () => {
          insertTableWithExampleData();
          richText.editor.find('table > tbody > tr:first-child > th:first-child').click();
          richText.editor
            .type('{leftarrow}{leftarrow}{leftarrow}{del}{del}{del}{del}')
            // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Delete' }) // 8 = delete/backspace
            // try forward-deleting from outside the table for good measure
            .type('{leftarrow}{del}')
            .trigger('keydown', { keyCode: 8, which: 8, key: 'Delete' });
          expectTable(
            row(headerWithText(''), headerWithText('bar')),
            row(cellWithText('baz'), cellWithText('quux'))
          );
        });
      });
    });

    describe('Table Actions', () => {
      const findAction = (action: string) => {
        cy.findByTestId('cf-table-actions-button').click();
        return cy.findByText(action);
      };

      const doAction = (action: string) => {
        findAction(action).click({ force: true });
      };

      beforeEach(() => {
        insertTableWithExampleData();
      });

      describe('adds row above', () => {
        it('with table header cell', () => {
          // Delete the table that was added in the beforeEach clause
          // because we need the focus to be on the first row
          doAction('Delete table');

          // Insert an empty table (focus is on first row by default)
          insertTable();

          findAction('Add row above').should('be.disabled');
        });

        it('with table cell', () => {
          doAction('Add row above');

          expectTable(
            row(headerWithText('foo'), headerWithText('bar')),
            row(emptyCell(), emptyCell()),
            row(cellWithText('baz'), cellWithText('quux'))
          );
        });
      });

      it('adds row below', () => {
        doAction('Add row below');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux')),
          row(emptyCell(), emptyCell())
        );
      });

      it('adds column left', () => {
        doAction('Add column left');

        expectTable(
          row(headerWithText('foo'), emptyHeader(), headerWithText('bar')),
          row(cellWithText('baz'), emptyCell(), cellWithText('quux'))
        );
      });

      it('adds column right', () => {
        doAction('Add column right');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar'), emptyHeader()),
          row(cellWithText('baz'), cellWithText('quux'), emptyCell())
        );
      });

      it('enables/disables table header', () => {
        doAction('Disable table header');

        expectTable(
          row(cellWithText('foo'), cellWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux'))
        );

        doAction('Enable table header');

        expectTable(
          row(headerWithText('foo'), headerWithText('bar')),
          row(cellWithText('baz'), cellWithText('quux'))
        );
      });

      it('deletes row', () => {
        doAction('Delete row');

        expectTable(row(headerWithText('foo'), headerWithText('bar')));
      });

      it('deletes column', () => {
        doAction('Delete column');

        expectTable(row(headerWithText('foo')), row(cellWithText('baz')));
      });

      it('deletes table', () => {
        doAction('Delete table');

        expectDocumentToBeEmpty();
      });
    });
  });

  describe('Links', () => {
    const expectDocumentStructure = (...nodes) => {
      richText.expectValue(
        doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            ...nodes.map(([nodeType, ...content]) => {
              if (nodeType === 'text') return text(...content);
              const [data, textContent] = content;
              return inline(nodeType, data, text(textContent));
            })
          )
        )
      );
    };

    // Type and wait for the text to be persisted
    const safelyType = (text: string) => {
      richText.editor.type(text);

      expectDocumentStructure(['text', text.replace('{selectall}', '')]);
    };

    const methods: [string, () => void][] = [
      [
        'using the link toolbar button',
        () => {
          richText.toolbar.hyperlink.click();
        },
      ],
      [
        'using the link keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}}k`);
        },
      ],
    ];

    for (const [triggerMethod, triggerLinkModal] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes hyperlinks', () => {
          safelyType('The quick brown fox jumps over the lazy ');

          triggerLinkModal();

          const form = richText.forms.hyperlink;
          form.submit.should('be.disabled');

          form.linkText.type('dog');
          form.submit.should('be.disabled');

          form.linkTarget.type('https://zombo.com');
          form.submit.should('not.be.disabled');

          form.submit.click();

          expectDocumentStructure(
            ['text', 'The quick brown fox jumps over the lazy '],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'dog'],
            ['text', '']
          );

          richText.editor.click().type('{selectall}');
          // TODO: This should just be
          // ```
          // triggerLinkModal();
          // ``
          // but with the keyboard shortcut, this causes an error in Cypress I
          // haven't been able to replicate in the editor. As it's not
          // replicable in "normal" usage we use the toolbar button both places
          // in this test.
          cy.findByTestId('hyperlink-toolbar-button').click();

          expectDocumentStructure(
            // TODO: the editor should normalize this
            ['text', 'The quick brown fox jumps over the lazy '],
            ['text', 'dog']
          );
        });

        it('converts text to URL hyperlink', () => {
          safelyType('My cool website{selectall}');

          triggerLinkModal();
          const form = richText.forms.hyperlink;

          form.linkText.should('have.value', 'My cool website');
          form.linkType.should('have.value', 'hyperlink');
          form.submit.should('be.disabled');

          form.linkTarget.type('https://zombo.com');
          form.submit.should('not.be.disabled');

          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );
        });

        it('converts text to entry hyperlink', () => {
          safelyType('My cool entry{selectall}');
          triggerLinkModal();
          const form = richText.forms.hyperlink;

          form.linkText.should('have.value', 'My cool entry');
          form.submit.should('be.disabled');

          form.linkType.should('have.value', 'hyperlink').select('entry-hyperlink');
          form.submit.should('be.disabled');

          cy.findByTestId('cf-ui-entry-card').should('not.exist');
          form.linkEntityTarget.should('have.text', 'Select entry').click();
          cy.findByTestId('cf-ui-entry-card').should('exist');

          form.linkEntityTarget.should('have.text', 'Remove selection').click();
          cy.findByTestId('cf-ui-entry-card').should('not.exist');

          form.linkEntityTarget.should('have.text', 'Select entry').click();
          cy.findByTestId('cf-ui-entry-card').should('exist');

          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ENTRY_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } } },
              'My cool entry',
            ],
            ['text', '']
          );
        });

        it('converts text to asset hyperlink', () => {
          safelyType('My cool asset{selectall}');

          triggerLinkModal();

          const form = richText.forms.hyperlink;

          form.linkText.should('have.value', 'My cool asset');
          form.submit.should('be.disabled');

          form.linkType.should('have.value', 'hyperlink').select('asset-hyperlink');
          form.submit.should('be.disabled');

          cy.findByTestId('cf-ui-asset-card').should('not.exist');
          form.linkEntityTarget.should('have.text', 'Select asset').click();
          cy.findByTestId('cf-ui-asset-card').should('exist');

          form.linkEntityTarget.should('have.text', 'Remove selection').click();
          cy.findByTestId('cf-ui-asset-card').should('not.exist');

          form.linkEntityTarget.should('have.text', 'Select asset').click();
          cy.findByTestId('cf-ui-asset-card').should('exist');

          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ASSET_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Asset' } } },
              'My cool asset',
            ],
            ['text', '']
          );
        });

        it('edits hyperlinks', () => {
          safelyType('My cool website{selectall}');

          triggerLinkModal();

          // Part 1:
          // Create a hyperlink
          const form = richText.forms.hyperlink;

          form.linkText.should('have.value', 'My cool website');
          form.linkTarget.type('https://zombo.com');
          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );

          // Part 2:
          // Update hyperlink to entry link

          richText.editor
            .findByTestId('cf-ui-text-link')
            .should('have.text', 'My cool website')
            .click({ force: true });

          form.linkText.should('not.exist');
          form.linkType.should('have.value', 'hyperlink').select('entry-hyperlink');
          form.linkEntityTarget.should('have.text', 'Select entry').click();
          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ENTRY_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } } },
              'My cool website',
            ],
            ['text', '']
          );

          // Part 3:
          // Update entry link to asset link

          richText.editor
            .findByTestId('cf-ui-text-link')
            .should('have.text', 'My cool website')
            .click({ force: true });

          form.linkText.should('not.exist');
          form.linkType.should('have.value', 'entry-hyperlink').select('asset-hyperlink');
          form.linkEntityTarget.should('have.text', 'Select asset').click();
          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [
              INLINES.ASSET_HYPERLINK,
              { target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Asset' } } },
              'My cool website',
            ],
            ['text', '']
          );

          // Part 3:
          // Update asset link to hyperlink

          richText.editor
            .findByTestId('cf-ui-text-link')
            .should('have.text', 'My cool website')
            .click({ force: true });

          form.linkText.should('not.exist');
          form.linkType.should('have.value', 'asset-hyperlink').select('hyperlink');
          form.linkTarget.type('https://zombo.com');
          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://zombo.com' }, 'My cool website'],
            ['text', '']
          );
        });

        it('is removed from the document structure when empty', () => {
          richText.editor.click();

          triggerLinkModal();

          const form = richText.forms.hyperlink;

          form.linkText.type('Link');
          form.linkTarget.type('https://link.com');
          form.submit.click();

          expectDocumentStructure(
            ['text', ''],
            [INLINES.HYPERLINK, { uri: 'https://link.com' }, 'Link'],
            ['text', '']
          );

          richText.editor
            .click()
            .type('{backspace}{backspace}{backspace}{backspace}', { delay: 100 });

          richText.expectValue(undefined);
        });
      });
    }
  });

  describe('Embedded Entry Blocks', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          richText.toolbar.embed('entry-block');
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+e}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedEntry] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.editor.find('[data-entity-id="example-entity-id"]').click();

          richText.editor.trigger('keydown', keys.enter);

          richText.expectValue(doc(emptyParagraph(), entryBlock(), emptyParagraph()));
        });

        it('adds paragraph between two blocks when pressing enter', () => {
          function addEmbeddedEntry() {
            richText.editor.click('bottom').then(triggerEmbeddedEntry);
            richText.editor.click('bottom');
          }

          addEmbeddedEntry();
          addEmbeddedEntry();

          // Inserts paragraph before embed because it's in the first line.
          richText.editor.get('[data-entity-id="example-entity-id"]').first().click();
          pressEnter();

          // inserts paragraph in-between embeds.
          richText.editor.get('[data-entity-id="example-entity-id"]').first().click();
          pressEnter();

          richText.expectValue(
            doc(emptyParagraph(), entryBlock(), emptyParagraph(), entryBlock(), emptyParagraph())
          );
        });

        it('adds and removes embedded entries', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.expectValue(doc(entryBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('card-action-remove').click();

          richText.expectValue(undefined);
        });

        it('adds and removes embedded entries by selecting and pressing `backspace`', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.expectValue(doc(entryBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-entry-card').click();
          // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
          richText.editor.trigger('keydown', keys.backspace);

          richText.expectValue(undefined);
        });

        it('adds embedded entries between words', () => {
          richText.editor
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedEntry);

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              entryBlock(),
              block(BLOCKS.PARAGRAPH, {}, text('bar'))
            )
          );
        });

        it('should be selected on backspace', () => {
          richText.editor.click();
          triggerEmbeddedEntry();

          richText.editor.type('{downarrow}X');

          richText.expectValue(doc(entryBlock(), paragraphWithText('X')));

          richText.editor.type('{backspace}{backspace}');

          richText.expectValue(doc(entryBlock(), emptyParagraph()));

          richText.editor.type('{backspace}');

          expectDocumentToBeEmpty();
        });
      });
    }
  });

  describe('Embedded Asset Blocks', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          richText.toolbar.embed('asset-block');
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+a}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds paragraph before the block when pressing enter if the block is first document node', () => {
          richText.editor.click();
          triggerEmbeddedAsset();

          richText.editor.find('[data-entity-id="example-entity-id"]').click();

          richText.editor.trigger('keydown', keys.enter);

          richText.expectValue(doc(emptyParagraph(), assetBlock(), emptyParagraph()));
        });

        it('adds paragraph between two blocks when pressing enter', () => {
          function addEmbeddedAsset() {
            richText.editor.click('bottom').then(triggerEmbeddedAsset);
            richText.editor.click('bottom');
          }

          addEmbeddedAsset();
          addEmbeddedAsset();

          // Press enter on the first asset block
          richText.editor.click().get('[data-entity-id="example-entity-id"]').first().click();
          pressEnter();

          // Press enter on the second asset block
          richText.editor.click().get('[data-entity-id="example-entity-id"]').first().click();
          pressEnter();

          richText.expectValue(
            doc(emptyParagraph(), assetBlock(), emptyParagraph(), assetBlock(), emptyParagraph())
          );
        });

        it('adds and removes embedded assets', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectValue(doc(assetBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('card-action-remove').click();

          richText.expectValue(undefined);
        });

        it('adds and removes embedded assets by selecting and pressing `backspace`', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectValue(doc(assetBlock(), emptyParagraph()));

          cy.findByTestId('cf-ui-asset-card').click();
          // .type('{backspace}') does not work on non-typable elements.(contentEditable=false)
          richText.editor.trigger('keydown', keys.backspace);

          richText.expectValue(undefined);
        });

        it('adds embedded assets between words', () => {
          richText.editor
            .click()
            .type('foobar{leftarrow}{leftarrow}{leftarrow}')
            .then(triggerEmbeddedAsset);

          richText.expectValue(
            doc(
              block(BLOCKS.PARAGRAPH, {}, text('foo')),
              assetBlock(),
              block(BLOCKS.PARAGRAPH, {}, text('bar'))
            )
          );
        });

        it('downloads assets', () => {
          richText.editor.click().then(triggerEmbeddedAsset);
          cy.findByTestId('cf-ui-card-actions').click();
          cy.findByTestId('card-action-download').click();

          const path = require('path');
          const downloadsFolder = Cypress.config('downloadsFolder');
          cy.readFile(path.join(downloadsFolder, 'Terrier_mixed-breed_dog.jpg')).should('exist');
        });

        it('should be selected on backspace', () => {
          richText.editor.click();
          triggerEmbeddedAsset();

          richText.editor.type('{downarrow}X');

          richText.expectValue(doc(assetBlock(), paragraphWithText('X')));

          richText.editor.type('{backspace}{backspace}');

          richText.expectValue(doc(assetBlock(), emptyParagraph()));

          richText.editor.type('{backspace}');

          expectDocumentToBeEmpty();
        });
      });
    }
  });

  describe('Embedded Entry Inlines', () => {
    const methods: [string, () => void][] = [
      [
        'using the toolbar button',
        () => {
          richText.toolbar.embed('entry-inline');
        },
      ],
      [
        'using the keyboard shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+2}`);
        },
      ],
    ];

    for (const [triggerMethod, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('adds and removes embedded entries', () => {
          richText.editor
            .click()
            .type('hello')
            .then(triggerEmbeddedAsset)
            .then(() => {
              richText.editor.click().type('world');
            });

          richText.expectValue(
            doc(
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('hello'),
                inline(INLINES.EMBEDDED_ENTRY, {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Entry',
                    },
                  },
                }),
                text('world')
              )
            )
          );

          cy.findByTestId('cf-ui-card-actions').click({ force: true });
          cy.findByTestId('card-action-remove').click({ force: true });

          richText.expectValue(doc(block(BLOCKS.PARAGRAPH, {}, text('hello'), text('world'))));

          // TODO: we should also test deletion via {backspace},
          // but this breaks in cypress even though it works in the editor
        });
      });
    }
  });

  describe('on action callback', () => {
    it('is invoked callback when rendering links', () => {
      cy.setInitialValue(documentWithLinks);
      cy.editorActions().should('be.empty');
      // Necessary for reading the correct LocalStorage values as we do
      // the initial page load on the beforeEach hook
      cy.reload();
      cy.editorActions().should(
        'deep.equal',
        new Array(5).fill([
          'linkRendered',
          {
            origin: 'viewport-interaction',
          },
        ])
      );
    });
  });

  describe('invalid document structure', () => {
    it('accepts document with no content', () => {
      const docWithoutContent = {
        nodeType: 'document',
        data: {},
        content: [],
      };

      cy.setInitialValue(docWithoutContent);

      cy.reload();

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(docWithoutContent);

      // Initial normalization should not invoke onChange
      cy.editorEvents()
        .then((events) => events.filter((e) => e.type === 'onValueChanged'))
        .should('deep.equal', []);

      // We can adjust the content
      richText.editor.type('it works');
      richText.expectValue(doc(paragraphWithText('it works')));
    });

    it('runs initial normalization without triggering a value change', () => {
      cy.setInitialValue(invalidDocumentNormalizable);

      cy.reload();

      // Should render normalized content
      richText.editor.should('contain.text', 'This is a hyperlink');
      richText.editor.should('contain.text', 'This is a paragraph');
      richText.editor.should('contain.text', 'Text with custom marks');

      richText.editor.should('contain.text', 'paragraph inside list item');
      richText.editor.should('contain.text', 'paragraph inside a nested list');
      richText.editor.should('contain.text', 'blockquote inside list item');

      richText.editor.should('contain.text', 'cell #1');
      richText.editor.should('contain.text', 'cell #2');
      richText.editor.should('contain.text', 'cell #3');
      richText.editor.should('contain.text', 'cell #4');
      richText.editor.should('contain.text', 'cell #5');
      richText.editor.should('contain.text', 'cell #6');

      // The field value in this case will still be untouched (i.e. un-normalized)
      // since we won't trigger onChange.
      richText.expectValue(invalidDocumentNormalizable);

      // Initial normalization should not invoke onChange
      cy.editorEvents()
        .then((events) => events.filter((e) => e.type === 'onValueChanged'))
        .should('deep.equal', []);

      // Trigger normalization by changing the editor content
      richText.editor.type('end');

      richText.expectSnapshotValue();
    });
  });

  describe('Toggling', () => {
    const blocks: [string, EmbedType][] = [
      ['From Entry Block to Headings/Paragraph', 'entry-block'],
      ['From Asset Block to Headings/Paragraph', 'asset-block'],
    ];

    blocks.forEach(([title, blockType]) => {
      describe(title, () => {
        headings.forEach(([type]) => {
          it(`should not carry over the "data" property from ${blockType} to ${type}`, () => {
            richText.editor.click();

            richText.toolbar.embed(blockType);

            richText.editor.find('[data-entity-id="example-entity-id"]').click();

            richText.toolbar.toggleHeading(type);

            richText.expectValue(doc(block(type, {}, text('')), emptyParagraph()));
          });
        });
      });
    });
  });

  describe('external updates', () => {
    it('renders the new value', () => {
      const firstString = 'Hello, World';
      richText.editor.type(firstString);
      const oldDoc = doc(block(BLOCKS.PARAGRAPH, {}, text(firstString, [])));
      richText.expectValue(oldDoc);

      // simulate a remote value change
      const newDoc = doc(
        block(BLOCKS.PARAGRAPH, {}, text(firstString, [])),
        block(BLOCKS.EMBEDDED_ENTRY, {
          target: {
            sys: {
              id: 'example-entity-id',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        }),
        block(BLOCKS.PARAGRAPH, {}, text('', []))
      );

      cy.getRichTextField().then((field) => {
        const setValueSpy = cy.spy(field, 'setValue');
        cy.getRichTextField().setValueExternal(newDoc);
        richText.expectValue(newDoc);

        // Ensure the value change hasn't triggered  an editor change callback
        // That scenario would cause a loop of updates
        expect(setValueSpy).to.not.be.called;
        // type something else to trigger the editor change callback
        // the new value must contain the external value plus the typed text
        const secondString = 'Bye, world';
        richText.editor.type('{enter}');
        richText.editor.type(secondString);
        richText.expectValue({
          ...newDoc,
          content: [...newDoc.content, block(BLOCKS.PARAGRAPH, {}, text(secondString, []))],
        });
      });
    });
  });
});
