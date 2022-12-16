import { Link } from '@contentful/field-editor-reference/dist/types';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { focusEditor } from '../internal/misc';
import {
  getText,
  getNodeEntries,
  getNodeEntry,
  getNodeDescendants,
  isText,
  isRangeCollapsed as isSelectionCollapsed,
  isEditor,
  isElement,
  getPathLevels,
  isCommonPath,
} from '../internal/queries';
import {
  setNodes,
  setSelection,
  insertNodes,
  toggleNodeType,
  moveSelection,
  unwrapNodes,
  insertText,
  wrapNodes,
  deleteText,
  collapseSelection,
} from '../internal/transforms';
import {
  EditorNodesOptions,
  ToggleNodeTypeOptions,
  PlateEditor,
  Node,
  Path,
  BaseRange,
} from '../internal/types';
import { CustomElement, RichTextEditor } from '../types';
import { IS_SAFARI } from './environment';

export const LINK_TYPES: INLINES[] = [
  INLINES.HYPERLINK,
  INLINES.ENTRY_HYPERLINK,
  INLINES.ASSET_HYPERLINK,
];

const LIST_TYPES: BLOCKS[] = [BLOCKS.OL_LIST, BLOCKS.UL_LIST];

export function isBlockSelected(editor: PlateEditor, type: string): boolean {
  const [match] = Array.from(
    getNodeEntries(editor, {
      match: (node) => isElement(node) && (node as CustomElement).type === type,
    })
  );
  return !!match;
}

export function isRootLevel(path: Path): boolean {
  return path.length === 1;
}

type NodeEntry = [CustomElement, Path];
type NodeType = BLOCKS | INLINES;
export function getNodeEntryFromSelection(
  editor: PlateEditor,
  nodeTypeOrTypes: NodeType | NodeType[],
  path?: Path
): NodeEntry | [] {
  path = path ?? editor.selection?.focus.path;
  if (!path) return [];
  const nodeTypes = Array.isArray(nodeTypeOrTypes) ? nodeTypeOrTypes : [nodeTypeOrTypes];
  for (let i = 0; i < path.length; i++) {
    const nodeEntry = getNodeEntry(editor, path.slice(0, i + 1)) as NodeEntry;
    if (nodeTypes.includes(nodeEntry[0].type as NodeType)) return nodeEntry;
  }
  return [];
}

export function isNodeTypeSelected(
  editor: PlateEditor | null,
  nodeType: BLOCKS | INLINES
): boolean {
  if (!editor) return false;
  const [node] = getNodeEntryFromSelection(editor, nodeType);
  return !!node;
}

export function moveToTheNextLine(editor: RichTextEditor) {
  moveSelection(editor, { distance: 1, unit: 'line' });
}

export function moveToTheNextChar(editor: RichTextEditor) {
  moveSelection(editor, { distance: 1, unit: 'offset' });
}

export function insertEmptyParagraph(editor: RichTextEditor, options?) {
  const emptyParagraph: CustomElement = {
    type: BLOCKS.PARAGRAPH,
    children: [{ text: '' }],
    data: {},
    isVoid: false,
  };
  insertNodes(editor, emptyParagraph, options);
}

export function getElementFromCurrentSelection(editor: RichTextEditor) {
  if (!editor.selection) return [];

  return Array.from(
    getNodeEntries(editor, {
      /**
       * editor.select is a Range, which includes anchor and focus, the beginning and the end of a selection
       * when using only editor.selection.focus, we might get only the end of the selection, or where the text cursor is
       * and in some cases getting the next element instead of the one we want
       **/
      at: editor.selection,
      match: (node) => isElement(node),
    })
  ).flat();
}

export function isList(editor?: RichTextEditor) {
  if (!editor) {
    return false;
  }

  const element = getElementFromCurrentSelection(editor);

  return element.some(
    (element) =>
      isElement(element) && LIST_TYPES.includes((element as CustomElement).type as BLOCKS)
  );
}

export function getTableSize(
  table: CustomElement
): Record<'numRows' | 'numColumns', number> | null {
  const numRows = table.children.length;
  if (!numRows) return null;
  const [firstRow] = table.children;
  const numColumns = (firstRow as CustomElement).children?.length;
  return { numRows, numColumns };
}

interface InsertLinkOptions {
  text: string;
  type: INLINES.HYPERLINK | INLINES.ENTRY_HYPERLINK | INLINES.ASSET_HYPERLINK;
  url?: string;
  target?: Link;
  path?: Path;
}

// TODO: move to hyperlink plugin
export function insertLink(editor, options: InsertLinkOptions) {
  if (editor.selection) {
    wrapLink(editor, options);
  }
}

// TODO: move to hyperlink plugin
export function isLinkActive(editor?: RichTextEditor) {
  if (!editor) {
    return false;
  }

  const [link] = Array.from(
    getNodeEntries(editor, {
      match: (node) =>
        !isEditor(node) &&
        isElement(node) &&
        LINK_TYPES.includes((node as CustomElement).type as INLINES),
    })
  );
  return !!link;
}

// TODO: move to hyperlink plugin
export function unwrapLink(editor) {
  unwrapNodes(editor, {
    match: (node) =>
      !isEditor(node) &&
      isElement(node) &&
      LINK_TYPES.includes((node as CustomElement).type as INLINES),
  });
}

// TODO: move to hyperlink plugin
export function wrapLink(editor, { text, url, target, type, path }: InsertLinkOptions) {
  if (isLinkActive(editor) && !path) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && isSelectionCollapsed(selection);
  const link = {
    type,
    data: {},
    children: isCollapsed ? [{ text }] : [],
  };

  if (url) {
    link.data = { uri: url };
  }

  if (target) {
    link.data = { target };
  }

  // TODO: always set the selection to the end of the inserted link
  if (path) {
    setNodes(editor, link, { at: path });
    insertText(editor, text, { at: path });
    setSelection(editor, path as Partial<BaseRange>);
  } else if (isCollapsed) {
    insertNodes(editor, link);
  } else {
    wrapNodes(editor, link, { split: true });
    deleteText(editor);
    insertText(editor, text);
    collapseSelection(editor, { edge: 'end' });
  }
}

export function getAncestorPathFromSelection(editor: RichTextEditor) {
  if (!editor.selection) return undefined;

  return getPathLevels(editor.selection.focus.path).find((level) => level.length === 1);
}

export const isAtEndOfTextSelection = (editor: RichTextEditor) =>
  editor.selection?.focus.offset === getText(editor, editor.selection?.focus.path).length;

/**
 * This traversal strategy is unfortunately necessary because Slate doesn't
 * expose something like Node.next(editor).
 */
export function getNextNode(editor: PlateEditor): CustomElement | null {
  if (!editor.selection) {
    return null;
  }
  const descendants = getNodeDescendants(editor, { from: editor.selection.focus.path });
  // eslint-disable-next-line no-constant-condition -- TODO: explain this disable
  while (true) {
    const { done, value } = descendants.next();
    if (done) {
      return null;
    }
    const [node, path] = value as NodeEntry;
    if (isCommonPath(path, editor.selection.focus.path)) {
      continue;
    }
    return node as CustomElement;
  }
}

export const INLINE_TYPES = Object.values(INLINES) as string[];

export const isInlineOrText = (node: Node) => {
  // either text or inline elements
  return isText(node) || (isElement(node) && INLINE_TYPES.includes(node.type));
};

export const focus = (editor: RichTextEditor) => {
  const x = window.scrollX;
  const y = window.scrollY;

  focusEditor(editor);

  // Safari has issues with `editor.focus({ preventScroll: true })`, it ignores the option `preventScroll`
  if (IS_SAFARI) {
    setTimeout(function () {
      window.scrollTo(x, y); // restore position
    }, 0);
  }
};

export function toggleElement(
  editor: RichTextEditor,
  options: ToggleNodeTypeOptions,
  editorOptions?: EditorNodesOptions
) {
  toggleNodeType(editor, options, editorOptions);

  // We must reset `data` from one element to another
  setNodes(editor, { data: {} });
}
