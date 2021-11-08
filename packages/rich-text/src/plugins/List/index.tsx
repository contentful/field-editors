import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { createListPlugin as createPlateListPlugin } from '@udecode/plate-list';
import { BLOCKS, LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { ListBulletedIcon, ListNumberedIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { ELEMENT_LI, ELEMENT_UL, ELEMENT_OL, toggleList, ELEMENT_LIC } from '@udecode/plate-list';
import { isBlockSelected, unwrapFromRoot, shouldUnwrapBlockquote } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { CustomSlatePluginOptions } from '../../types';
import tokens from '@contentful/f36-tokens';
import { useSdkContext } from '../../SdkProvider';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

interface ToolbarListButtonProps {
  isDisabled?: boolean;
}

export function ToolbarListButton(props: ToolbarListButtonProps) {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();

  function handleClick(type: BLOCKS): (event: React.MouseEvent<HTMLButtonElement>) => void {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

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

export const createListPlugin = () =>
  createPlateListPlugin({
    validLiChildrenTypes: LIST_ITEM_BLOCKS,
  });
