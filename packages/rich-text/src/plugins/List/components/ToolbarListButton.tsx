import * as React from 'react';
import * as Slate from 'slate-react';
import { toggleList } from '@udecode/plate-list';
import { BLOCKS } from '@contentful/rich-text-types';
import { ListBulletedIcon, ListNumberedIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { isBlockSelected, unwrapFromRoot, shouldUnwrapBlockquote } from '../../../helpers/editor';
import { isNodeTypeEnabled } from '../../../helpers/validations';
import { useSdkContext } from '../../../SdkProvider';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';

export interface ToolbarListButtonProps {
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
