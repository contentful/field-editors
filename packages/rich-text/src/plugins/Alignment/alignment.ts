import { BLOCKS } from '@contentful/rich-text-types';
import { Editor } from 'slate';

import { isElement } from '../../internal/queries';
import { setNodes } from '../../internal/transforms';
import { PlateEditor } from '../../internal/types';

export type TextAlignment = 'left' | 'center' | 'right';

// Block types that support alignment
export const ALIGNABLE_BLOCKS = [
  BLOCKS.PARAGRAPH,
  BLOCKS.HEADING_1,
  BLOCKS.HEADING_2,
  BLOCKS.HEADING_3,
  BLOCKS.HEADING_4,
  BLOCKS.HEADING_5,
  BLOCKS.HEADING_6,
  BLOCKS.QUOTE,
  BLOCKS.LIST_ITEM,
];

/**
 * Check if a block type supports alignment
 */
export function isAlignableBlock(nodeType: string): boolean {
  return ALIGNABLE_BLOCKS.includes(nodeType as BLOCKS);
}

/**
 * Get the current alignment of the selected block
 */
export function getAlignment(editor: PlateEditor): TextAlignment | null {
  if (!editor.selection) return null;

  const matches = Array.from(
    Editor.nodes(editor as any, {
      match: (n) => isElement(n) && isAlignableBlock(n.type as string),
      mode: 'lowest',
    }),
  );

  if (matches.length === 0) return null;

  const [node] = matches[0];
  if (isElement(node) && (node as any).data) {
    return ((node as any).data.align as TextAlignment) || 'left';
  }

  return 'left';
}

/**
 * Check if a specific alignment is currently active
 */
export function isAlignmentActive(editor: PlateEditor, alignment: TextAlignment): boolean {
  return getAlignment(editor) === alignment;
}

/**
 * Set the alignment for the selected block(s)
 */
export function setAlignment(editor: PlateEditor, alignment: TextAlignment): void {
  if (!editor.selection) return;

  // Find all alignable blocks in the selection
  const nodes = Array.from(
    Editor.nodes(editor as any, {
      match: (n) => isElement(n) && isAlignableBlock(n.type as string),
      mode: 'lowest',
    }),
  );

  if (nodes.length === 0) return;

  // Update each alignable block
  for (const [node, path] of nodes) {
    if (isElement(node)) {
      const nodeData = (node as any).data || {};
      const newData = {
        ...nodeData,
        align: alignment,
      };

      setNodes(editor, { data: newData } as any, { at: path });
    }
  }
}
