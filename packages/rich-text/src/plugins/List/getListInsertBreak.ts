import {
  ELEMENT_DEFAULT,
  getAbove,
  getParent,
  getPluginType,
  insertNodes,
  isBlockAboveEmpty,
  isBlockTextEmptyAfterSelection,
  mockPlugin,
  PlateEditor,
  TElement,
  wrapNodes,
} from '@udecode/plate-core';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  getListItemEntry,
  moveListItemUp,
  unwrapList,
} from '@udecode/plate-list';
import { onKeyDownResetNode, ResetNodePlugin, SIMULATE_BACKSPACE } from '@udecode/plate-reset-node';
import { Editor, Path, Range, Transforms } from 'slate';

/**
 * Insert list item if selection in li>p.
 */
export const insertListItem = (editor: PlateEditor): boolean => {
  const liType = getPluginType(editor, ELEMENT_LI);
  const licType = getPluginType(editor, ELEMENT_LIC);

  if (!editor.selection) {
    return false;
  }

  const licEntry = getAbove(editor, { match: { type: licType } });
  if (!licEntry) return false;
  const [, paragraphPath] = licEntry;

  const listItemEntry = getParent(editor, paragraphPath);
  if (!listItemEntry) return false;
  const [listItemNode, listItemPath] = listItemEntry;

  if (listItemNode.type !== liType) return false;

  let success = false;

  Editor.withoutNormalizing(editor, () => {
    if (!Range.isCollapsed(editor.selection!)) {
      Transforms.delete(editor);
    }

    const isStart = Editor.isStart(editor, editor.selection!.focus, paragraphPath);
    const isEnd = isBlockTextEmptyAfterSelection(editor);

    const nextParagraphPath = Path.next(paragraphPath);
    const nextListItemPath = Path.next(listItemPath);

    /**
     * If start, insert a list item before
     */
    if (isStart) {
      console.log('isStart');
      insertNodes<TElement>(
        editor,
        {
          type: liType,
          children: [{ type: licType, children: [{ text: '' }], data: {} }],
          data: {},
        },
        { at: listItemPath }
      );

      success = true;

      return;
    }

    /**
     * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
     */
    if (!isEnd) {
      console.log('isEnd');
      Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor);
        wrapNodes(
          editor,
          {
            type: liType,
            children: [],
            data: {},
          },
          { at: nextParagraphPath }
        );
        Transforms.moveNodes(editor, {
          at: nextParagraphPath,
          to: nextListItemPath,
        });
        Transforms.select(editor, nextListItemPath);
        Transforms.collapse(editor, {
          edge: 'start',
        });
      });
    } else {
      console.log('neither isStart nor !isEnd');
      /**
       * If end, insert a list item after and select it
       */
      const marks = Editor.marks(editor) || {};
      insertNodes<TElement>(
        editor,
        {
          type: liType,
          children: [{ type: licType, children: [{ text: '', ...marks }], data: {} }],
          data: {},
        },
        { at: nextListItemPath }
      );
      Transforms.select(editor, nextListItemPath);
    }

    /**
     * If there is a list in the list item, move it to the next list item
     */
    if (listItemNode.children.length > 1) {
      console.log('if (listItemNode.children.length > 1) {');
      Transforms.moveNodes(editor, {
        at: nextParagraphPath,
        to: nextListItemPath.concat(1),
      });
    }

    success = true;
  });

  return success;
};

export const getListInsertBreak = (editor: PlateEditor) => {
  if (!editor.selection) return;

  const res = getListItemEntry(editor, {});
  let moved: boolean | undefined;

  // If selection is in a li
  if (res) {
    const { list, listItem } = res;

    // If selected li is empty, move it up.
    if (isBlockAboveEmpty(editor)) {
      moved = moveListItemUp(editor, {
        list,
        listItem,
      });

      if (moved) return true;
    }
  }

  const didReset = onKeyDownResetNode(
    editor,
    mockPlugin<ResetNodePlugin>({
      options: {
        rules: [
          {
            types: [getPluginType(editor, ELEMENT_LI)],
            defaultType: getPluginType(editor, ELEMENT_DEFAULT),
            predicate: () => !moved && isBlockAboveEmpty(editor),
            onReset: (_editor) => unwrapList(_editor as PlateEditor),
          },
        ],
      },
    })
  )(SIMULATE_BACKSPACE as any);
  if (didReset) return true;

  /**
   * If selection is in li > p, insert li.
   */
  if (!moved) {
    const inserted = insertListItem(editor);
    if (inserted) return true;
  }
};
