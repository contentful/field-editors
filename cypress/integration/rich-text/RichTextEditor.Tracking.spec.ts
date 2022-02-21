/* eslint-disable mocha/no-setup-in-describe */

import { MARKS, BLOCKS, INLINES } from '@contentful/rich-text-types';

import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen

describe('Rich Text Editor - Tracking', { viewportHeight: 2000 }, () => {
  let richText: RichTextPage;

  // copied from the 'is-hotkey' library we use for RichText shortcuts
  const IS_MAC =
    typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const mod = IS_MAC ? 'meta' : 'control';

  const linkRendered = () => [
    'linkRendered',
    {
      origin: 'viewport-interaction',
    },
  ];

  const openCreateEmbedDialog = (origin, nodeType) => [
    'openCreateEmbedDialog',
    {
      origin,
      nodeType,
    },
  ];

  const action = (action, origin, payload = {}) => [
    action,
    {
      origin,
      ...payload,
    },
  ];

  const insert = (origin, payload) => action('insert', origin, payload);
  const remove = (origin, payload) => action('remove', origin, payload);
  const edit = (origin, payload) => action('edit', origin, payload);

  beforeEach(() => {
    richText = new RichTextPage();
    richText.visit();
  });

  describe('Text Pasting', () => {
    it('tracks text pasting', () => {
      richText.editor.click().paste({ 'text/plain': 'Hello World!' });

      richText.expectTrackingValue([
        action('paste', 'shortcut', {
          characterCountAfter: 12,
          characterCountBefore: 0,
          characterCountSelection: 0,
        }),
      ]);

      richText.editor.click().type('{enter}').paste({ 'text/plain': 'Hello World!' });

      richText.expectTrackingValue([
        action('paste', 'shortcut', {
          characterCountAfter: 12,
          characterCountBefore: 0,
          characterCountSelection: 0,
        }),
        action('paste', 'shortcut', {
          characterCountAfter: 25,
          characterCountBefore: 13,
          characterCountSelection: 0,
        }),
      ]);
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

      it(`tracks ${mark} mark via toolbar`, () => {
        richText.editor.click();

        toggleMarkViaToolbar();
        toggleMarkViaToolbar();

        richText.expectTrackingValue([
          action('mark', 'toolbar-icon', { markType: mark }),
          action('unmark', 'toolbar-icon', { markType: mark }),
        ]);
      });

      it(`tracks ${mark} mark via shortcut`, () => {
        richText.editor.click().type(shortcut).type(shortcut);

        richText.expectTrackingValue([
          action('mark', 'shortcut', { markType: mark }),
          action('unmark', 'shortcut', { markType: mark }),
        ]);
      });
    });
  });

  describe('Headings', () => {
    const headings = [
      [BLOCKS.HEADING_1, 'Heading 1', `{${mod}+alt+1}`],
      [BLOCKS.HEADING_2, 'Heading 2', `{${mod}+alt+2}`],
      [BLOCKS.HEADING_3, 'Heading 3', `{${mod}+alt+3}`],
      [BLOCKS.HEADING_4, 'Heading 4', `{${mod}+alt+4}`],
      [BLOCKS.HEADING_5, 'Heading 5', `{${mod}+alt+5}`],
      [BLOCKS.HEADING_6, 'Heading 6', `{${mod}+alt+6}`],
    ];

    headings.forEach(([type, label, shortcut]) => {
      it(`tracks ${label} (${type}) via toolbar`, () => {
        richText.editor.click();

        richText.toolbar.toggleHeading(type);
        richText.toolbar.toggleHeading(type);

        richText.expectTrackingValue([
          insert('toolbar-icon', { nodeType: type }),
          remove('toolbar-icon', { nodeType: type }),
        ]);
      });

      it(`tracks ${label} (${type}) via hotkeys ${shortcut}`, () => {
        richText.editor.click().type(shortcut).type(shortcut);

        richText.expectTrackingValue([
          insert('shortcut', { nodeType: type }),
          remove('shortcut', { nodeType: type }),
        ]);
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
        toggleQuote();

        richText.expectTrackingValue([
          insert(origin, { nodeType: BLOCKS.QUOTE }),
          remove(origin, { nodeType: BLOCKS.QUOTE }),
        ]);
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

      richText.expectTrackingValue([insertTableAction()]);
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

        richText.expectTrackingValue([
          insertTableAction(),
          insertTableRowAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
      });

      it('adds row below', () => {
        doAction('Add row below');

        richText.expectTrackingValue([
          insertTableAction(),
          insertTableRowAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
      });

      it('adds column left', () => {
        doAction('Add column left');

        richText.expectTrackingValue([
          insertTableAction(),
          insertTableColumnAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
      });

      it('adds column right', () => {
        doAction('Add column right');

        richText.expectTrackingValue([
          insertTableAction(),
          insertTableColumnAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
      });

      it('deletes row', () => {
        doAction('Delete row');

        richText.expectTrackingValue([
          insertTableAction(),
          removeTableRowAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
      });

      it('deletes column', () => {
        doAction('Delete column');

        richText.expectTrackingValue([
          insertTableAction(),
          removeTableColumnAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
      });

      it('deletes table', () => {
        doAction('Delete table');

        richText.expectTrackingValue([
          insertTableAction(),
          removeTableAction({
            tableSize: {
              numColumns: 2,
              numRows: 2,
            },
          }),
        ]);
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
        it('tracks adds and removes hyperlinks', () => {
          richText.editor.type('The quick brown fox jumps over the lazy ');

          triggerLinkModal();

          const form = richText.forms.hyperlink;

          form.linkText.type('dog');
          form.linkTarget.type('https://zombo.com');
          form.submit.click();

          richText.expectTrackingValue([openCreateModal(origin), insertHyperlink(origin)]);

          richText.editor.click().type('{selectall}');
          cy.findByTestId('hyperlink-toolbar-button').click();

          richText.expectTrackingValue([
            openCreateModal(origin),
            insertHyperlink(origin),
            unlink('toolbar-icon'),
          ]);
        });

        it('tracks when converting text to URL hyperlink', () => {
          richText.editor.type('My cool website{selectall}');

          triggerLinkModal();
          const form = richText.forms.hyperlink;

          form.linkTarget.type('https://zombo.com');

          form.submit.click();

          richText.expectTrackingValue([openCreateModal(origin), insertHyperlink(origin)]);
        });

        it('tracks when converting text to entry hyperlink', () => {
          richText.editor.type('My cool entry{selectall}');
          triggerLinkModal();
          const form = richText.forms.hyperlink;

          form.linkType.select('entry-hyperlink');

          form.linkEntityTarget.click();

          form.submit.click();

          richText.expectTrackingValue([
            openCreateModal(origin),
            insertEntryHyperlink(origin),
            linkRendered(),
          ]);
        });

        it('tracks when converting text to asset hyperlink', () => {
          richText.editor.type('My cool asset{selectall}');

          triggerLinkModal();

          const form = richText.forms.hyperlink;

          form.linkType.select('asset-hyperlink');
          form.linkEntityTarget.click();
          form.submit.click();

          richText.expectTrackingValue([
            openCreateModal(origin),
            insertAssetHyperlink(origin),
            linkRendered(),
          ]);
        });

        it('tracks when editing hyperlinks', () => {
          richText.editor.type('My cool website{selectall}');

          triggerLinkModal();

          // Part 1:
          // Create a hyperlink
          const form = richText.forms.hyperlink;

          form.linkTarget.type('https://zombo.com');
          form.submit.click();

          richText.expectTrackingValue([openCreateModal(origin), insertHyperlink(origin)]);

          // Part 2:
          // Update hyperlink to entry link

          richText.editor.findByTestId('cf-ui-text-link').click({ force: true });

          form.linkType.select('entry-hyperlink');
          form.linkEntityTarget.click();
          form.submit.click();

          richText.expectTrackingValue([
            openCreateModal(origin),
            insertHyperlink(origin),
            openEditModal(),
            editEntryHyperlink(),
            linkRendered(),
          ]);

          // Part 3:
          // Update entry link to asset link

          richText.editor.findByTestId('cf-ui-text-link').click({ force: true });

          form.linkType.select('asset-hyperlink');
          form.linkEntityTarget.click();
          form.submit.click();

          richText.expectTrackingValue([
            openCreateModal(origin),
            insertHyperlink(origin),
            openEditModal(),
            editEntryHyperlink(),
            linkRendered(),
            openEditModal(),
            linkRendered(),
            editAssetHyperlink(),
            linkRendered(),
          ]);

          // Part 3:
          // Update asset link to hyperlink

          richText.editor.findByTestId('cf-ui-text-link').click({ force: true });

          form.linkType.select('hyperlink');
          form.linkTarget.type('https://zombo.com');
          form.submit.click();

          richText.expectTrackingValue([
            openCreateModal(origin),
            insertHyperlink(origin),
            openEditModal(),
            editEntryHyperlink(),
            linkRendered(),
            openEditModal(),
            linkRendered(),
            editAssetHyperlink(),
            linkRendered(),
            openEditModal(),
            linkRendered(),
            editHyperlink(),
          ]);
        });
      });
    }
  });

  describe('Embedded Entry Blocks', () => {
    const methods: [string, string, () => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        () => {
          richText.toolbar.embed('entry-block');
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+e}`);
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedEntry] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded entry block', () => {
          richText.editor.click().then(triggerEmbeddedEntry);

          richText.expectTrackingValue([
            openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_ENTRY),
            insert(origin, { nodeType: BLOCKS.EMBEDDED_ENTRY }),
            linkRendered(),
          ]);
        });
      });
    }
  });

  describe('Embedded Asset Blocks', () => {
    const methods: [string, string, () => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        () => {
          richText.toolbar.embed('asset-block');
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+a}`);
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedAsset] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded asset block', () => {
          richText.editor.click().then(triggerEmbeddedAsset);

          richText.expectTrackingValue([
            openCreateEmbedDialog(origin, BLOCKS.EMBEDDED_ASSET),
            insert(origin, { nodeType: BLOCKS.EMBEDDED_ASSET }),
            linkRendered(),
          ]);
        });
      });
    }
  });

  describe('Embedded Entry Inlines', () => {
    const methods: [string, string, () => void][] = [
      [
        'using the toolbar button',
        'toolbar-icon',
        () => {
          richText.toolbar.embed('entry-inline');
        },
      ],
      [
        'using the keyboard shortcut',
        'shortcut',
        () => {
          richText.editor.type(`{${mod}+shift+2}`);
        },
      ],
    ];

    for (const [triggerMethod, origin, triggerEmbeddedInline] of methods) {
      describe(triggerMethod, () => {
        it('tracks when inserting embedded asset block', () => {
          richText.editor.click().then(triggerEmbeddedInline);

          richText.expectTrackingValue([
            openCreateEmbedDialog(origin, INLINES.EMBEDDED_ENTRY),
            insert(origin, { nodeType: INLINES.EMBEDDED_ENTRY }),
            linkRendered(),
          ]);
        });
      });
    }
  });
});
