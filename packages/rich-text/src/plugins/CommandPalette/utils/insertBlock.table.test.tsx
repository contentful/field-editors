/** @jsx jsx */
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { BLOCKS, validateRichTextDocument } from '@contentful/rich-text-types';
import { describe, expect, it, vi } from 'vitest';

import schema from '../../../constants/Schema';
import { select } from '../../../internal/transforms';
import { PlateEditor } from '../../../internal/types';
import { createTestEditor, jsx } from '../../../test-utils';
import { insertBlock } from './insertBlock';

vi.mock('../../../helpers/editor', async () => {
  const actual =
    await vi.importActual<typeof import('../../../helpers/editor')>('../../../helpers/editor');
  return { __esModule: true, ...actual, focus: vi.fn() };
});

// Mirrors what the "Embed Asset" command does after the user picked an asset
const embedFromCommandPalette = (editor: PlateEditor) => {
  const selection = editor.selection!;
  editor.insertBreak();
  insertBlock(editor, BLOCKS.EMBEDDED_ASSET, { sys: { id: 'asset-1', type: 'Asset' } });
  select(editor, selection);
};

const types = (node: any) => node.children.map((child: any) => child.type);

describe('command palette embed asset in table cells', () => {
  it('inserts the asset in the current body cell after the text', () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  text
                  <cursor />
                </hp>
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

    embedFromCommandPalette(editor);
    normalize();

    const cells = (editor.children[0] as any).children[0].children;
    expect(types(cells[0])).toEqual([BLOCKS.PARAGRAPH, BLOCKS.EMBEDDED_ASSET]);
    expect(types(cells[1])).toEqual([BLOCKS.PARAGRAPH]);
    expect(editor.children).toHaveLength(2);
    expect(editor.selection?.focus.path.slice(0, 4)).toEqual([0, 0, 0, 0]);
    expect(
      validateRichTextDocument(toContentfulDocument({ document: editor.children as any, schema })),
    ).toEqual([]);
  });

  it('keeps an empty paragraph before the table untouched', () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <hp />
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });

    embedFromCommandPalette(editor);
    normalize();

    expect((editor.children as any[]).map((node) => node.type)).toEqual([
      BLOCKS.PARAGRAPH,
      BLOCKS.TABLE,
      BLOCKS.PARAGRAPH,
    ]);
    expect(JSON.stringify(editor.children)).toContain(BLOCKS.EMBEDDED_ASSET);
  });
});
