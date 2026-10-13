import { jsx as slateJsx } from '@platejs/test-utils';
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

const createEditor = (children: Element[]) => slateJsx('editor', {}, children) as PlateEditor;

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

describe('setEditorValue diffing', () => {
  const texts = (editor: PlateEditor) =>
    editor.children.map((n) => (n.children[0] as { text: string }).text);
  const cases: [string, string[], string[]][] = [
    ['changes one block', ['a', 'b', 'c'], ['a', 'x', 'c']],
    ['inserts a block', ['a', 'b'], ['a', 'x', 'b']],
    ['removes a block', ['a', 'b', 'c'], ['a', 'c']],
    ['replaces everything', ['a', 'b'], ['x', 'y', 'z']],
    ['handles repeated blocks', ['a', 'a', 'a'], ['a', 'a']],
    ['is a no-op for equal values', ['a', 'b'], ['a', 'b']],
  ];

  it.each(cases)('%s', (_, before, after) => {
    const editor = createEditor(before.map(paragraph));
    setEditorValue(editor, after.map(paragraph));
    expect(texts(editor)).toEqual(after);
  });

  it('keeps unchanged blocks and only applies operations for changed ones', () => {
    const editor = createEditor(['a', 'b', 'c', 'd'].map(paragraph));
    const [first, , , last] = editor.children;
    const ops: string[] = [];
    const { apply } = editor;
    editor.apply = (op) => {
      if (op.type !== 'set_selection') ops.push(`${op.type}:${op.path.join('.')}`);
      apply(op);
    };

    setEditorValue(editor, ['a', 'x', 'c', 'd'].map(paragraph));

    expect(ops).toEqual(['remove_node:1', 'insert_node:1']);
    expect(editor.children[0]).toBe(first);
    expect(editor.children[3]).toBe(last);
  });
});
