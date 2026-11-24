/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { createTestEditor, jsx } from '../../test-utils';
import { createDragAndDropPlugin } from './index';

const dropOn = (editor: any, ...ancestors: string[]) => {
  // Builds the DOM ancestors of the drop target, e.g. TABLE > TR > TD
  let target: HTMLElement = document.createElement('div');
  ancestors.reverse().forEach((nodeName) => {
    const parent = document.createElement(nodeName);
    parent.appendChild(target);
    target = parent;
  });
  const dropTarget = target.querySelector('div') ?? target;

  const onDrop = (createDragAndDropPlugin() as any).handlers.onDrop(editor);
  return onDrop({ nativeEvent: { target: dropTarget } });
};

describe('DragAndDrop plugin', () => {
  describe('dragging an embedded asset block', () => {
    const createEditor = () => {
      const { editor } = createTestEditor({
        input: (
          <editor>
            <hp>text</hp>
            <hembed type="Asset" id="asset-1" />
            <hp />
          </editor>
        ),
      });
      // Selects the dragged asset
      editor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      };
      return editor;
    };

    it('can be dropped in a table body cell', () => {
      expect(dropOn(createEditor(), 'TABLE', 'TBODY', 'TR', 'TD')).toBe(false);
    });

    it('cannot be dropped in a table header cell', () => {
      expect(dropOn(createEditor(), 'TABLE', 'TBODY', 'TR', 'TH')).toBe(true);
    });

    it('can be dropped outside of tables', () => {
      expect(dropOn(createEditor(), 'DIV')).toBe(false);
    });
  });

  describe('dragging other embedded blocks', () => {
    it.each([
      ['an embedded entry', () => <hembed type="Entry" id="entry-1" />],
      ['a horizontal rule', () => <hhr />],
    ])('cannot drop %s in a table, like before', (_, createNode) => {
      const { editor } = createTestEditor({
        input: (
          <editor>
            {createNode()}
            <hp />
          </editor>
        ),
      });
      // Selects the dragged node
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      expect(dropOn(editor, 'TABLE', 'TBODY', 'TR', 'TD')).toBe(true);
    });
  });

  describe('dragging an inline embedded entry', () => {
    it('can be dropped in header cells and body cells, like before', () => {
      const { editor } = createTestEditor({
        input: (
          <editor>
            <hp>
              <hinline type="Entry" id="entry-1" />
            </hp>
          </editor>
        ),
      });

      // Selects the dragged inline
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };

      expect(dropOn(editor, 'TABLE', 'TBODY', 'TR', 'TH')).toBe(false);
      expect(dropOn(editor, 'TABLE', 'TBODY', 'TR', 'TD')).toBe(false);
    });
  });
});
