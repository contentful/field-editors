import { BLOCKS } from '@contentful/rich-text-types';
import { createEditor as createSlateEditor } from '@udecode/plate-test-utils';

import { PlateEditor } from '../../../internal/types';
import { selectEntityAndInsert } from '../EmbeddedBlockUtil';

jest.mock('../../../helpers/editor', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../../helpers/editor'),
    focus: jest.fn(),
  };
});

describe('EmbeddedBlockUtil selectEntityAndInsert', () => {
  it('inserts an embedded entry block for newly created entries from an empty paragraph', async () => {
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

    const sdk: any = {
      field: { locale: 'en-US', validations: [] },
      dialogs: {
        selectSingleEntry: jest.fn(async () => ({ sys: { id: 'entry-1', type: 'Entry' } })),
      },
      navigator: {
        onSlideInNavigation: jest.fn(() => () => {}),
      },
    };

    const logAction = jest.fn();

    await selectEntityAndInsert(BLOCKS.EMBEDDED_ENTRY, sdk, editor, logAction);

    expect(editor.children.some((n: any) => n.type === BLOCKS.EMBEDDED_ENTRY)).toBe(true);
    expect(editor.children.some((n: any) => n.type === BLOCKS.PARAGRAPH)).toBe(true);
  });

  it('inserts an embedded entry block when selection is inside a nested list item paragraph', async () => {
    const editor = createSlateEditor('test-editor', {}, [
      {
        type: BLOCKS.UL_LIST,
        data: {},
        isVoid: false,
        children: [
          {
            type: BLOCKS.LIST_ITEM,
            data: {},
            isVoid: false,
            children: [
              {
                type: BLOCKS.PARAGRAPH,
                data: {},
                isVoid: false,
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    ]) as PlateEditor;

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    const sdk: any = {
      field: { locale: 'en-US', validations: [] },
      dialogs: {
        selectSingleEntry: jest.fn(async () => ({ sys: { id: 'entry-1', type: 'Entry' } })),
      },
      navigator: {
        onSlideInNavigation: jest.fn(() => () => {}),
      },
    };

    const logAction = jest.fn();

    await selectEntityAndInsert(BLOCKS.EMBEDDED_ENTRY, sdk, editor, logAction);

    const containsType = (node: any, type: string): boolean => {
      if (!node) return false;
      if (node.type === type) return true;
      if (Array.isArray(node.children))
        return node.children.some((c: any) => containsType(c, type));
      return false;
    };

    expect(editor.children.some((n: any) => containsType(n, BLOCKS.EMBEDDED_ENTRY))).toBe(true);
  });
});
