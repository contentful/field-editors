import { BLOCKS } from '@contentful/rich-text-types';
import { createEditor as createSlateEditor } from '@udecode/plate-test-utils';

import { PlateEditor } from '../../../internal/types';
import { insertBlock } from './insertBlock';

jest.mock('../../../helpers/editor', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../helpers/editor'),
    focus: jest.fn(),
  };
});

describe('CommandPalette insertBlock', () => {
  it('inserts an embedded entry block even when selection is in an empty paragraph', () => {
    const editor = createSlateEditor('test-editor', {}, [
      {
        type: BLOCKS.PARAGRAPH,
        data: {},
        isVoid: false,
        children: [{ text: '' }],
      },
    ]) as PlateEditor;

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    insertBlock(editor, BLOCKS.EMBEDDED_ENTRY, {
      sys: { id: 'entry-1', type: 'Entry' },
    } as any);

    expect(editor.children.some((n: any) => n.type === BLOCKS.EMBEDDED_ENTRY)).toBe(true);
  });

  it('does not remove existing paragraph text when inserting from a non-empty paragraph', () => {
    const editor = createSlateEditor('test-editor', {}, [
      {
        type: BLOCKS.PARAGRAPH,
        data: {},
        isVoid: false,
        children: [{ text: 'hello' }],
      },
    ]) as PlateEditor;

    editor.selection = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    };

    insertBlock(editor, BLOCKS.EMBEDDED_ENTRY, {
      sys: { id: 'entry-1', type: 'Entry' },
    } as any);

    const containsText = (node: any, text: string): boolean => {
      if (!node) return false;
      if (typeof node.text === 'string') return node.text.includes(text);
      if (Array.isArray(node.children))
        return node.children.some((c: any) => containsText(c, text));
      return false;
    };

    expect(editor.children.some((n: any) => n.type === BLOCKS.EMBEDDED_ENTRY)).toBe(true);
    expect(editor.children.some((n: any) => containsText(n, 'hello'))).toBe(true);
  });
});
