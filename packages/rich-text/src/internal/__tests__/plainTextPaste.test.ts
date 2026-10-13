import { BLOCKS } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';

import { createTestEditor } from '../../test-utils';
import { PlateEditor } from '../types';

// Stop a broken normalization loop before it can exhaust the test worker's memory.
const guardAgainstTextGrowth = (editor: PlateEditor) => {
  const { apply } = editor;
  editor.apply = (operation) => {
    if (operation.type === 'insert_text' && operation.text.length > 4096) {
      throw new Error('Normalization repeatedly inserted text instead of replacing it');
    }
    apply(operation);
  };
};

describe('plain-text paste with the full plugin set', () => {
  it.each<[string, string, string[]]>([
    ['Windows line endings', 'First\r\nSecond', ['First\nSecond']],
    ['Windows blank lines', 'First\r\n\r\nSecond', ['First\n\nSecond']],
    ['carriage returns', 'First\rSecond', ['FirstSecond']],
    ['Unix line endings', 'First\nSecond', ['First\nSecond']],
    ['Unix blank lines', 'First\n\nSecond', ['First', 'Second']],
    ['single-line text', 'First Second', ['First Second']],
  ])('pastes %s without duplicating text', (_description, text, paragraphs) => {
    const { editor } = createTestEditor({});
    editor.children = [{ type: BLOCKS.PARAGRAPH, children: [{ text: '' }] }];
    editor.tf.select({ path: [0, 0], offset: 0 });
    guardAgainstTextGrowth(editor);

    editor.insertData({
      types: ['text/plain'],
      files: [],
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    } as unknown as DataTransfer);

    expect(editor.children.map((node) => node.children)).toEqual(
      paragraphs.map((text) => [{ text }]),
    );
    expect(editor.children.every((node) => node.type === BLOCKS.PARAGRAPH)).toBe(true);
  });

  it('cleans an existing text node without inserting into the selected paragraph', () => {
    const { editor, normalize } = createTestEditor({});
    editor.children = [
      { type: BLOCKS.PARAGRAPH, children: [{ text: 'First\r\nSecond', bold: true }] },
      { type: BLOCKS.PARAGRAPH, children: [{ text: 'Keep this paragraph' }] },
    ];
    editor.tf.select({ path: [1, 0], offset: 4 });
    guardAgainstTextGrowth(editor);

    normalize();

    expect(editor.children.map((node) => node.children)).toEqual([
      [{ text: 'First\nSecond', bold: true }],
      [{ text: 'Keep this paragraph' }],
    ]);
  });
});

it('inserts text at an explicit location instead of the caret', () => {
  const { editor } = createTestEditor({});
  editor.children = [
    { type: BLOCKS.PARAGRAPH, children: [{ text: 'aaa' }] },
    { type: BLOCKS.PARAGRAPH, children: [{ text: 'bbb' }] },
  ];
  editor.tf.select({ path: [1, 0], offset: 1 });

  editor.tf.insertText('X', { at: { path: [0, 0], offset: 0 } });

  expect(editor.children.map((node) => node.children)).toEqual([
    [{ text: 'Xaaa' }],
    [{ text: 'bbb' }],
  ]);
});
