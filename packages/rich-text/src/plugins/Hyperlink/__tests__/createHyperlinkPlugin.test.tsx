/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { FieldAppSDK, ModalDialogLauncher } from '@contentful/field-editor-shared';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { focus } from '../../../helpers/editor';
import { setEditorValue } from '../../../internal/transforms';
import { assertOutput, jsx } from '../../../test-utils';
import { createTestEditor } from '../../../test-utils/createTestEditor';
import { addOrEditLink } from '../HyperlinkModal';

describe('normalization', () => {
  it('removes empty links from the document structure', () => {
    const input = (
      <editor>
        <hp>
          <htext>link</htext>
          <hlink uri="https://link.com" />
        </hp>
        <hp>
          <htext>asset</htext>
          <hlink asset="asset-id" />
        </hp>
        <hp>
          <htext>entry</htext>
          <hlink entry="entry-id" />
        </hp>
        <hp>
          <htext>resource</htext>
          <hlink resource="resource-urn" />
        </hp>
        <hp>
          <htext>explicit empty link</htext>
          <hlink uri="https://link.com">{''}</hlink>
        </hp>
        <hp>
          <htext>link with empty space</htext>
          <hlink uri="https://link.com"> </hlink>
        </hp>
      </editor>
    );

    const expected = (
      <editor>
        <hp>
          <htext>link</htext>
        </hp>
        <hp>
          <htext>asset</htext>
        </hp>
        <hp>
          <htext>entry</htext>
        </hp>
        <hp>
          <htext>resource</htext>
        </hp>
        <hp>
          <htext>explicit empty link</htext>
        </hp>
        <hp>
          <htext>link with empty space</htext>
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });
});

vi.mock('@contentful/field-editor-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@contentful/field-editor-shared')>();
  return { ...actual, ModalDialogLauncher: { ...actual.ModalDialogLauncher, openDialog: vi.fn() } };
});

vi.mock('../../../helpers/editor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../helpers/editor')>();
  return { ...actual, focus: vi.fn() };
});

afterEach(() => vi.clearAllMocks());

const paragraph = (text: string) => ({ type: BLOCKS.PARAGRAPH, children: [{ text }] });
const link = {
  type: INLINES.HYPERLINK,
  data: { uri: 'https://old.example' },
  children: [{ text: 'link' }],
};
const response = {
  linkType: INLINES.HYPERLINK,
  linkText: 'link',
  linkTarget: 'https://new.example',
};
const sdk = { field: { validation: [] } } as unknown as FieldAppSDK;

function openDialog(editor: ReturnType<typeof createTestEditor>['editor'], targetPath?: number[]) {
  let close!: (data: typeof response | null) => void;
  vi.mocked(ModalDialogLauncher.openDialog).mockReturnValue(
    new Promise((resolve) => {
      close = resolve;
    }),
  );
  const pending = addOrEditLink(editor, sdk, vi.fn(), targetPath);
  expect(ModalDialogLauncher.openDialog).toHaveBeenCalledOnce();
  return { pending, close };
}

describe('document changes while a hyperlink dialog is open', () => {
  it.each(['submit', 'cancel'] as const)(
    'keeps the replacement document and a valid caret on %s',
    async (action) => {
      const { editor } = createTestEditor({});
      editor.children = [paragraph('first'), paragraph('second'), paragraph('link')];
      editor.tf.select({ anchor: { path: [2, 0], offset: 0 }, focus: { path: [2, 0], offset: 4 } });
      const { pending, close } = openDialog(editor);

      setEditorValue(editor, [paragraph('replacement')]);
      const selection = structuredClone(editor.selection);
      close(action === 'submit' ? response : null);

      await expect(pending).resolves.toBeUndefined();
      expect(editor.children).toEqual([paragraph('replacement')]);
      expect(editor.selection).toEqual(selection);
      expect(focus).toHaveBeenCalledOnce();
    },
  );

  it('links the selected text when an external update changes another paragraph', async () => {
    const { editor } = createTestEditor({});
    editor.children = [paragraph('first'), paragraph('link')];
    editor.tf.select({ anchor: { path: [1, 0], offset: 0 }, focus: { path: [1, 0], offset: 4 } });
    const { pending, close } = openDialog(editor);

    setEditorValue(editor, [paragraph('first!'), paragraph('link')]);
    close(response);
    await pending;

    expect(editor.children[0]).toEqual(paragraph('first!'));
    expect(editor.children[1].children).toContainEqual({
      ...link,
      data: { uri: response.linkTarget },
    });
  });

  it('edits the target link when an external update changes another paragraph', async () => {
    const { editor } = createTestEditor({});
    const linkParagraph = { type: BLOCKS.PARAGRAPH, children: [{ text: '' }, link, { text: '' }] };
    editor.children = [paragraph('first'), linkParagraph];
    editor.tf.select({ path: [1, 1, 0], offset: 2 });
    const { pending, close } = openDialog(editor, [1, 1]);

    setEditorValue(editor, [paragraph('first!'), linkParagraph]);
    close(response);
    await pending;

    expect(editor.children[0]).toEqual(paragraph('first!'));
    expect(editor.children[1].children[1]).toEqual({ ...link, data: { uri: response.linkTarget } });
  });

  it('does not edit a different link that replaces the original target', async () => {
    const { editor } = createTestEditor({});
    editor.children = [{ type: BLOCKS.PARAGRAPH, children: [{ text: '' }, link, { text: '' }] }];
    editor.tf.select({ path: [0, 1, 0], offset: 2 });
    const { pending, close } = openDialog(editor, [0, 1]);
    const replacement = [
      {
        type: BLOCKS.PARAGRAPH,
        children: [
          { text: '' },
          { ...link, data: { uri: 'https://replacement.example' } },
          { text: '' },
        ],
      },
    ];
    setEditorValue(editor, replacement);
    close(response);

    await pending;
    expect(editor.children).toEqual(replacement);
  });
});
