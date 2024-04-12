/* eslint-disable mocha/no-setup-in-describe */

import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';

import { openEditLink, mod } from '../../fixtures/utils';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Tracking', { viewportHeight: 2000, viewportWidth: 1000 }, () => {
  let richText: RichTextPage;

  const action = (action: string, origin: string, payload: Record<string, any> = {}) => [
    action,
    {
      origin,
      ...payload,
    },
  ];

  const linkRendered = () => action('linkRendered', 'viewport-interaction');

  const openCreateEmbedDialog = (origin, nodeType) =>
    action('openCreateEmbedDialog', origin, { nodeType });

  const insert = (origin, payload) => action('insert', origin, payload);
  const remove = (origin, payload) => action('remove', origin, payload);
  const edit = (origin, payload) => action('edit', origin, payload);

  const cancelEmbeddedDialog = (origin, nodeType) =>
    action('cancelCreateEmbedDialog', origin, { nodeType });

  const openCommandPalette = () => action('openRichTextCommandPalette', 'command-palette');

  const cancelCommandPalette = () => action('cancelRichTextCommandPalette', 'command-palette');

  beforeEach(() => {
    cy.viewport(1000, 2000);
    const onAction = cy.stub().as('onAction');
    richText = new RichTextPage();

    mountRichTextEditor({ onAction });
  });

  describe('Text Pasting', () => {
    it('tracks text pasting', () => {
      richText.editor.click().paste({ 'text/plain': 'Hello World!' });

      cy.get('@onAction').should(
        'be.calledWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 12,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Unknown',
        })
      );

      richText.editor.click().type('{enter}').paste({ 'text/plain': 'Hello World!' });

      cy.get('@onAction').should(
        'be.calledWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 25,
          characterCountBefore: 13,
          characterCountSelection: 0,
          source: 'Unknown',
        })
      );
      cy.get('@onAction').should('have.callCount', 2);
    });

    it('tracks google docs source', () => {
      richText.editor.click().paste({
        'text/html': `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-810b52ca-7fff-d999-cca4-9ef46293ff5f"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hello</span></b>`,
      });

      cy.get('@onAction').should(
        'be.calledOnceWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 5,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Google Docs',
        })
      );
    });

    it('tracks google spreadsheets source', () => {
      richText.editor.click().paste({
        'text/html': `<meta charset='utf-8'><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:10pt;font-family:Arial;font-weight:bold;font-style:normal;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Example response for issues that go into the sprint (we don&#39;t close the Zendesk ticket):&quot;}" data-sheets-userformat="{&quot;2&quot;:16897,&quot;3&quot;:{&quot;1&quot;:0},&quot;12&quot;:0,&quot;17&quot;:1}">Example response for issues that go into the sprint (we don&#39;t close the Zendesk ticket):</span>`,
      });

      cy.get('@onAction').should(
        'be.calledOnceWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 88,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Google Spreadsheets',
        })
      );
    });

    it('tracks slack source', () => {
      richText.editor.click().paste({
        'text/html': `<meta charset='utf-8'><span style="color: rgb(209, 210, 211); font-family: Slack-Lato, Slack-Fractions, appleLogo, sans-serif; font-size: 15px; font-style: normal; font-variant-ligatures: common-ligatures; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(34, 37, 41); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">Hey everyone</span>`,
      });

      cy.get('@onAction').should(
        'be.calledOnceWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 12,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Slack',
        })
      );
    });

    it('tracks apple notes source', () => {
      richText.editor.click().paste({
        'text/html': `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="Content-Style-Type" content="text/css"> <title></title> <meta name="Generator" content="Cocoa HTML Writer"> <meta name="CocoaVersion" content="2022.6"> <style type="text/css"> p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 13.0px 'Helvetica Neue'} </style> </head> <body> <p class="p1">Hello world</p> </body> </html>`,
      });

      cy.get('@onAction').should(
        'be.calledOnceWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 11,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Apple Notes',
        })
      );
    });

    it('tracks microsoft word source', () => {
      richText.editor.click().paste({
        'text/html': `<meta name=Generator content="Microsoft Word 15"><p>Hello</p>`,
      });

      cy.get('@onAction').should(
        'be.calledOnceWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 5,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Microsoft Word',
        })
      );
    });

    it('tracks microsoft excel source', () => {
      richText.editor.click().paste({
        'text/html': `<meta name=Generator content="Microsoft Excel 15"><p>Hello</p>`,
      });

      cy.get('@onAction').should(
        'be.calledOnceWithExactly',
        ...action('paste', 'shortcut-or-viewport', {
          characterCountAfter: 5,
          characterCountBefore: 0,
          characterCountSelection: 0,
          source: 'Microsoft Excel',
        })
      );
    });
  });

  describe('Marks', () => {
    (
      [
        [MARKS.BOLD, `{${mod}}b`],
        [MARKS.ITALIC, `{${mod}}i`],
        [MARKS.UNDERLINE, `{${mod}}u`],
        [MARKS.CODE, `{${mod}}/`],
      ] as const
    ).forEach(([mark, shortcut]) => {
      const toggleMarkViaToolbar = (mark: MARKS) => {
        if (mark === 'code' || mark === 'superscript' || mark === 'subscript') {
          cy.findByTestId('dropdown-toolbar-button').click();
          cy.findByTestId(`${mark}-toolbar-button`).click();
        } else {
          cy.findByTestId(`${mark}-toolbar-button`).click();
        }
      };
      it(`tracks ${mark} mark via toolbar`, () => {
        richText.editor.click();

        toggleMarkViaToolbar(mark);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...action('mark', 'toolbar-icon', { markType: mark })
        );

        toggleMarkViaToolbar(mark);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...action('unmark', 'toolbar-icon', { markType: mark })
        );

        cy.get('@onAction').should('have.callCount', 2);
      });

      it(`tracks ${mark} mark via shortcut`, () => {
        richText.editor.click().type(shortcut);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...action('mark', 'shortcut', { markType: mark })
        );

        richText.editor.click().type(shortcut);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...action('unmark', 'shortcut', { markType: mark })
        );

        cy.get('@onAction').should('have.callCount', 2);
      });
    });
  });

  describe('Headings', () => {
    [
      [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
      [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
      [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
      [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
      [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
      [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
    ].forEach(([type, label, shortcut]) => {
      it(`tracks ${label} (${type}) via toolbar`, () => {
        richText.editor.click().type('Heading').type('{selectall}');

        richText.toolbar.toggleHeading(type);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insert('toolbar-icon', { nodeType: type })
        );

        richText.toolbar.toggleHeading(type);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...remove('toolbar-icon', { nodeType: type })
        );

        cy.get('@onAction').should('have.callCount', 2);
      });

      it(`tracks ${label} (${type}) via hotkeys ${shortcut}`, () => {
        richText.editor.click().type('Heading').type('{selectall}').type(shortcut);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insert('shortcut', { nodeType: type })
        );

        richText.editor.click().type('{selectall}').type(shortcut);
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...remove('shortcut', { nodeType: type })
        );

        cy.get('@onAction').should('have.callCount', 2);
      });
    });
  });

  describe('Quote', () => {
    const methods: [string, string, () => void][] = [
      [
        'using the toolbar',
        'toolbar-icon',
        () => {
          richText.toolbar.quote.click();
        },
      ],
      [
        'using hotkey (mod+shift+1)',
        'shortcut',
        () => {
          richText.editor.type(`{${mod}}{shift}1`);
        },
      ],
    ];

    for (const [scenario, origin, toggleQuote] of methods) {
      it(`tracks blockquote ${scenario}`, () => {
        richText.editor.click();

        toggleQuote();
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insert(origin, { nodeType: BLOCKS.QUOTE })
        );

        toggleQuote();
        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...remove(origin, { nodeType: BLOCKS.QUOTE })
        );

        cy.get('@onAction').should('have.callCount', 2);
      });
    }
  });

  describe('Tables', () => {
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

    const insertTableAction = () => action('insertTable', 'toolbar-icon');
    const removeTableAction = (payload) => action('removeTable', 'viewport-interaction', payload);
    const insertTableRowAction = (payload) =>
      action('insertTableRow', 'viewport-interaction', payload);
    const insertTableColumnAction = (payload) =>
      action('insertTableColumn', 'viewport-interaction', payload);
    const removeTableColumnAction = (payload) =>
      action('removeTableColumn', 'viewport-interaction', payload);
    const removeTableRowAction = (payload) =>
      action('removeTableRow', 'viewport-interaction', payload);

    it('tracks insert table', () => {
      insertTable();
      cy.get('@onAction').should('be.calledOnceWithExactly', ...insertTableAction());
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

      it('adds row above', () => {
        doAction('Add row above');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insertTableRowAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });

      it('adds row below', () => {
        doAction('Add row below');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insertTableRowAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });

      it('adds column left', () => {
        doAction('Add column left');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insertTableColumnAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });

      it('adds column right', () => {
        doAction('Add column right');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...insertTableColumnAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });

      it('deletes row', () => {
        doAction('Delete row');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...removeTableRowAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });

      it('deletes column', () => {
        doAction('Delete column');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...removeTableColumnAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });

      it('deletes table', () => {
        doAction('Delete table');

        cy.get('@onAction').should(
          'be.calledWithExactly',
          ...removeTableAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          })
        );
        cy.get('@onAction').should('have.callCount', 2);
      });
    });
  });

  describe('Links', () => {
    const openCreateModal = (origin) => [
      'openCreateHyperlinkDialog',
      {
        origin,
      },
    ];

    const closeModal = (origin) => [
      'cancelCreateHyperlinkDialog',
      {
        origin,
      },
    ];

    const openEditModal = () => [
      'openEditHyperlinkDialog',
      {
        origin: 'viewport-interaction',
      },
    ];

    const insertHyperlink = (origin) => insert(origin, { linkType: 'uri', nodeType: 'hyperlink' });
    const insertAssetHyperlink = (origin) =>
      insert(origin, { linkType: 'Asset', nodeType: 'asset-hyperlink' });
    const insertEntryHyperlink = (origin) =>
      insert(origin, { linkType: 'Entry', nodeType: 'entry-hyperlink' });

    const editHyperlink = () =>
      edit('viewport-interaction', { linkType: 'uri', nodeType: 'hyperlink' });
    const editAssetHyperlink = () =>
      edit('viewport-interaction', { linkType: 'Asset', nodeType: 'asset-hyperlink' });
    const editEntryHyperlink = () =>
      edit('viewport-interaction', { linkType: 'Entry', nodeType: 'entry-hyperlink' });

    const unlink = (origin) => [
      'unlinkHyperlinks',
      {
        origin,
      },
    ];

    const methods: [string, string, () => void][] = [
      [
        'using the link toolbar button',
        'toolbar-icon',
        () => {
          richText.toolbar.hyperlink.click();
        },
      ],
      [
        'using the link keyboard shortcut',
        'shortcut',
        () => {
          richText.editor.type(`{${mod}}k`);
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerLinkModal] of methods) {
      describe(triggerMethod, () => {
        it('opens the hyperlink modal but cancels without adding a link', () => {
          richText.editor.type('The quick brown fox jumps over the lazy ');

          triggerLinkModal();
          cy.get('@onAction').should('be.calledWithExactly', ...openCreateModal(origin));

          const form = richText.forms.hyperlink;

          form.cancel.click();

          cy.get('@onAction').should('be.calledWithExactly', ...closeModal(origin));

          cy.get('@onAction').should('have.callCount', 2);
        });

        it('tracks adds and removes hyperlinks', () => {
          richText.editor.type('The quick brown fox jumps over the lazy ');

          triggerLinkModal();
          cy.get('@onAction').should('be.calledWithExactly', ...openCreateModal(origin));

          const form = richText.forms.hyperlink;

          form.linkText.type('dog');
          form.linkTarget.type('https://zombo.com');
          form.submit.click();

          cy.get('@onAction').should('be.calledWithExactly', ...insertHyperlink(origin));

          richText.editor.click().type('{selectall}');
          cy.findByTestId('hyperlink-toolbar-button').click();

          cy.get('@onAction').should('be.calledWithExactly', ...unlink('toolbar-icon'));

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('tracks when converting text to URL hyperlink', () => {
          richText.editor.type('My cool website').type('{selectall}');

          triggerLinkModal();
          cy.get('@onAction').should('be.calledWithExactly', ...openCreateModal(origin));

          const form = richText.forms.hyperlink;

          form.linkTarget.type('https://zombo.com');

          form.submit.click();

          cy.get('@onAction').should('be.calledWithExactly', ...insertHyperlink(origin));

          cy.get('@onAction').should('have.callCount', 2);
        });

        it('tracks when converting text to entry hyperlink', () => {
          richText.editor.type('My cool entry').type('{selectall}');

          triggerLinkModal();
          cy.get('@onAction').should('be.calledWithExactly', ...openCreateModal(origin));

          const form = richText.forms.hyperlink;

          form.linkType.select('entry-hyperlink');
          form.linkEntityTarget.click();
          richText.forms.embed.confirm();

          form.submit.click();
          cy.get('@onAction').should('be.calledWithExactly', ...insertEntryHyperlink(origin));
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('tracks when converting text to asset hyperlink', () => {
          richText.editor.type('My cool asset').type('{selectall}');

          triggerLinkModal();
          cy.get('@onAction').should('be.calledWithExactly', ...openCreateModal(origin));

          const form = richText.forms.hyperlink;

          form.linkType.select('asset-hyperlink');
          form.linkEntityTarget.click();
          richText.forms.embed.confirm();

          form.submit.click();
          cy.get('@onAction').should('be.calledWithExactly', ...insertAssetHyperlink(origin));
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('tracks when editing hyperlinks', () => {
          richText.editor.type('My cool website').type('{selectall}');

          triggerLinkModal();
          cy.get('@onAction').should('be.calledWithExactly', ...openCreateModal(origin));

          // Part 1:
          // Create a hyperlink
          const form = richText.forms.hyperlink;

          form.linkTarget.type('https://zombo.com');

          form.submit.click();
          cy.get('@onAction').should('be.calledWithExactly', ...insertHyperlink(origin));

          // Part 2:
          // Update hyperlink to entry link
          openEditLink();
          cy.get('@onAction').should('be.calledWithExactly', ...openEditModal());

          form.linkType.select('entry-hyperlink');
          form.linkEntityTarget.click();
          richText.forms.embed.confirm();

          form.submit.click();
          cy.get('@onAction').should('be.calledWithExactly', ...editEntryHyperlink());
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          // Part 3:
          // Update entry link to asset link
          openEditLink();
          cy.get('@onAction').should('be.calledWithExactly', ...openEditModal());

          form.linkType.select('asset-hyperlink');
          form.linkEntityTarget.click();
          richText.forms.embed.confirm();

          form.submit.click();
          cy.get('@onAction').should('be.calledWithExactly', ...editAssetHyperlink());
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          // Part 4:
          // Update asset link to hyperlink
          openEditLink();
          cy.get('@onAction').should('be.calledWithExactly', ...openEditModal());

          form.linkType.select('hyperlink');
          form.linkTarget.type('https://zombo.com');

          form.submit.click();
          cy.get('@onAction').should('be.calledWithExactly', ...editHyperlink());

          cy.get('@onAction').should('have.callCount', 10);
        });
      });
    }
  });

  describe('Embedded Entry Blocks', () => {
    const methods: [string, string, (action: 'cancel' | 'confirm') => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        (action) => {
          richText.toolbar.embed('entry-block', false);
          richText.forms.embed[action]();
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        (action) => {
          richText.editor.type(`{${mod}+shift+e}`);
          richText.forms.embed[action]();
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedEntry] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded entry block', () => {
          richText.editor.click();

          triggerEmbeddedEntry('confirm');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_ENTRY)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...insert(origin, { nodeType: BLOCKS.EMBEDDED_ENTRY })
          );
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('cancels without adding the entry block', () => {
          richText.editor.click();

          triggerEmbeddedEntry('cancel');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_ENTRY)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...cancelEmbeddedDialog(origin, BLOCKS.EMBEDDED_ENTRY)
          );

          cy.get('@onAction').should('have.callCount', 2);
        });
      });
    }
  });

  describe('Embedded Asset Blocks', () => {
    const embedType = 'asset-block';

    const methods: [string, string, (action: 'confirm' | 'cancel') => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        (action) => {
          richText.toolbar.embed(embedType, false);
          richText.forms.embed[action]();
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        (action) => {
          richText.editor.type(`{${mod}+shift+a}`);
          richText.forms.embed[action]();
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded asset block', () => {
          richText.editor.click();

          triggerEmbeddedAsset('confirm');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_ASSET)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...insert(origin, { nodeType: BLOCKS.EMBEDDED_ASSET })
          );
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('cancels without adding the entry asset', () => {
          richText.editor.click();

          triggerEmbeddedAsset('cancel');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_ASSET)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...cancelEmbeddedDialog(origin, BLOCKS.EMBEDDED_ASSET)
          );

          cy.get('@onAction').should('have.callCount', 2);
        });
      });
    }
  });

  describe('Embedded Resource Blocks', () => {
    const methods: [string, string, (action: 'cancel' | 'confirm') => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        (action) => {
          richText.toolbar.embed('resource-block', false);
          richText.forms.embed[action]();
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        (action) => {
          richText.editor.type(`{${mod}+shift+s}`);
          richText.forms.embed[action]();
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedResource] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded resource block', () => {
          richText.editor.click();

          triggerEmbeddedResource('confirm');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_RESOURCE)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...insert(origin, { nodeType: BLOCKS.EMBEDDED_RESOURCE })
          );
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('cancels without adding the resource block', () => {
          richText.editor.click();

          triggerEmbeddedResource('cancel');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_RESOURCE)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...cancelEmbeddedDialog(origin, BLOCKS.EMBEDDED_RESOURCE)
          );

          cy.get('@onAction').should('have.callCount', 2);
        });
      });
    }
  });

  describe('Embedded Entry Inlines', () => {
    const methods: [string, string, (action: 'cancel' | 'confirm') => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        (action) => {
          richText.toolbar.embed('entry-inline', false);
          richText.forms.embed[action]();
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        (action) => {
          richText.editor.type(`{${mod}+shift+2}`);
          richText.forms.embed[action]();
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedInline] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded asset block', () => {
          richText.editor.click();

          triggerEmbeddedInline('confirm');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, INLINES.EMBEDDED_ENTRY)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...insert(origin, { nodeType: INLINES.EMBEDDED_ENTRY })
          );
          cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

          cy.get('@onAction').should('have.callCount', 3);
        });

        it('cancels without adding the entry asset', () => {
          richText.editor.click();

          triggerEmbeddedInline('cancel');
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...openCreateEmbedDialog(origin, INLINES.EMBEDDED_ENTRY)
          );
          cy.get('@onAction').should(
            'be.calledWithExactly',
            ...cancelEmbeddedDialog(origin, INLINES.EMBEDDED_ENTRY)
          );

          cy.get('@onAction').should('have.callCount', 2);
        });
      });
    }
  });

  describe('Commands', () => {
    const origin = 'command-palette';
    const getCommandList = () => cy.findByTestId('rich-text-commands-list');

    beforeEach(() => {
      richText.editor.click().type('/');
    });
    it('tracks opening the command palette', () => {
      cy.get('@onAction').should('be.calledOnceWithExactly', ...openCommandPalette());
    });

    it('tracks cancelling the command palette on pressing esc', () => {
      richText.editor.type('{esc}');
      cy.get('@onAction').should('be.calledWithExactly', ...openCommandPalette());
      cy.get('@onAction').should('be.calledWithExactly', ...cancelCommandPalette());

      cy.get('@onAction').should('have.callCount', 2);
    });

    it('tracks embedding an entry block', () => {
      getCommandList().findByText('Embed Example Content Type').click();
      cy.get('@onAction').should('be.calledWithExactly', ...openCommandPalette());

      getCommandList().findByText('The best article ever').click();
      cy.get('@onAction').should(
        'be.calledWithExactly',
        ...insert(origin, { nodeType: BLOCKS.EMBEDDED_ENTRY })
      );
      cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

      cy.get('@onAction').should('have.callCount', 3);
    });

    it('tracks embedding an inline entry', () => {
      getCommandList().findByText('Embed Example Content Type - Inline').click();
      cy.get('@onAction').should('be.calledWithExactly', ...openCommandPalette());

      getCommandList().findByText('The best article ever').click();
      cy.get('@onAction').should(
        'be.calledWithExactly',
        ...insert(origin, { nodeType: INLINES.EMBEDDED_ENTRY })
      );
      cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

      cy.get('@onAction').should('have.callCount', 3);
    });

    it('tracks embedding an asset block', () => {
      getCommandList().findByText('Embed Asset').click();
      cy.get('@onAction').should('be.calledWithExactly', ...openCommandPalette());

      getCommandList().findByText('test').click();
      cy.get('@onAction').should(
        'be.calledWithExactly',
        ...insert(origin, { nodeType: BLOCKS.EMBEDDED_ASSET })
      );
      cy.get('@onAction').should('be.calledWithExactly', ...linkRendered());

      cy.get('@onAction').should('have.callCount', 3);
    });
  });
});
