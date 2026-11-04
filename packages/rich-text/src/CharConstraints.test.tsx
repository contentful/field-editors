import React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CharConstraints } from './CharConstraints';
import { createPlateEditor, Plate, PlateContent } from './internal/plate';
import { createCharCounterPlugin } from './plugins/CharCounter';
import * as charCounterUtils from './plugins/CharCounter/utils';
import { createParagraphPlugin } from './plugins/Paragraph';
import { SdkProvider } from './SdkProvider';

const sdk = {
  field: { validations: [{ size: { max: 250 } }] },
  parameters: { instance: {} },
} as unknown as FieldAppSDK;

function renderCounter(text: string) {
  const onContentRender = vi.fn();
  const editor = createPlateEditor({
    value: [{ type: BLOCKS.PARAGRAPH, children: [{ text }] }],
    plugins: [createParagraphPlugin(), createCharCounterPlugin()],
  });
  const view = render(
    <Plate editor={editor}>
      <React.Profiler id="editor-content" onRender={onContentRender}>
        <PlateContent />
      </React.Profiler>
      <SdkProvider sdk={sdk}>
        <CharConstraints />
      </SdkProvider>
    </Plate>,
  );

  return { editor, onContentRender, ...view };
}

// Flush the edit's render before waiting for any delayed character recount.
async function edit(operation: () => void) {
  await act(async () => operation());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
}

describe('CharConstraints', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('updates the displayed count after deleting whitespace, undoing and redoing', async () => {
    const { editor, getByText } = renderCounter(' '.repeat(305));
    expect(getByText('305 characters')).toHaveStyle({ color: tokens.red600 });

    await edit(() => {
      editor.apply({ type: 'remove_text', path: [0, 0], offset: 223, text: ' '.repeat(82) });
    });
    expect(getByText('223 characters')).not.toHaveStyle({ color: tokens.red600 });

    await edit(() => editor.undo());
    expect(getByText('305 characters')).toHaveStyle({ color: tokens.red600 });

    await edit(() => editor.redo());
    expect(getByText('223 characters')).not.toHaveStyle({ color: tokens.red600 });
  });

  it('updates the displayed count after inserting text, undoing and redoing', async () => {
    const { editor, getByText } = renderCounter('a'.repeat(244));
    expect(getByText('244 characters')).not.toHaveStyle({ color: tokens.red600 });

    await edit(() => editor.tf.insertText('b'.repeat(61), { at: { path: [0, 0], offset: 244 } }));
    expect(getByText('305 characters')).toHaveStyle({ color: tokens.red600 });

    await edit(() => editor.undo());
    expect(getByText('244 characters')).not.toHaveStyle({ color: tokens.red600 });

    await edit(() => editor.redo());
    expect(getByText('305 characters')).toHaveStyle({ color: tokens.red600 });
  });

  it('recounts once after a burst of edits pauses for 300 ms', async () => {
    const { editor, getByText } = renderCounter('a'.repeat(244));
    const recount = vi.spyOn(charCounterUtils, 'getTextContent');

    for (let i = 0; i < 30; i++) {
      await act(async () => {
        editor.tf.insertText('b', { at: { path: [0, 0], offset: 244 + i } });
        await vi.advanceTimersByTimeAsync(20);
      });
    }

    expect(getByText('244 characters')).not.toHaveStyle({ color: tokens.red600 });
    expect(recount).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(279);
    });
    expect(recount).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(recount).toHaveBeenCalledTimes(1);
    expect(getByText('274 characters')).toHaveStyle({ color: tokens.red600 });
  });

  it('does not recount for selection-only changes', async () => {
    const { editor, getByText } = renderCounter('abc');
    const recount = vi.spyOn(charCounterUtils, 'getTextContent');

    for (let offset = 0; offset <= 3; offset++) {
      await act(async () => editor.tf.select({ path: [0, 0], offset }));
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(recount).not.toHaveBeenCalled();
    expect(getByText('3 characters')).toBeInTheDocument();
  });

  it('updates the delayed count without rendering or changing editor content', async () => {
    const { editor, container, getByText, onContentRender } = renderCounter('abc');

    await act(async () => {
      editor.tf.select({ path: [0, 0], offset: 3 });
      editor.tf.insertText('d');
    });
    expect(getByText('3 characters')).toBeInTheDocument();

    const content = container.querySelector('[data-slate-editor]')!;
    const html = content.innerHTML;
    const value = editor.children;
    const selection = editor.selection;
    onContentRender.mockClear();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(getByText('4 characters')).toBeInTheDocument();
    expect(onContentRender).not.toHaveBeenCalled();
    expect(editor.children).toBe(value);
    expect(editor.selection).toBe(selection);
    expect(content.innerHTML).toBe(html);
  });

  it('renders the constraints without a counter plugin', () => {
    const editor = createPlateEditor({
      value: [{ type: BLOCKS.PARAGRAPH, children: [{ text: 'abc' }] }],
      plugins: [createParagraphPlugin()],
    });
    const { queryByText } = render(
      <Plate editor={editor}>
        <SdkProvider sdk={sdk}>
          <CharConstraints />
        </SdkProvider>
      </Plate>,
    );

    expect(queryByText('3 characters')).not.toBeInTheDocument();
  });
});
