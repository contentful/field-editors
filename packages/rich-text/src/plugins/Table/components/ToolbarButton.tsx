import * as React from 'react';

import { TableIcon } from '@contentful/f36-icons';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { insertTableAndFocusFirstCell, isTableActive } from './../helpers';

export interface ToolbarTableButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarTableButton(props: ToolbarTableButtonProps) {
  const editor = useContentfulEditor();
  const isActive = editor && isTableActive(editor);

  async function handleClick() {
    if (!editor) return;

    editor.tracking.onToolbarAction('insertTable');
    insertTableAndFocusFirstCell(editor);
    focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Table"
      testId="table-toolbar-button"
      onClick={handleClick}
      // TODO: active state looks off since the button will be disabled. Do we still need it?
      isActive={!!isActive}
      isDisabled={props.isDisabled}
    >
      <TableIcon />
    </ToolbarButton>
  );
}
