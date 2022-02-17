import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { NodeMatch, PlateEditor, getNodes } from '@udecode/plate-core';
import { Path } from 'slate';

import { CustomElement } from '../types';

function extractNodes(editor: PlateEditor, path: Path, match: NodeMatch) {
  return Array.from(
    getNodes(editor, {
      match,
      at: path,
      mode: 'lowest',
    })
  ).map(([node]) => node as CustomElement);
}

/**
 * It filters out all paragraphs and headings from a path and convert them into paragraphs.
 */
export function extractParagraphs(editor: PlateEditor, path: Path): CustomElement[] {
  return extractNodes(editor, path, {
    type: TEXT_CONTAINERS,
  }).map((node) => ({
    ...node,
    type: BLOCKS.PARAGRAPH,
  }));
}
