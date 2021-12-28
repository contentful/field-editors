import { Transforms, Element, Editor } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-core';
import { CustomElement } from '../../types';
import { isBlockSelected } from '../../helpers/editor';

const LIST_TYPES: BLOCKS[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

export function toggleBlock(editor, type: string): void {
  const isActive = isBlockSelected(editor, type);
  const isList = LIST_TYPES.includes(type as BLOCKS);
  const isQuote = type === BLOCKS.QUOTE;

  Transforms.unwrapNodes(editor, {
    match: (node) => {
      if (Editor.isEditor(node) || !Element.isElement(node)) {
        return false;
      }

      // Lists
      if (isList && LIST_TYPES.includes((node as CustomElement).type as BLOCKS)) {
        return true;
      }

      // Quotes
      if (isQuote && (node as CustomElement).type === BLOCKS.QUOTE) {
        return true;
      }

      return false;
    },
    split: true,
  });

  const newProperties: Partial<CustomElement> = {
    type: isActive
      ? BLOCKS.PARAGRAPH
      : isList
      ? BLOCKS.LIST_ITEM
      : isQuote
      ? BLOCKS.PARAGRAPH
      : type,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && (isList || isQuote)) {
    const block = {
      type,
      data: {},
      children: [],
    };
    Transforms.wrapNodes(editor, block);
  }
}

export const createBlockQuote = (editor: PlateEditor) => {
  if (!editor.selection) return;

  toggleBlock(editor, BLOCKS.QUOTE);
};
