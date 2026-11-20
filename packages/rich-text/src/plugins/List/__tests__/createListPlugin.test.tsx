/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';

import { assertOutput, createTestEditor, jsx } from '../../../test-utils';

describe('normalization', () => {
  it('wraps orphaned list items in a list', () => {
    const input = (
      <editor>
        <hli>
          <hp>Item</hp>
        </hli>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  it('adds empty paragraph to empty list items', () => {
    const input = (
      <editor>
        <hul>
          <hli />
        </hul>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>
              <htext />
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  it('replaces invalid list items with text', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>

            <htd>
              <hp>
                <htext bold>bold text</htext>
              </hp>
            </htd>

            <htd>
              <hp>
                Take a look at this <hlink uri="https://google.com">link</hlink>
              </hp>
            </htd>
          </hli>
        </hul>
        <hp />
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item</hp>

            <hp>
              <htext bold>bold text</htext>
            </hp>

            <hp>
              Take a look at this <hlink uri="https://google.com">link</hlink>
              <htext />
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  it('replaces list items with nested lists as a first child', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>Item 1</hp>
            <hul>
              <hli>
                <hp>Item 1.1</hp>
              </hli>
            </hul>
          </hli>

          <hli>
            <hul>
              <hli>
                <hp>Item 2.1</hp>
                <hul>
                  <hli>
                    <hp>Item 2.1.1</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>Item 2.2</hp>
              </hli>
            </hul>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>Item 1</hp>
            <hul>
              <hli>
                <hp>Item 1.1</hp>
              </hli>
            </hul>
          </hli>
          <hli>
            <hp>Item 2.1</hp>
            <hul>
              <hli>
                <hp>Item 2.1.1</hp>
              </hli>
            </hul>
          </hli>
          <hli>
            <hp>Item 2.2</hp>
          </hli>
        </hul>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});

describe('backward deletion', () => {
  it.each([
    { type: 'hul', listName: 'unordered list' },
    { type: 'hol', listName: 'ordered list' },
  ])('removes an empty $listName at the start of the document', ({ type }) => {
    const input = (
      <editor>
        {type === 'hul' ? (
          <hul>
            <hli>
              <hp>
                <cursor />
              </hp>
            </hli>
          </hul>
        ) : (
          <hol>
            <hli>
              <hp>
                <cursor />
              </hp>
            </hli>
          </hol>
        )}
        <hp>
          <htext />
        </hp>
      </editor>
    );
    const { editor } = createTestEditor({ input });

    editor.deleteBackward('character');

    const expected = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    );
    assertOutput({ editor, expected });
  });

  it.each([
    {
      title: 'whitespace',
      itemChildren: [{ type: BLOCKS.PARAGRAPH, children: [{ text: ' ' }] }],
      expectedContent: ' ',
    },
    {
      title: 'a later paragraph in a multi-paragraph item',
      itemChildren: [
        { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] },
        { type: BLOCKS.PARAGRAPH, children: [{ text: 'content' }] },
      ],
      expectedContent: 'content',
    },
    {
      title: 'a nested list',
      itemChildren: [
        { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] },
        {
          type: BLOCKS.UL_LIST,
          children: [
            {
              type: BLOCKS.LIST_ITEM,
              children: [{ type: BLOCKS.PARAGRAPH, children: [{ text: 'nested' }] }],
            },
          ],
        },
      ],
      expectedContent: 'nested',
    },
    {
      title: 'a heading',
      itemChildren: [{ type: BLOCKS.HEADING_1, children: [{ text: 'heading' }] }],
      expectedContent: 'heading',
    },
    {
      title: 'an embedded entry',
      itemChildren: [
        { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] },
        {
          type: BLOCKS.EMBEDDED_ENTRY,
          data: { target: {} },
          children: [{ text: '' }],
        },
      ],
      expectedContent: BLOCKS.EMBEDDED_ENTRY,
    },
    {
      title: 'an embedded inline',
      itemChildren: [
        { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] },
        {
          type: BLOCKS.PARAGRAPH,
          children: [
            { type: INLINES.EMBEDDED_ENTRY, data: { target: {} }, children: [{ text: '' }] },
          ],
        },
      ],
      expectedContent: INLINES.EMBEDDED_ENTRY,
    },
  ])('preserves a list containing $title', ({ itemChildren, expectedContent }) => {
    const { editor } = createTestEditor({});
    const list = {
      type: BLOCKS.UL_LIST,
      children: [{ type: BLOCKS.LIST_ITEM, children: itemChildren }],
    };
    editor.children = [list, { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] }];
    editor.tf.select({ path: [0, 0, 0, 0], offset: 0 });

    editor.deleteBackward('character');

    const updatedList = JSON.stringify(editor.children[0]);
    expect(editor.children[0].type).toBe(BLOCKS.UL_LIST);
    expect(updatedList).toContain(expectedContent);
  });
});
