import React from 'react';

import { ArrowUUpRightIcon } from '@contentful/f36-icons';
import { useEditorSelector } from 'platejs/react';

import { useContentfulEditorRef } from '../../ContentfulEditorProvider';
import { PlateEditor } from '../../internal/types';
import { ToolbarButton } from '../../plugins/shared/ToolbarButton';

export const ButtonRedo = () => {
  const editor = useContentfulEditorRef();
  const isDisabled = useEditorSelector(
    (editor: PlateEditor) => editor.history.redos.length === 0,
    [],
  );

  const onClickHandler = () => {
    editor.redo('toolbar');
  };

  return (
    <ToolbarButton
      title="Redo"
      testId="redo-toolbar-button"
      onClick={onClickHandler}
      isActive={false}
      isDisabled={isDisabled}>
      <ArrowUUpRightIcon aria-label="Redo" />
    </ToolbarButton>
  );
};
