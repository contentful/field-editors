import { BLOCKS } from '@contentful/rich-text-types';
import { getPluginByType, KEYS } from 'platejs';
import { expect, it, vi } from 'vitest';

import { Paragraph } from '../../plugins/Paragraph/Paragraph';
import { Cell } from '../../plugins/Table/components/Cell';
import { Table } from '../../plugins/Table/components/Table';
import { createTestEditor } from '../../test-utils/createTestEditor';

it('preserves Contentful renderers for native Plate plugins', () => {
  const { editor } = createTestEditor({});
  expect(editor.getPlugin({ key: KEYS.p }).render.node).toBe(Paragraph);
  expect(editor.getPlugin({ key: KEYS.table }).render.node).toBe(Table);
  expect(editor.getPlugin({ key: KEYS.td }).render.node).toBe(Cell);
  expect.soft(getPluginByType(editor, BLOCKS.PARAGRAPH)?.render.node).toBe(Paragraph);
  expect.soft(getPluginByType(editor, BLOCKS.TABLE)?.render.node).toBe(Table);
  expect.soft(getPluginByType(editor, BLOCKS.TABLE_CELL)?.render.node).toBe(Cell);
});

it('splits a paragraph when inserting a fragment of void blocks', () => {
  const { editor } = createTestEditor({});
  editor.children = [{ type: BLOCKS.PARAGRAPH, children: [{ text: 'some text.' }] }];
  editor.tf.select({ path: [0, 0], offset: 4 });
  editor.insertFragment([{ type: BLOCKS.HR, isVoid: true, children: [{ text: '' }] }]);
  expect(editor.children.map((node) => node.type)).toEqual([
    BLOCKS.PARAGRAPH,
    BLOCKS.HR,
    BLOCKS.PARAGRAPH
  ]);
  expect(editor.api.string([0])).toBe('some');
  expect(editor.api.string([2])).toBe(' text.');
});

it('does not register task lists unsupported by the Contentful schema', () => {
  const { editor } = createTestEditor({});
  expect(editor.plugins[KEYS.taskList]).toBeUndefined();
});

it('uses Contentful keyboard handlers without registering native shortcuts', () => {
  const { editor } = createTestEditor({});
  expect(Object.values(editor.meta.shortcuts).filter(Boolean)).toEqual([]);
});

it('handles Enter on a selected embedded block', () => {
  const { editor } = createTestEditor({});
  const embedded = { type: BLOCKS.EMBEDDED_ASSET, isVoid: true, children: [{ text: '' }] };
  editor.children = [embedded, { type: BLOCKS.PARAGRAPH, children: [{ text: '' }] }];
  editor.tf.select({ path: [0, 0], offset: 0 });
  expect(editor.isVoid(embedded)).toBe(true);
  expect(editor.api.isVoid(embedded)).toBe(true);
  expect(editor.api.block()?.[0]).toBe(embedded);
  const plugin = editor.contentfulPlugins.find((plugin) => plugin.key === 'exitBreak')!;
  plugin.handlers!.onKeyDown(
    editor,
    plugin as typeof plugin & { options: any }
  )({
    key: 'Enter',
    which: 13,
    preventDefault: vi.fn()
  });
  expect(editor.children.map((node) => node.type)).toEqual([
    BLOCKS.PARAGRAPH,
    BLOCKS.EMBEDDED_ASSET,
    BLOCKS.PARAGRAPH
  ]);
});
