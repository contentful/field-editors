import { createEditor as createSlateEditor } from '@udecode/plate-test-utils';
import { describe, expect, it } from 'vitest';

import { select } from '../transforms';
import { setEditorValue } from '../transforms';
import { PlateEditor, Element } from '../types';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  data: {},
  isVoid: false,
  children: [{ text }],
});

const createEditor = (children: Element[]) =>
  createSlateEditor('test-editor', {}, children) as PlateEditor;

describe('setEditorValue', () => {
  it('preserves cursor position when incoming value has the same structure', () => {
    const initial = [paragraph('hello world')];
    const editor = createEditor(initial);

    // Place cursor at offset 5 (after "hello")
    select(editor, { path: [0, 0], offset: 5 });
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    // Incoming value is identical content (simulates autosave round-trip)
    const incoming = [paragraph('hello world')];
    setEditorValue(editor, incoming);

    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('clamps cursor to end when incoming value is shorter than current selection', () => {
    const initial = [paragraph('hello world')];
    const editor = createEditor(initial);

    // Place cursor at offset 11 (end of "hello world")
    select(editor, { path: [0, 0], offset: 11 });

    // Incoming value is shorter — cursor path/offset is now out of bounds
    const incoming = [paragraph('hi')];
    setEditorValue(editor, incoming);

    // Should clamp to end of "hi" (offset 2), not crash or jump arbitrarily
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('moves cursor to end when there is no prior selection', () => {
    const initial = [paragraph('hello')];
    const editor = createEditor(initial);
    // No explicit selection set — editor.selection is null

    const incoming = [paragraph('hello')];
    setEditorValue(editor, incoming);

    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
  });
});
