import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { BLOCKS } from '@contentful/rich-text-types';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import {
  ELEMENT_LI,
  ELEMENT_UL,
  ELEMENT_OL,
  toggleList,
  ELEMENT_LIC,
} from '@udecode/slate-plugins-list';
import { useStoreEditor } from '@udecode/slate-plugins-core';
import { isBlockSelected, unwrapFromRoot, shouldUnwrapBlockquote } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { CustomSlatePluginOptions } from 'types';
import tokens from '@contentful/forma-36-tokens';
import { useSdkContext } from '../../SdkProvider';

interface ToolbarListButtonProps {
  isDisabled?: boolean;
}

export function ToolbarListButton(props: ToolbarListButtonProps) {
  const sdk = useSdkContext();
  const editor = useStoreEditor();

  function handleClick(type: BLOCKS): void {
    if (!editor?.selection) return;

    if (shouldUnwrapBlockquote(editor, type)) {
      unwrapFromRoot(editor);
    }

    toggleList(editor, { type });

    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <React.Fragment>
      {isNodeTypeEnabled(sdk.field, BLOCKS.UL_LIST) && (
        <EditorToolbarButton
          icon="ListBulleted"
          tooltip="UL"
          tooltipPlace="bottom"
          label="UL"
          testId="ul-toolbar-button"
          onClick={() => handleClick(BLOCKS.UL_LIST)}
          isActive={isBlockSelected(editor, BLOCKS.UL_LIST)}
          disabled={props.isDisabled}
        />
      )}
      {isNodeTypeEnabled(sdk.field, BLOCKS.OL_LIST) && (
        <EditorToolbarButton
          icon="ListNumbered"
          tooltip="OL"
          tooltipPlace="bottom"
          label="OL"
          testId="ol-toolbar-button"
          onClick={() => handleClick(BLOCKS.OL_LIST)}
          isActive={isBlockSelected(editor, BLOCKS.OL_LIST)}
          disabled={props.isDisabled}
        />
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
