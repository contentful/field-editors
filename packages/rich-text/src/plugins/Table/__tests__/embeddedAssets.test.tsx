/** @jsx jsx */
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { BLOCKS, validateRichTextDocument } from '@contentful/rich-text-types';
import { describe, expect, it, vi } from 'vitest';

import schema from '../../../constants/Schema';
import { withoutNormalizing } from '../../../internal';
import { deleteColumn, deleteRow, deleteTable } from '../../../internal/table';
import { PlateEditor } from '../../../internal/types';
import { createTestEditor, jsx } from '../../../test-utils';
import { getWithEmbeddedBlockEvents } from '../../shared/EmbeddedBlockUtil';

// Selects the (void) asset, which is the second child of the first cell of the second row
const selectAsset = (editor: PlateEditor) => {
  editor.selection = {
    anchor: { path: [0, 1, 0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0, 1, 0], offset: 0 },
  };
};

const createEditorWithAssetInCell = () => {
  const { editor, normalize } = createTestEditor({
    input: (
      <editor>
        <htable>
          <htr>
            <hth>
              <hp>one</hp>
            </hth>
            <hth>
              <hp>two</hp>
            </hth>
          </htr>
          <htr>
            <htd>
              <hp>text</hp>
              <hembed type="Asset" id="asset-1" />
            </htd>
            <htd>
              <hp>other</hp>
            </htd>
          </htr>
        </htable>
        <hp />
      </editor>
    ),
  });
  normalize();
  selectAsset(editor);
  return editor;
};

const snapshot = (editor: PlateEditor) => JSON.stringify(editor.children);
const hasAsset = (editor: PlateEditor) => snapshot(editor).includes(BLOCKS.EMBEDDED_ASSET);
const isValid = (editor: PlateEditor) =>
  validateRichTextDocument(toContentfulDocument({ document: editor.children as any, schema }));

describe('embedded assets in table cells', () => {
  describe.each(['Backspace', 'Delete'])('%s on the selected asset', (key) => {
    const press = (editor: PlateEditor) => {
      const handler = getWithEmbeddedBlockEvents(BLOCKS.EMBEDDED_ASSET, {} as any)(editor, {
        options: { hotkey: 'mod+shift+a' },
      } as any);
      handler({ key, preventDefault: vi.fn() } as any);
    };

    it('removes only the asset and leaves a valid cell', () => {
      const editor = createEditorWithAssetInCell();
      expect(hasAsset(editor)).toBe(true);

      press(editor);

      expect(hasAsset(editor)).toBe(false);
      expect(snapshot(editor)).toContain('text');
      expect(isValid(editor)).toEqual([]);
    });

    it('is undone in a single step', () => {
      const editor = createEditorWithAssetInCell();
      const before = snapshot(editor);

      press(editor);
      (editor as any).undo();

      expect(snapshot(editor)).toBe(before);
    });
  });

  it('removes the asset and leaves a valid cell when the asset is the only content', () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hembed type="Asset" id="asset-1" />
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });

    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    };
    getWithEmbeddedBlockEvents(BLOCKS.EMBEDDED_ASSET, {} as any)(editor, {
      options: { hotkey: 'mod+shift+a' },
    } as any)({ key: 'Backspace', preventDefault: vi.fn() } as any);
    normalize();

    expect(hasAsset(editor)).toBe(false);
    expect((editor.children[0] as any).children[0].children[0].children).toMatchObject([
      { type: BLOCKS.PARAGRAPH },
    ]);
    expect(isValid(editor)).toEqual([]);
  });

  it.each([
    ['row', deleteRow, false],
    ['column', deleteColumn, false],
    ['table', deleteTable, true],
  ])('deletes the %s that contains an asset and undoes it in one step', (_, action, noTable) => {
    const editor = createEditorWithAssetInCell();
    const before = snapshot(editor);

    withoutNormalizing(editor, () => {
      (action as (editor: PlateEditor, options: unknown) => void)(editor, { header: true });
    });

    expect(hasAsset(editor)).toBe(false);
    expect(editor.children.some((node: any) => node.type === BLOCKS.TABLE)).toBe(!noTable);
    expect(isValid(editor)).toEqual([]);

    (editor as any).undo();

    expect(snapshot(editor)).toBe(before);
  });
});
