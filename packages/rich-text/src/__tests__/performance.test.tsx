import * as React from 'react';

import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { newReferenceEditorFakeSdk } from '../__fixtures__/FakeSdk';
import { entries, resources } from '../__fixtures__/fixtures';
import { toSlateDoc } from '../helpers/toSlateDoc';
import { PlateEditor } from '../internal/types';
import { createTestEditor } from '../test-utils';

let editor: PlateEditor;
vi.mock('../internal/pluginAdapter', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../internal/pluginAdapter')>();
  return { ...mod, createPlateEditor: (options) => (editor = mod.createPlateEditor(options)) };
});

const { ConnectedRichTextEditor } = await import('../RichTextEditor');

const BLOCK_COUNT = 50;
const KEYSTROKES = 10;

const text = (value: string) => ({ nodeType: 'text', value, marks: [], data: {} });
const node = (nodeType: string, data: object, content: object[] = []) => ({
  nodeType,
  data,
  content,
});
const entry = {
  target: { sys: { id: entries.published.sys.id, type: 'Link', linkType: 'Entry' } },
};
const resource = {
  target: {
    sys: { urn: resources.published.sys.urn, type: 'ResourceLink', linkType: 'Contentful:Entry' },
  },
};

const makeDoc = (n: number) =>
  node(
    BLOCKS.DOCUMENT,
    {},
    Array.from({ length: n }, (_, i) => {
      if (i % 10 === 3) return node(BLOCKS.EMBEDDED_ENTRY, entry);
      if (i % 10 === 7) return node(BLOCKS.EMBEDDED_RESOURCE, resource);
      const inline =
        i % 4 === 1
          ? [node(INLINES.EMBEDDED_ENTRY, entry), text('')]
          : i % 4 === 3
            ? [node(INLINES.EMBEDDED_RESOURCE, resource), text('')]
            : [];
      return node(BLOCKS.PARAGRAPH, {}, [
        text(`Paragraph ${i} `),
        node(INLINES.HYPERLINK, { uri: 'https://example.com' }, [text('a link')]),
        text(' trailing text.'),
        ...inline,
      ]);
    }),
  );

describe('rich text performance', () => {
  it('typing only re-renders what changed', async () => {
    const [baseSdk] = newReferenceEditorFakeSdk();
    const sdk = {
      ...baseSdk,
      entry: { getSys: () => ({ id: 'perf-entry' }) },
      locales: { ...baseSdk.locales, direction: {} },
      access: { can: async () => true },
      parameters: { instance: {} },
    } as unknown as typeof baseSdk;

    let commits = 0;
    const { container } = render(
      <React.Profiler id="rte" onRender={() => commits++}>
        <ConnectedRichTextEditor sdk={sdk} value={makeDoc(BLOCK_COUNT) as never} />
      </React.Profiler>,
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    commits = 0;
    for (let i = 0; i < KEYSTROKES; i++) {
      await act(async () => {
        editor.tf.insertText('x', { at: { path: [0, 0], offset: 3 } });
      });
    }

    expect(container.textContent).toContain(`Par${'x'.repeat(KEYSTROKES)}agraph 0`);
    // 16 today; re-rendering links or embeds pushes this past 20
    expect(commits / KEYSTROKES).toBeLessThanOrEqual(18);
  }, 120000);

  it('normalizing does not resolve unregistered plugins', () => {
    const { editor } = createTestEditor({});
    editor.children = toSlateDoc(makeDoc(BLOCK_COUNT) as never);

    const { getPlugin } = editor;
    const unregistered = new Set<string>();
    editor.getPlugin = ((plugin) => {
      if (!editor.plugins[plugin.key]) unregistered.add(plugin.key);
      return getPlugin(plugin);
    }) as typeof getPlugin;

    editor.tf.normalize({ force: true });

    expect([...unregistered]).toEqual([]);
  });
});
