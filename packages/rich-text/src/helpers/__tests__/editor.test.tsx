/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { createTestEditor, jsx } from '../../test-utils';
import {
  canInsertEmbeddedAssetBlock,
  isSelectionInSingleTableCell,
  isSelectionInTableBodyCell,
} from '../editor';

const embeddedAsset = <hembed type="Asset" id="asset-id" />;

describe('isSelectionInSingleTableCell', () => {
  it('is true for a cursor in a body cell and in a header cell', () => {
    const body = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  cell
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });
    const header = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  cell
                  <cursor />
                </hp>
              </hth>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(isSelectionInSingleTableCell(body.editor)).toBe(true);
    expect(isSelectionInSingleTableCell(header.editor)).toBe(true);
  });

  it('is false across two cells, outside a table and without selection', () => {
    const across = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  one
                </hp>
              </htd>
              <htd>
                <hp>
                  two
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });
    const outside = createTestEditor({
      input: (
        <editor>
          <hp>
            text
            <cursor />
          </hp>
        </editor>
      ),
    });

    expect(isSelectionInSingleTableCell(across.editor)).toBe(false);
    expect(isSelectionInSingleTableCell(outside.editor)).toBe(false);
    expect(isSelectionInSingleTableCell(null)).toBe(false);
  });
});

describe('isSelectionInTableBodyCell', () => {
  it('is true for a cursor in a table body cell', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  cell
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(true);
  });

  it('is true for a range within the same table body cell', () => {
    const { editor } = createTestEditor({
      input: (
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
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(true);
  });

  it('is false for a cursor in a table header cell', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  header
                  <cursor />
                </hp>
              </hth>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(false);
  });

  it('is false for a range across two cells', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  one
                </hp>
              </htd>
              <htd>
                <hp>
                  two
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(false);
  });

  it('is false for a range from a body cell into the header cell of the same table', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  <anchor />
                  header
                </hp>
              </hth>
            </htr>
            <htr>
              <htd>
                <hp>
                  body
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(false);
  });

  it('is false for a cursor inside a list in a table body cell', () => {
    const { editor } = createTestEditor({
      input: (
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
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(false);
  });

  it('is false outside of tables', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hp>
            text
            <cursor />
          </hp>
        </editor>
      ),
    });

    expect(isSelectionInTableBodyCell(editor)).toBe(false);
  });

  it('is false without a selection', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>cell</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    editor.selection = null;

    expect(isSelectionInTableBodyCell(editor)).toBe(false);
    expect(isSelectionInTableBodyCell(null)).toBe(false);
  });
});

describe('canInsertEmbeddedAssetBlock', () => {
  it('is true outside of tables, including next to other embedded blocks', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          {embeddedAsset}
          <hp>
            text
            <cursor />
          </hp>
        </editor>
      ),
    });

    expect(canInsertEmbeddedAssetBlock(editor)).toBe(true);
  });

  it('is true in a table body cell, also next to an asset', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                {embeddedAsset}
                <hp>
                  text
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(canInsertEmbeddedAssetBlock(editor)).toBe(true);
  });

  it('is false in a table header cell', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  text
                  <cursor />
                </hp>
              </hth>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(canInsertEmbeddedAssetBlock(editor)).toBe(false);
  });

  it('is false for a range across two table cells', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  one
                </hp>
              </htd>
              <htd>
                <hp>
                  two
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    expect(canInsertEmbeddedAssetBlock(editor)).toBe(false);
  });

  it('is true without a selection, like before', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hp>text</hp>
        </editor>
      ),
    });

    editor.selection = null;

    expect(canInsertEmbeddedAssetBlock(editor)).toBe(true);
  });
});
