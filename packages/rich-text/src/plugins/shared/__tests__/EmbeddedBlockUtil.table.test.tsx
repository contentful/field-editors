/** @jsx jsx */
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { BLOCKS, validateRichTextDocument } from '@contentful/rich-text-types';
import { describe, expect, it, vi } from 'vitest';

import schema from '../../../constants/Schema';
import { PlateEditor } from '../../../internal/types';
import { createTestEditor, jsx } from '../../../test-utils';
import { selectEntityAndInsert } from '../EmbeddedBlockUtil';

vi.mock('../../../helpers/editor', async () => {
  const actual =
    await vi.importActual<typeof import('../../../helpers/editor')>('../../../helpers/editor');
  return {
    __esModule: true,
    ...actual,
    focus: vi.fn(),
  };
});

const sdk: any = {
  field: { locale: 'en-US', validations: [] },
  dialogs: {
    selectSingleAsset: vi.fn(async () => ({ sys: { id: 'asset-1', type: 'Asset' } })),
  },
  navigator: {
    onSlideInNavigation: vi.fn(() => () => {}),
  },
};

const embedAsset = (editor: PlateEditor) =>
  selectEntityAndInsert(BLOCKS.EMBEDDED_ASSET, sdk, editor, vi.fn());

const types = (node: any) => node.children.map((child: any) => child.type ?? 'text');

const getCell = (editor: PlateEditor, row = 0, cell = 0) =>
  (editor.children as any[]).find((node) => node.type === BLOCKS.TABLE).children[row].children[
    cell
  ];

const toDocument = (editor: PlateEditor) =>
  toContentfulDocument({ document: editor.children as any, schema });

describe('embedding an asset in a table cell', () => {
  it('turns the empty paragraph of an empty cell into the asset and keeps a paragraph after it', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>header</hp>
              </hth>
            </htr>
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

    await embedAsset(editor);
    normalize();

    expect(types(getCell(editor, 1))).toEqual([BLOCKS.EMBEDDED_ASSET, BLOCKS.PARAGRAPH]);
    expect(getCell(editor, 1).children[0].data.target.sys).toEqual({
      id: 'asset-1',
      type: 'Link',
      linkType: 'Asset',
    });
    expect(editor.selection?.focus.path.slice(0, 4)).toEqual([0, 1, 0, 1]);
  });

  it('splits a paragraph at the cursor and inserts the asset between the halves', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  before
                  <cursor />
                  after
                </hp>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });

    await embedAsset(editor);
    normalize();

    expect(types(getCell(editor))).toEqual([
      BLOCKS.PARAGRAPH,
      BLOCKS.EMBEDDED_ASSET,
      BLOCKS.PARAGRAPH,
    ]);
    expect(getCell(editor).children[0].children[0].text).toBe('before');
    expect(getCell(editor).children[2].children[0].text).toBe('after');
  });

  it('inserts the asset in the last cell of a row, never after the table', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>first</hp>
              </htd>
              <htd>
                <hp>
                  last
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });

    await embedAsset(editor);
    normalize();

    expect(types(getCell(editor, 0, 0))).toEqual([BLOCKS.PARAGRAPH]);
    expect(types(getCell(editor, 0, 1))).toEqual([
      BLOCKS.PARAGRAPH,
      BLOCKS.EMBEDDED_ASSET,
      BLOCKS.PARAGRAPH,
    ]);
    expect((editor.children as any[]).map((node) => node.type)).toEqual([
      BLOCKS.TABLE,
      BLOCKS.PARAGRAPH,
    ]);
  });

  it('keeps an empty paragraph before the table', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <hp />
          <htable>
            <htr>
              <htd>
                <hp>
                  text
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });

    await embedAsset(editor);
    normalize();

    expect((editor.children as any[]).map((node) => node.type)).toEqual([
      BLOCKS.PARAGRAPH,
      BLOCKS.TABLE,
      BLOCKS.PARAGRAPH,
    ]);
  });

  it('adds assets next to existing assets in the same cell', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hembed type="Asset" id="existing" />
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

    await embedAsset(editor);
    normalize();

    expect(types(getCell(editor))).toEqual([
      BLOCKS.EMBEDDED_ASSET,
      BLOCKS.EMBEDDED_ASSET,
      BLOCKS.PARAGRAPH,
    ]);
  });

  it('does not insert in a table header cell', async () => {
    const { editor, normalize } = createTestEditor({
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
          <hp />
        </editor>
      ),
    });
    const logAction = vi.fn();

    await selectEntityAndInsert(BLOCKS.EMBEDDED_ASSET, sdk, editor, logAction);
    normalize();

    expect(types(getCell(editor))).toEqual([BLOCKS.PARAGRAPH]);
    expect(logAction).toHaveBeenCalledWith('cancelCreateEmbedDialog', {
      nodeType: BLOCKS.EMBEDDED_ASSET,
    });
  });

  it('does not insert when the selection spans several cells', async () => {
    const { editor, normalize } = createTestEditor({
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
          <hp />
        </editor>
      ),
    });

    await embedAsset(editor);
    normalize();

    expect(JSON.stringify(editor.children)).not.toContain(BLOCKS.EMBEDDED_ASSET);
  });

  it('produces a document that the rich text validator accepts', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <hth>
                <hp>header</hp>
              </hth>
              <hth>
                <hp>header</hp>
              </hth>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>text</hp>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });

    await embedAsset(editor);
    normalize();

    const document = toDocument(editor);
    expect(JSON.stringify(document)).toContain(BLOCKS.EMBEDDED_ASSET);
    expect(validateRichTextDocument(document)).toEqual([]);
  });

  it('is undone in a single step', async () => {
    const { editor, normalize } = createTestEditor({
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  before
                  <cursor />
                  after
                </hp>
              </htd>
            </htr>
          </htable>
          <hp />
        </editor>
      ),
    });
    normalize();
    const before = JSON.stringify(editor.children);

    await embedAsset(editor);
    expect(JSON.stringify(editor.children)).not.toBe(before);

    (editor as any).undo();

    expect(JSON.stringify(editor.children)).toBe(before);
  });
});
