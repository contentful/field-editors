/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { setHeader } from '../actions';
import { hasEmbeddedAsset, isTableHeaderBlockedByAssets, isTableHeaderEnabled } from '../helpers';

const bodyFirstRowWithAsset = (
  <editor>
    <htable>
      <htr>
        <htd>
          <hp>
            <cursor />
            text
          </hp>
        </htd>
        <htd>
          <hembed type="Asset" id="asset-1" />
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>second</hp>
        </htd>
        <htd>
          <hp>row</hp>
        </htd>
      </htr>
    </htable>
    <hp />
  </editor>
);

describe('setHeader with embedded assets', () => {
  it('does not turn a first row with assets into a header row', () => {
    const { editor } = createTestEditor({ input: bodyFirstRowWithAsset });

    expect(isTableHeaderBlockedByAssets(editor)).toBe(true);

    setHeader(editor, true);

    expect(isTableHeaderEnabled(editor)).toBe(false);
    assertOutput({
      editor,
      expected: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                  text
                </hp>
              </htd>
              <htd>
                <hembed type="Asset" id="asset-1" />
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>second</hp>
              </htd>
              <htd>
                <hp>row</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <htext />
          </hp>
        </editor>
      ),
    });
  });

  it('turns a first row without assets into a header row and back, keeping assets below', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                  first
                </hp>
              </htd>
            </htr>
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

    expect(isTableHeaderBlockedByAssets(editor)).toBe(false);

    setHeader(editor, true);
    expect(isTableHeaderEnabled(editor)).toBe(true);
    expect(JSON.stringify(editor.children)).toContain('asset-1');

    setHeader(editor, false);
    expect(isTableHeaderEnabled(editor)).toBe(false);
    expect(JSON.stringify(editor.children)).toContain('asset-1');
  });

  it('can always disable the header', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>
                  <cursor />
                  header
                </hp>
              </hth>
            </htr>
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

    setHeader(editor, false);

    expect(isTableHeaderEnabled(editor)).toBe(false);
    expect(JSON.stringify(editor.children)).toContain('asset-1');
  });

  it('undoes the header change in a single step', () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                  first
                </hp>
              </htd>
            </htr>
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
    normalize();
    const before = JSON.stringify(editor.children);

    setHeader(editor, true);
    (editor as any).undo();

    expect(JSON.stringify(editor.children)).toBe(before);
  });
});

describe('hasEmbeddedAsset', () => {
  it('finds assets at any depth and ignores other voids', () => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hembed type="Entry" id="entry-id" />
              </htd>
            </htr>
          </htable>
          <htable>
            <htr>
              <htd>
                <hp>
                  text
                  <hembed type="Asset" id="asset-1" />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ),
    });

    const [entryTable, assetTable] = editor.children as any[];

    expect(hasEmbeddedAsset(entryTable)).toBe(false);
    expect(hasEmbeddedAsset(assetTable.children[0])).toBe(true);
  });
});
