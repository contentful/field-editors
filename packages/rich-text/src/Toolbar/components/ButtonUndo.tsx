import React from 'react';

import { ArrowArcLeftIcon } from '@contentful/f36-icons';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { ToolbarButton } from '../../plugins/shared/ToolbarButton';

export const ButtonUndo = () => {
  const editor = useContentfulEditor();

  const onClickHandler = () => {
    editor.undo('toolbar');
  };

  return (
    <ToolbarButton
      title="Undo"
      testId="undo-toolbar-button"
      onClick={onClickHandler}
      isActive={false}
      isDisabled={editor.history.undos.length === 0}
    >
      <ArrowArcLeftIcon />
    </ToolbarButton>
  );
};
