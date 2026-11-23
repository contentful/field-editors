/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';

import { PlateEditor } from '../../../internal/plate';
import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { insertListBreak } from '../../List/insertListBreak';
import { moveListItems } from '../../List/transforms/moveListItems';
import { toggleList } from '../../List/transforms/toggleList';
import { createTablePlugin } from '../createTablePlugin';

const fireTab = (editor: PlateEditor, { shiftKey = false } = {}) => {
  const tablePlugin = createTablePlugin();
  const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
  tablePlugin.handlers!.onKeyDown!(editor as any, tablePlugin as any)(event as any);
  return event;
};

describe('lists in table cells', () => {
  describe('normalization', () => {
    it('keeps ordered and unordered lists inside table cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>bullet</hp>
                  </hli>
                </hul>
              </htd>
              <htd>
                <hol>
                  <hli>
                    <hp>number</hp>
                  </hli>
                </hol>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>bullet</hp>
                  </hli>
                </hul>
              </htd>
              <htd>
                <hol>
                  <hli>
                    <hp>number</hp>
                  </hli>
                </hol>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('converts lists inside table header cells to paragraphs', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hul>
                  <hli>
                    <hp>one</hp>
                  </hli>
                  <hli>
                    <hp>two</hp>
                  </hli>
                </hul>
              </hth>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>one</hp>
                <hp>two</hp>
              </hth>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('only allows paragraphs and nested lists inside list items in a table cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>item</hp>
                    <hquote>
                      <hp>quoted</hp>
                    </hquote>
                    <hol>
                      <hli>
                        <hp>nested</hp>
                      </hli>
                    </hol>
                  </hli>
                </hul>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>item</hp>
                    <hp>quoted</hp>
                    <hol>
                      <hli>
                        <hp>nested</hp>
                      </hli>
                    </hol>
                  </hli>
                </hul>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });

  describe('toggling lists', () => {
    it.each([BLOCKS.UL_LIST, BLOCKS.OL_LIST])(
      'wraps a paragraph in a table cell in a %s',
      (type) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    item
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
            <hp>
              <htext />
            </hp>
          </editor>
        );

        const { editor } = createTestEditor({ input });
        toggleList(editor, { type });

        expect(editor.children[0]).toMatchObject({
          type: BLOCKS.TABLE,
          children: [
            {
              type: BLOCKS.TABLE_ROW,
              children: [
                {
                  type: BLOCKS.TABLE_CELL,
                  children: [
                    {
                      type,
                      children: [
                        {
                          type: BLOCKS.LIST_ITEM,
                          children: [{ type: BLOCKS.PARAGRAPH, children: [{ text: 'item' }] }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
      },
    );

    it('switches a list in a table cell between bullets and numbers', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>
                      item
                      <cursor />
                    </hp>
                  </hli>
                </hul>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });
      toggleList(editor, { type: BLOCKS.OL_LIST });

      expect(editor.api.node([0, 0, 0, 0])?.[0]).toMatchObject({ type: BLOCKS.OL_LIST });
    });

    it('unwraps a list back into paragraphs within the same table cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>
                      <anchor />
                      one
                    </hp>
                  </hli>
                  <hli>
                    <hp>
                      two
                      <focus />
                    </hp>
                  </hli>
                </hul>
              </htd>
              <htd>
                <hp>other</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  one
                </hp>
                <hp>
                  two
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>other</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });
      toggleList(editor, { type: BLOCKS.UL_LIST });

      assertOutput({ editor, expected });
    });

    it('unwraps a nested list inside a table cell without leaving the cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>parent</hp>
                    <hul>
                      <hli>
                        <hp>
                          child
                          <cursor />
                        </hp>
                      </hli>
                    </hul>
                  </hli>
                </hul>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });
      toggleList(editor, { type: BLOCKS.UL_LIST });

      const cell = editor.api.node([0, 0, 0])?.[0] as any;
      expect(editor.children[0]).toMatchObject({ type: BLOCKS.TABLE });
      expect(cell.type).toBe(BLOCKS.TABLE_CELL);
      expect(editor.api.string([0, 0, 0])).toBe('parentchild');
      expect(editor.api.string([0])).toBe('parentchild');
      expect(editor.children).toHaveLength(2);
    });
  });

  describe('Enter', () => {
    it('exits the list into a paragraph in the same cell when the list item is empty', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>one</hp>
                  </hli>
                  <hli>
                    <hp>
                      <cursor />
                    </hp>
                  </hli>
                </hul>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>one</hp>
                  </hli>
                </hul>
                <hp>
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });
      insertListBreak(editor)();

      assertOutput({ editor, expected });
    });
  });

  describe('Tab', () => {
    it('leaves Tab to the list when the cursor is in a list inside a table cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>one</hp>
                  </hli>
                  <hli>
                    <hp>
                      two
                      <cursor />
                    </hp>
                  </hli>
                </hul>
              </htd>
              <htd>
                <hp>next cell</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });
      const selectionBefore = editor.selection;

      const event = fireTab(editor);

      expect(event.defaultPrevented).toBe(false);
      expect(editor.selection).toEqual(selectionBefore);
    });

    it('indents and outdents list items inside a table cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hul>
                  <hli>
                    <hp>one</hp>
                  </hli>
                  <hli>
                    <hp>
                      two
                      <cursor />
                    </hp>
                  </hli>
                </hul>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });

      moveListItems(editor, { increase: true });
      expect(editor.api.node([0, 0, 0, 0, 0, 1])?.[0]).toMatchObject({ type: BLOCKS.UL_LIST });

      moveListItems(editor, { increase: false });
      moveListItems(editor, { increase: false });

      // Outdenting past the top level keeps the content inside the cell
      expect(editor.children).toHaveLength(2);
      expect(editor.api.node([0, 0, 0])?.[0]).toMatchObject({ type: BLOCKS.TABLE_CELL });
      expect(editor.api.string([0, 0, 0])).toBe('onetwo');
    });

    it('still moves to the next cell when the cursor is in a plain paragraph', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  one
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>next cell</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      );

      const { editor } = createTestEditor({ input });
      const event = fireTab(editor);

      expect(event.defaultPrevented).toBe(true);
      expect(editor.selection?.anchor.path.slice(0, 3)).toEqual([0, 0, 1]);
    });
  });
});
