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
import { isBlockSelected } from '../../helpers/editor';
import { CustomSlatePluginOptions } from 'types';

interface ToolbarListButtonProps {
  isDisabled?: boolean;
}

export function ToolbarListButton(props: ToolbarListButtonProps) {
  const editor = useStoreEditor();

  function handleClick(type: string): void {
    if (!editor?.selection) return;

    toggleList(editor, { type });

    Slate.ReactEditor.focus(editor);
  }

  return (
    <React.Fragment>
      <EditorToolbarButton
        icon="ListBulleted"
        tooltip="UL"
        label="UL"
        testId="ul-toolbar-button"
        onClick={() => handleClick(BLOCKS.UL_LIST)}
        isActive={isBlockSelected(editor, BLOCKS.UL_LIST)}
        disabled={props.isDisabled}
      />
      <EditorToolbarButton
        icon="ListNumbered"
        tooltip="OL"
        label="OL"
        testId="ol-toolbar-button"
        onClick={() => handleClick(BLOCKS.OL_LIST)}
        isActive={isBlockSelected(editor, BLOCKS.OL_LIST)}
        disabled={props.isDisabled}
      />
    </React.Fragment>
  );
}

const styles = {
  [BLOCKS.UL_LIST]: css`
    margin: 0 0 1.25rem 1.25rem;
    list-style: disc;
  `,
  [BLOCKS.OL_LIST]: css`
    margin: 0 0 1.25rem 1.25rem;
    list-style: decimal;
  `,
  [BLOCKS.LIST_ITEM]: css`
    margin: 0;
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
    // TODO: We might want to change it to our paragraph in case we develop one, otherwise we can simply use the slatejs default element
    component: Slate.DefaultElement,
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
