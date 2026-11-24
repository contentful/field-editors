/** @jsx jsx */
import { describe, expect, it, vi } from 'vitest';

import { PlateEditor } from '../../../internal/types';
import { createTestEditor, jsx } from '../../../test-utils';
import { getSetFragmentData } from '../createTablePlugin';

const createEditor = () => {
  const { editor, normalize } = createTestEditor({
    input: (
      <editor>
        <htable>
          <htr>
            <hth>
              <hp>head one</hp>
            </hth>
            <hth>
              <hp>head two</hp>
            </hth>
          </htr>
          <htr>
            <htd>
              <hp>body one</hp>
              <hembed type="Asset" id="asset-1" />
            </htd>
            <htd>
              <hp>body two</hp>
            </htd>
          </htr>
        </htable>
        <hp>outside</hp>
      </editor>
    ),
  });
  normalize();
  return editor;
};

const select = (editor: PlateEditor, anchor: number[], focus: number[]) => {
  editor.selection = {
    anchor: { path: anchor, offset: 0 },
    focus: { path: focus, offset: 0 },
  };
};

const setup = (selection: (editor: PlateEditor) => void) => {
  const editor = createEditor();
  selection(editor);
  const withoutTable = vi.fn();
  const withTable = vi.fn();
  const setFragmentData = getSetFragmentData(editor, withoutTable, withTable);
  return { setFragmentData, withoutTable, withTable };
};

const data = {} as DataTransfer;

describe('getSetFragmentData', () => {
  describe('for a drag inside a single cell', () => {
    it.each([
      ['an asset in a body cell', [0, 1, 0, 1, 0], [0, 1, 0, 1, 0]],
      ['text in a body cell', [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
      ['text in a header cell', [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
    ])('skips the whole table serialization when dragging %s', (_, anchor, focus) => {
      const { setFragmentData, withoutTable, withTable } = setup((editor) =>
        select(editor, anchor, focus),
      );

      setFragmentData(data, 'drag');

      expect(withoutTable).toHaveBeenCalledWith(data, 'drag');
      expect(withTable).not.toHaveBeenCalled();
    });
  });

  describe('for anything else', () => {
    it.each(['copy', 'cut'] as const)('keeps the table path for %s in a single cell', (origin) => {
      const { setFragmentData, withoutTable, withTable } = setup((editor) =>
        select(editor, [0, 1, 0, 1, 0], [0, 1, 0, 1, 0]),
      );

      setFragmentData(data, origin);

      expect(withTable).toHaveBeenCalledWith(data, origin);
      expect(withoutTable).not.toHaveBeenCalled();
    });

    it('keeps the table path for a drag across cells', () => {
      const { setFragmentData, withoutTable, withTable } = setup((editor) =>
        select(editor, [0, 1, 0, 0, 0], [0, 1, 1, 0, 0]),
      );

      setFragmentData(data, 'drag');

      expect(withTable).toHaveBeenCalledWith(data, 'drag');
      expect(withoutTable).not.toHaveBeenCalled();
    });

    it('keeps the table path for a drag outside of a table', () => {
      const { setFragmentData, withoutTable, withTable } = setup((editor) =>
        select(editor, [1, 0], [1, 0]),
      );

      setFragmentData(data, 'drag');

      expect(withTable).toHaveBeenCalledWith(data, 'drag');
      expect(withoutTable).not.toHaveBeenCalled();
    });
  });
});
