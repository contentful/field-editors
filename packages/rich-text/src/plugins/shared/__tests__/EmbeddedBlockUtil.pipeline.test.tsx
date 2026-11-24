/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';
import { pipeHandler } from 'platejs/react';
import { describe, expect, it, vi } from 'vitest';

import { PlateEditor } from '../../../internal/types';
import { createTestEditor, jsx } from '../../../test-utils';

// Runs the key down handlers of all plugins of the editor, the way Plate does for a key press
const pressKey = (editor: PlateEditor, key: string) => {
  const handler = pipeHandler(editor as any, { handlerKey: 'onKeyDown' } as any);
  const event = {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    persist: vi.fn(),
    isPropagationStopped: () => false,
    isDefaultPrevented: () => false,
    nativeEvent: {},
  };
  return handler!(event as any);
};

const types = (nodes: any[]) => nodes.map((node) => node.type);
const getCell = (editor: PlateEditor) => (editor.children[0] as any).children[1].children[0];

describe('Backspace and Delete on a selected embedded block, through all plugin handlers', () => {
  describe.each(['Backspace', 'Delete'])('%s', (key) => {
    it('removes only the selected asset when another asset follows it in a table cell', () => {
      const { editor, normalize } = createTestEditor({
        input: (
          <editor>
            <htable>
              <htr>
                <hth>
                  <hp>head</hp>
                </hth>
              </htr>
              <htr>
                <htd>
                  <hp />
                  <hembed type="Asset" id="asset-1" />
                  <hembed type="Asset" id="asset-2" />
                  <hembed type="Asset" id="asset-3" />
                </htd>
              </htr>
            </htable>
            <hp />
          </editor>
        ),
      });
      normalize();
      editor.selection = {
        anchor: { path: [0, 1, 0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0, 1, 0], offset: 0 },
      };

      expect(pressKey(editor, key)).toBe(true);

      const cell = getCell(editor);
      expect(types(cell.children)).toEqual([
        BLOCKS.PARAGRAPH,
        BLOCKS.EMBEDDED_ASSET,
        BLOCKS.EMBEDDED_ASSET,
      ]);
      expect(cell.children.slice(1).map((node) => node.data.target.sys.id)).toEqual([
        'asset-2',
        'asset-3',
      ]);
    });

    it.each([
      ['an entry block', BLOCKS.EMBEDDED_ENTRY, 'Entry'],
      ['an asset block', BLOCKS.EMBEDDED_ASSET, 'Asset'],
    ] as const)(
      'removes only %s outside of a table when another one follows it',
      (_, type, linkType) => {
        const { editor } = createTestEditor({
          input: (
            <editor>
              <hp>before</hp>
              <hembed type={linkType} id="first" />
              <hembed type={linkType} id="second" />
              <hp>after</hp>
            </editor>
          ),
        });
        editor.selection = {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        };

        expect(pressKey(editor, key)).toBe(true);

        expect(types(editor.children as any[])).toEqual([BLOCKS.PARAGRAPH, type, BLOCKS.PARAGRAPH]);
        expect((editor.children[1] as any).data.target.sys.id).toBe('second');
      },
    );

    it('does not handle the key when the selection is not in an embedded block', () => {
      const { editor } = createTestEditor({
        input: (
          <editor>
            <hp>text</hp>
            <hembed type="Asset" id="asset-1" />
          </editor>
        ),
      });
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };

      pressKey(editor, key);

      expect(types(editor.children as any[])).toContain(BLOCKS.EMBEDDED_ASSET);
    });
  });
});
