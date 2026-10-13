import React from 'react';

import { ArrowUUpLeftIcon } from '@contentful/f36-icons';
import { useEditorSelector } from 'platejs/react';

import { useContentfulEditorRef } from '../../ContentfulEditorProvider';
import { PlateEditor } from '../../internal/types';
import { ToolbarButton } from '../../plugins/shared/ToolbarButton';

export const ButtonUndo = () => {
  const editor = useContentfulEditorRef();
  const isDisabled = useEditorSelector(
    (editor: PlateEditor) => editor.history.undos.length === 0,
    [],
  );

  const onClickHandler = () => {
    editor.undo('toolbar');
  };

  return (
    <ToolbarButton
      title="Undo"
      testId="undo-toolbar-button"
      onClick={onClickHandler}
      isActive={false}
      isDisabled={isDisabled}>
      <ArrowUUpLeftIcon aria-label="Undo" />
    </ToolbarButton>
  );
};
