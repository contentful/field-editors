import * as React from 'react';
import * as Slate from 'slate-react';
import { Element, Text, Node, Transforms, Editor, NodeEntry, Path } from 'slate';
import { css } from 'emotion';
import { WithOverride, PlateEditor } from '@udecode/plate-core';
import { getParent, getAbove } from '@udecode/plate-core';
import {
  createListPlugin as createPlateListPlugin,
  withList,
  ELEMENT_LI,
  ELEMENT_UL,
  ELEMENT_OL,
  toggleList,
  ELEMENT_LIC,
} from '@udecode/plate-list';
import { BLOCKS, INLINES, LIST_ITEM_BLOCKS, TopLevelBlockEnum } from '@contentful/rich-text-types';
import { ListBulletedIcon, ListNumberedIcon } from '@contentful/f36-icons';

import { ToolbarButton } from '../shared/ToolbarButton';
import {
  isBlockSelected,
  unwrapFromRoot,
  shouldUnwrapBlockquote,
  extractParagraphsAt,
  replaceNode,
} from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import {
  CustomElement,
  CustomSlatePluginOptions,
  TextElement,
  TextOrCustomElement,
} from '../../types';
import tokens from '@contentful/f36-tokens';
import { useSdkContext } from '../../SdkProvider';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { getListInsertFragment } from './getListInsertFragment';

interface ToolbarListButtonProps {
  isDisabled?: boolean;
}

export function ToolbarListButton(props: ToolbarListButtonProps) {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();

  function handleClick(type: BLOCKS): () => void {
    return () => {
      if (!editor?.selection) return;

      if (shouldUnwrapBlockquote(editor, type)) {
        unwrapFromRoot(editor);
      }

      toggleList(editor, { type });

      Slate.ReactEditor.focus(editor);
    };
  }

  if (!editor) return null;

  return (
    <React.Fragment>
      {isNodeTypeEnabled(sdk.field, BLOCKS.UL_LIST) && (
        <ToolbarButton
          title="UL"
          testId="ul-toolbar-button"
          onClick={handleClick(BLOCKS.UL_LIST)}
          isActive={isBlockSelected(editor, BLOCKS.UL_LIST)}
          isDisabled={props.isDisabled}>
          <ListBulletedIcon />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, BLOCKS.OL_LIST) && (
        <ToolbarButton
          title="OL"
          testId="ol-toolbar-button"
          onClick={handleClick(BLOCKS.OL_LIST)}
          isActive={isBlockSelected(editor, BLOCKS.OL_LIST)}
          isDisabled={props.isDisabled}>
          <ListNumberedIcon />
        </ToolbarButton>
      )}
    </React.Fragment>
  );
}

const listStyles = `
  padding: 0;
  margin: 0 0 1.25rem 1.25rem;
  div:first-child {
    margin: 0;
    line-height: ${tokens.lineHeightDefault};
  }
`;

const styles = {
  [BLOCKS.UL_LIST]: css`
    ${listStyles}
    list-style-type: disc;
    ul {
      list-style-type: circle;
      ul {
        list-style-type: square;
      }
    }
  `,
  [BLOCKS.OL_LIST]: css`
    ${listStyles}
    list-style-type: decimal;
    ol {
      list-style-type: upper-alpha;
      ol {
        list-style-type: lower-roman;
        ol {
          list-style-type: lower-alpha;
        }
      }
    }
  `,
  [BLOCKS.LIST_ITEM]: css`
    margin: 0;
    list-style: inherit;
    ol,
    ul {
      margin: 0 0 0 ${tokens.spacingL};
    }
  `,
};

export function createList(Tag, block: BLOCKS) {
  return function List(props: Slate.RenderElementProps) {
    return (
      <Tag {...props.attributes} className={styles[block]}>
        {props.children}
      </Tag>
    );
  };
}

export const UL = createList('ul', BLOCKS.UL_LIST);
export const OL = createList('ol', BLOCKS.OL_LIST);
export const LI = createList('li', BLOCKS.LIST_ITEM);

export const withListOptions: CustomSlatePluginOptions = {
  // ELEMENT_LIC is a child of li, slatejs does ul > li > lic + ul
  [ELEMENT_LIC]: {
    type: BLOCKS.PARAGRAPH,
  },
  [ELEMENT_LI]: {
    type: BLOCKS.LIST_ITEM,
    component: LI,
  },
  [ELEMENT_UL]: {
    type: BLOCKS.UL_LIST,
    component: UL,
  },
  [ELEMENT_OL]: {
    type: BLOCKS.OL_LIST,
    component: OL,
  },
};

const emptyNodeOfType = (type) => ({ type, children: [], data: {} });

const isList = (node: CustomElement) =>
  [BLOCKS.OL_LIST, BLOCKS.UL_LIST].includes(node.type as BLOCKS);

const isListItem = (node: CustomElement) => node.type === BLOCKS.LIST_ITEM;

const hasListAsDirectParent = (editor: Editor, path: Path) => {
  const [parentNode] = (getParent(editor, path) || []) as NodeEntry;
  return isList(parentNode as CustomElement);
};

const isValidInsideListItem = (node: TextOrCustomElement) =>
  Text.isText(node as TextElement) ||
  (LIST_ITEM_BLOCKS as Array<TopLevelBlockEnum | INLINES>)
    .concat(Object.values(INLINES))
    .includes((node as CustomElement).type as TopLevelBlockEnum);

const replaceInvalidListItemWithText = (editor: PlateEditor, path: Path) => {
  const textFromEntry = extractParagraphsAt(editor, path);
  replaceNode(editor, path, textFromEntry);
};

/**
 * Ensures each list item follows the list schema.
 * Returns true if the list needed to have been normalized.
 */
const normalizeList = (editor: PlateEditor, path: Path): boolean => {
  for (const [child, childPath] of Node.children(editor, path)) {
    if (Element.isElement(child) && !isListItem(child)) {
      Transforms.wrapNodes(editor, emptyNodeOfType(BLOCKS.LIST_ITEM), { at: childPath });
      return true;
    }
  }
  return false;
};

const getNearestListAncestor = (editor: PlateEditor, path: Path) => {
  return getAbove(editor, { at: path, mode: 'lowest', match: isList }) || [];
};

/**
 * Places orphaned list items in a list. If there's a list somewhere
 * in the node's ancestors, defaults to that list type, else places
 * the list item in an unordered list.
 */
const normalizeOrphanedListItem = (editor: PlateEditor, path: Path) => {
  const [parentList] = getNearestListAncestor(editor, path);
  const parentListType = parentList?.type;
  Transforms.wrapNodes(
    editor,
    { type: parentListType || BLOCKS.UL_LIST, children: [], data: {} },
    { at: path }
  );
};

const withCustomList = (options): WithOverride => {
  const withDefaultOverrides = withList(options);

  return (editor) => {
    const { insertFragment } = editor;

    withDefaultOverrides(editor);

    // Reverts any overrides to insertFragment
    editor.insertFragment = insertFragment;

    // Use our custom getListInsertFragment
    editor.insertFragment = getListInsertFragment(editor);

    const { normalizeNode } = editor;
    editor.normalizeNode = (entry) => {
      const [node, path] = entry;

      if (isList(node as CustomElement)) {
        if (normalizeList(editor, path)) {
          return;
        }
      } else if (isListItem(node as CustomElement)) {
        if (!hasListAsDirectParent(editor, path)) {
          normalizeOrphanedListItem(editor, path);
          return;
        }

        const listItemChildren = Array.from(Node.children(editor, path));

        // Handle list items with no paragraph/text
        if (listItemChildren.length === 0) {
          Transforms.insertNodes(
            editor,
            [{ type: BLOCKS.PARAGRAPH, data: {}, children: [{ text: '' }] }],
            {
              at: path.concat([0]),
            }
          );
          return;
        }

        for (const [child, childPath] of listItemChildren) {
          if (Element.isElement(child) && !isValidInsideListItem(child)) {
            replaceInvalidListItemWithText(editor, childPath);
            return;
          }
        }
      }

      normalizeNode(entry);
    };

    return editor;
  };
};

export const createListPlugin = () => {
  const options = {
    validLiChildrenTypes: LIST_ITEM_BLOCKS,
  };

  const plugin = createPlateListPlugin(options);

  plugin.withOverrides = withCustomList(options);

  return plugin;
};
