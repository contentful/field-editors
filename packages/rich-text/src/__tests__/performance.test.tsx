/**
 * Render-count regression tests. Counts are deterministic, unlike timings, so
 * they can run in CI. `PERF=1` uses a larger document and prints timings for
 * manual before/after comparisons.
 */
import * as React from 'react';

import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { newReferenceEditorFakeSdk } from '../__fixtures__/FakeSdk';
import { entries } from '../__fixtures__/fixtures';
import { toSlateDoc } from '../helpers/toSlateDoc';
import { PlateEditor } from '../internal/types';
import { createTestEditor } from '../test-utils';

const editors: PlateEditor[] = [];
vi.mock('../internal/pluginAdapter', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../internal/pluginAdapter')>();
  return {
    ...mod,
    createPlateEditor: (options) => {
      const editor = mod.createPlateEditor(options);
      editors.push(editor);
      return editor;
    },
  };
});

const hyperlinkRenders: unknown[] = [];
vi.mock('../plugins/Hyperlink/components/useHyperlinkCommon', async (importOriginal) => {
  const mod =
    await importOriginal<typeof import('../plugins/Hyperlink/components/useHyperlinkCommon')>();
  return {
    useHyperlinkCommon: (element) => {
      hyperlinkRenders.push(element);
      return mod.useHyperlinkCommon(element);
    },
  };
});

const embedRenders: unknown[] = [];
vi.mock('../plugins/EmbeddedEntityBlock/LinkedEntityBlock', async (importOriginal) => {
  const mod =
    await importOriginal<typeof import('../plugins/EmbeddedEntityBlock/LinkedEntityBlock')>();
  return {
    LinkedEntityBlock: (props) => {
      embedRenders.push(props.element);
      return mod.LinkedEntityBlock(props);
    },
  };
});

// Imported after the mocks are registered
const { ConnectedRichTextEditor } = await import('../RichTextEditor');

const PERF = !!process.env.PERF;
const BLOCK_COUNT = PERF ? 300 : 50;
const KEYSTROKES = PERF ? 100 : 10;

const text = (value: string) => ({ nodeType: 'text', value, marks: [], data: {} });

// Paragraphs with a hyperlink each, plus an embedded entry every 10 blocks
const makeDoc = (n: number) => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: Array.from({ length: n }, (_, i) =>
    i % 10 === 5
      ? {
          nodeType: BLOCKS.EMBEDDED_ENTRY,
          data: {
            target: { sys: { id: entries.published.sys.id, type: 'Link', linkType: 'Entry' } },
          },
          content: [],
        }
      : {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            text(`Paragraph ${i} `),
            {
              nodeType: INLINES.HYPERLINK,
              data: { uri: 'https://example.com' },
              content: [text('a link')],
            },
            text(' trailing text.'),
          ],
        },
  ),
});

const report = (msg: string) => {
  // eslint-disable-next-line no-console -- benchmark output
  if (PERF) console.log(`[perf] ${msg}`);
};

describe('rich text performance', () => {
  it('typing does not re-render unrelated links and embeds', async () => {
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

    const editor = editors.at(-1)!;
    editor.tf.select({ path: [0, 0], offset: 3 });
    await act(async () => {});

    commits = 0;
    hyperlinkRenders.length = 0;
    embedRenders.length = 0;
    const start = performance.now();
    for (let i = 0; i < KEYSTROKES; i++) {
      await act(async () => {
        editor.tf.insertText('x');
      });
    }
    const elapsed = performance.now() - start;

    expect(container.textContent).toContain(`Par${'x'.repeat(KEYSTROKES)}agraph 0`);
    report(
      `${BLOCK_COUNT} blocks: ${(elapsed / KEYSTROKES).toFixed(2)}ms/keystroke, ` +
        `${commits / KEYSTROKES} commits/keystroke, ${hyperlinkRenders.length} link renders, ${embedRenders.length} embed renders`,
    );
    // Before subscribing links/embeds to the full editor state was fixed,
    // every keystroke caused one commit per link and embed (~65 here).
    expect(commits / KEYSTROKES).toBeLessThan(25);
    expect(hyperlinkRenders).toHaveLength(0);
    expect(embedRenders).toHaveLength(0);
  }, 120000);

  it('normalizing does not resolve unregistered plugins', () => {
    const { editor } = createTestEditor({});
    editor.children = toSlateDoc(makeDoc(BLOCK_COUNT) as never);

    // Plate builds a throwaway plugin via lodash deep-merge for every lookup of
    // an unregistered key, which made normalization ~2.7x slower.
    const { getPlugin } = editor;
    const unregistered = new Set<string>();
    editor.getPlugin = ((plugin) => {
      if (!editor.plugins[plugin.key]) unregistered.add(plugin.key);
      return getPlugin(plugin);
    }) as typeof getPlugin;

    const start = performance.now();
    editor.tf.normalize({ force: true });
    report(`normalize ${BLOCK_COUNT} blocks: ${(performance.now() - start).toFixed(0)}ms`);

    expect([...unregistered]).toEqual([]);
  });
});
