import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';

import { Document, BLOCKS } from '@contentful/rich-text-types';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { newReferenceEditorFakeSdk } from '../__fixtures__/FakeSdk';
import { block, document as doc, text } from '../helpers/nodeFactory';
import { PlateEditor } from '../internal/types';

let editor: PlateEditor;
vi.mock('../internal/pluginAdapter', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../internal/pluginAdapter')>();
  return { ...mod, createPlateEditor: (options) => (editor = mod.createPlateEditor(options)) };
});

const { default: RichTextEditor } = await import('../RichTextEditor');
const translatedText = 'Dies ist die Übersetzung.';
const translation = doc(block(BLOCKS.PARAGRAPH, {}, text(translatedText))) as Document;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

async function mountEditor(withSelectionSync = false, initialValue?: Document) {
  const [baseSdk] = newReferenceEditorFakeSdk({ initialValue });
  const sdk = {
    ...baseSdk,
    entry: { getSys: () => ({ id: 'external-updates' }) },
    parameters: { instance: {} },
  } as unknown as typeof baseSdk;
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <RichTextEditor
        sdk={sdk}
        isInitiallyDisabled={false}
        withCharValidation={false}
        withSelectionSync={withSelectionSync}
      />,
    );
  });
  const textbox = container.querySelector('[data-slate-editor]')!;
  const save = () =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
  const receive = (value: Document) =>
    act(async () => {
      await sdk.field.setValue(structuredClone(value));
    });
  const clear = () =>
    act(async () => {
      editor.tf.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: translatedText.length },
      });
      editor.tf.deleteFragment();
    });
  return { sdk, textbox, save, receive, clear };
}

it.each([false, true])(
  'restores an identical external value after a saved clear (sync: %s)',
  async (withSelectionSync) => {
    const { sdk, textbox, save, receive, clear } = await mountEditor(withSelectionSync);
    await receive(translation);
    expect(textbox).toHaveTextContent(translatedText);
    const originalEditor = editor;

    await clear();
    await save();
    expect(sdk.field.getValue()).toBeUndefined();
    expect(textbox).not.toHaveTextContent(translatedText);

    await receive(translation);
    expect(sdk.field.getValue()).toEqual(translation);
    expect(textbox).toHaveTextContent(translatedText);
    expect(editor).toBe(originalEditor);

    const setValue = vi.spyOn(sdk.field, 'setValue');
    await save();
    expect(setValue).not.toHaveBeenCalled();
    await act(async () => {
      editor.tf.insertText('x');
    });
    await save();
    expect(textbox).toHaveTextContent(`x${translatedText}`);
    await act(async () => {
      editor.undo();
    });
    expect(textbox).toHaveTextContent(translatedText);
    await act(async () => {
      editor.redo();
    });
    expect(textbox).toHaveTextContent(`x${translatedText}`);
  },
);

it('restores initially loaded content after a saved local edit', async () => {
  const { textbox, save, receive } = await mountEditor(false, translation);
  await act(async () => {
    editor.tf.insertText('local ', { at: { path: [0, 0], offset: 0 } });
  });
  await save();
  expect(textbox).toHaveTextContent(`local ${translatedText}`);
  await receive(translation);
  expect(textbox).toHaveTextContent(translatedText);
  expect(textbox).not.toHaveTextContent('local');
});

it('cancels a pending local clear when different external content arrives', async () => {
  const { sdk, textbox, save, receive, clear } = await mountEditor(false, translation);
  await clear();
  const replacement = doc(block(BLOCKS.PARAGRAPH, {}, text('Neue Übersetzung.'))) as Document;
  await receive(replacement);
  const setValue = vi.spyOn(sdk.field, 'setValue');
  const removeValue = vi.spyOn(sdk.field, 'removeValue');
  await save();
  expect(textbox).toHaveTextContent('Neue Übersetzung.');
  expect(sdk.field.getValue()).toEqual(replacement);
  expect(setValue).not.toHaveBeenCalled();
  expect(removeValue).not.toHaveBeenCalled();
});

it('accepts content already in the editor without replacing nodes or echoing a save', async () => {
  const { sdk, save, receive } = await mountEditor(false, translation);
  const updated = doc(block(BLOCKS.PARAGRAPH, {}, text(`${translatedText} Neu.`))) as Document;
  await act(async () => {
    editor.tf.select({ path: [0, 0], offset: translatedText.length });
    editor.tf.insertText(' Neu.');
  });
  const children = editor.children;
  const selection = editor.selection;
  const apply = vi.spyOn(editor, 'apply');
  await receive(updated);
  const setValue = vi.spyOn(sdk.field, 'setValue');
  await save();
  expect(editor.children).toBe(children);
  expect(editor.selection).toEqual(selection);
  expect(apply).not.toHaveBeenCalled();
  expect(setValue).not.toHaveBeenCalled();
  expect(sdk.field.getValue()).toEqual(updated);
});

it('does not overwrite pending typing for an unchanged SDK acknowledgement', async () => {
  const { sdk, textbox, save, receive } = await mountEditor(false, translation);
  await act(async () => {
    editor.tf.insertText('local ', { at: { path: [0, 0], offset: 0 } });
  });
  await receive(translation);
  expect(textbox).toHaveTextContent(`local ${translatedText}`);
  await save();
  expect(sdk.field.getValue()).toEqual(
    doc(block(BLOCKS.PARAGRAPH, {}, text(`local ${translatedText}`))),
  );
});
