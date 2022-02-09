/* eslint-disable mocha/no-setup-in-describe */
import { BLOCKS } from '@contentful/rich-text-types';

import { document as doc, block, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { RichTextPage } from './RichTextPage';

describe('Rich Text Lists', () => {
  let richText: RichTextPage;

  const buildHelper =
    (type) =>
    (...children) =>
      block(type, {}, ...children);
  const paragraph = buildHelper(BLOCKS.PARAGRAPH);
  const paragraphWithText = (t) => paragraph(text(t, []));
  const emptyParagraph = () => paragraphWithText('');

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
    tab: { keyCode: 9, which: 9, key: 'Tab' },
  };

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

  const lists = [
    {
      getList: () => richText.toolbar.ul,
      listType: BLOCKS.UL_LIST,
      label: 'Unordered List (UL)',
    },
    { getList: () => richText.toolbar.ol, listType: BLOCKS.OL_LIST, label: 'Ordered List (OL)' },
  ];

  lists.forEach((test) => {
    describe(test.label, () => {
      it('should be visible', () => {
        test.getList().should('be.visible');
      });

      it('should add a new list', () => {
        richText.editor.click();

        test.getList().click();
        // TODO: Find a way to test deeper lists
        /*
					Having issues with `.type('{enter})` to break lines.
					The error is:
					Cannot resolve a Slate node from DOM node: [object HTMLSpanElement]
				*/
        richText.editor.type('item 1');

        const expectedValue = doc(
          block(
            test.listType,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item 1', [])))
          ),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should untoggle the list', () => {
        richText.editor.click();

        test.getList().click();

        richText.editor.type('some text');

        test.getList().click();

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should unwrap blockquote', () => {
        addBlockquote('some text');

        test.getList().click();

        const expectedValue = doc(
          block(
            test.listType,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('some text', [])))
          ),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should allow heading as direct child of <li>', () => {
        richText.editor.click();
        test.getList().click();

        richText.toolbar.toggleHeading(BLOCKS.HEADING_1);
        richText.editor.type('heading');

        const expectedValue = doc(
          block(
            test.listType,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.HEADING_1, {}, text('heading')))
          ),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should allow HR as direct child of <li>', () => {
        richText.editor.click();
        test.getList().click();

        richText.toolbar.hr.click();

        const expectedValue = doc(
          block(test.listType, {}, block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.HR, {}))),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should allow embedded entry as direct child of <li>', () => {
        richText.editor.click();
        test.getList().click();

        richText.toolbar.embed('entry-block');

        const expectedValue = doc(
          block(test.listType, {}, block(BLOCKS.LIST_ITEM, {}, entryBlock())),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should allow embedded asset as direct child of <li>', () => {
        richText.editor.click();
        test.getList().click();

        richText.toolbar.embed('asset-block');

        const expectedValue = doc(
          block(test.listType, {}, block(BLOCKS.LIST_ITEM, {}, assetBlock())),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should allow block quotes as direct child of <li>', () => {
        richText.editor.click();
        test.getList().click();

        richText.toolbar.quote.click();
        richText.editor.type('quote');

        const expectedValue = doc(
          block(
            test.listType,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.QUOTE, {}, paragraphWithText('quote')))
          ),
          emptyParagraph()
        );

        richText.expectValue(expectedValue);
      });

      it('should preserve current marks when inserting a new li', () => {
        richText.editor.click();
        test.getList().click();

        // should only be applied to the word "bold "
        richText.toolbar.bold.click();
        richText.editor.type('bold ');
        richText.toolbar.bold.click();

        // should be applied to the rest of line AND next li
        richText.toolbar.italic.click();
        richText.editor.type('italic');

        richText.editor.type('{enter}');
        richText.editor.type('more italic text');

        richText.expectSnapshotValue();
      });

      it('should move nested list items when parent is invalid', () => {
        richText.editor.click();
        test.getList().click();

        richText.editor
          .type('1{enter}2{enter}3{enter}4')
          .trigger('keydown', keys.tab)
          .type('{uparrow}{uparrow}')
          .trigger('keydown', keys.tab)
          .type('{downarrow}{backspace}{backspace}');

        richText.expectSnapshotValue();
      });
    });
  });
});
