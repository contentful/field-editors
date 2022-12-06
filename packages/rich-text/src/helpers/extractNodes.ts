import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { ENodeMatch, ENode, getNodeEntries, TEditor, Value } from '@udecode/plate-core';
import { Path } from 'slate';

import { CustomElement, RichTextEditor } from '../types';

function extractNodes(editor: TEditor<Value>, path: Path, match: ENodeMatch<ENode<Value>>) {
  return Array.from(
    getNodeEntries(editor, {
      match,
      at: path,
      mode: 'lowest',
    })
  ).map(([node]) => node as CustomElement);
}

/**
 * It filters out all paragraphs and headings from a path and convert them into paragraphs.
 */
export function extractParagraphs(editor: RichTextEditor, path: Path): CustomElement[] {
  return extractNodes(editor, path, {
    type: TEXT_CONTAINERS,
  }).map((node) => ({
    ...node,
    type: BLOCKS.PARAGRAPH,
  }));
}
