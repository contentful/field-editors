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
import { entries, resources } from '../__fixtures__/fixtures';
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

// Renders per embed node type. vi.mock is hoisted, so it can't run in a loop
// and the shared helper must be hoisted with it.
const { embedRenders, countRenders } = vi.hoisted(() => {
  const embedRenders: Record<string, number> = {};
  const countRenders = async (importOriginal: () => Promise<unknown>, name: string) => {
    const Component = ((await importOriginal()) as Record<string, (props) => unknown>)[name];
    return {
      [name]: (props) => {
        embedRenders[props.element.type] = (embedRenders[props.element.type] ?? 0) + 1;
        return Component(props);
      },
    };
  };
  return { embedRenders, countRenders };
});
vi.mock('../plugins/EmbeddedEntityBlock/LinkedEntityBlock', (io) =>
  countRenders(io, 'LinkedEntityBlock'),
);
vi.mock('../plugins/EmbeddedEntityInline/LinkedEntityInline', (io) =>
  countRenders(io, 'LinkedEntityInline'),
);
vi.mock('../plugins/EmbeddedResourceBlock/LinkedResourceBlock', (io) =>
  countRenders(io, 'LinkedResourceBlock'),
);
vi.mock('../plugins/EmbeddedResourceInline/LinkedResourceInline', (io) =>
  countRenders(io, 'LinkedResourceInline'),
);

// Imported after the mocks are registered
const { ConnectedRichTextEditor } = await import('../RichTextEditor');

const PERF = !!process.env.PERF;
const BLOCK_COUNT = PERF ? 300 : 50;
const KEYSTROKES = PERF ? 100 : 10;

const text = (value: string) => ({ nodeType: 'text', value, marks: [], data: {} });

const entryLink = { sys: { id: entries.published.sys.id, type: 'Link', linkType: 'Entry' } };
const resourceLink = {
  sys: { urn: resources.published.sys.urn, type: 'ResourceLink', linkType: 'Contentful:Entry' },
};
const embed = (nodeType: string, target: unknown) => ({
  nodeType,
  data: { target },
  content: [],
});

const EMBED_TYPES = [
  BLOCKS.EMBEDDED_ENTRY,
  BLOCKS.EMBEDDED_RESOURCE,
  INLINES.EMBEDDED_ENTRY,
  INLINES.EMBEDDED_RESOURCE,
];

// Paragraphs with a hyperlink each. Every 10th block is an embedded entry or
// resource block; every other paragraph also has an inline entry or resource.
const makeDoc = (n: number) => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: Array.from({ length: n }, (_, i) =>
    i % 10 === 5
      ? i % 20 === 5
        ? embed(BLOCKS.EMBEDDED_ENTRY, entryLink)
        : embed(BLOCKS.EMBEDDED_RESOURCE, resourceLink)
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
            ...(i % 2 === 1
              ? [
                  i % 4 === 1
                    ? embed(INLINES.EMBEDDED_ENTRY, entryLink)
                    : embed(INLINES.EMBEDDED_RESOURCE, resourceLink),
                  text(''),
                ]
              : []),
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

    // Guards against a broken fixture making the zero-render assertion vacuous
    for (const type of EMBED_TYPES) {
      expect(embedRenders[type], `${type} rendered at mount`).toBeGreaterThan(0);
    }

    const editor = editors.at(-1)!;
    editor.tf.select({ path: [0, 0], offset: 3 });
    await act(async () => {});

    commits = 0;
    hyperlinkRenders.length = 0;
    for (const type of EMBED_TYPES) embedRenders[type] = 0;
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
        `${commits / KEYSTROKES} commits/keystroke, ${hyperlinkRenders.length} link renders, embed renders ${JSON.stringify(embedRenders)}`,
    );
    expect(hyperlinkRenders).toHaveLength(0);
    for (const type of EMBED_TYPES) {
      expect(embedRenders[type], `${type} re-renders while typing`).toBe(0);
    }
    // Before links/embeds stopped subscribing to the full editor state, every
    // keystroke caused one commit per link and embed.
    expect(commits / KEYSTROKES).toBeLessThan(25);
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
