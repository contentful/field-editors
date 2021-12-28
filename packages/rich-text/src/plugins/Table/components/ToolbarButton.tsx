import * as React from 'react';
import * as Slate from 'slate-react';
import { TableIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../../shared/ToolbarButton';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { insertTableAndFocusFirstCell, isTableActive } from './../helpers';
import { useTrackingContext } from '../../../TrackingProvider';

export interface ToolbarTableButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarTableButton(props: ToolbarTableButtonProps) {
  const editor = useContentfulEditor();
  const { onViewportAction } = useTrackingContext();
  const isActive = editor && isTableActive(editor);

  async function handleClick() {
    if (!editor) return;

    onViewportAction('insertTable');
    insertTableAndFocusFirstCell(editor);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Table"
      testId="table-toolbar-button"
      onClick={handleClick}
      // TODO: active state looks off since the button will be disabled. Do we still need it?
      isActive={isActive}
      isDisabled={props.isDisabled}>
      <TableIcon />
    </ToolbarButton>
  );
}
