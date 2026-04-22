import React from 'react';

import { ArrowUUpRightIcon } from '@contentful/f36-icons';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { ToolbarButton } from '../../plugins/shared/ToolbarButton';

export const ButtonRedo = () => {
  const editor = useContentfulEditor();

  const onClickHandler = () => {
    editor.redo('toolbar');
  };

  return (
    <ToolbarButton
      title="Redo"
      testId="redo-toolbar-button"
      onClick={onClickHandler}
      isActive={false}
      isDisabled={editor.history.redos.length === 0}
    >
      <ArrowUUpRightIcon aria-label="Redo" />
    </ToolbarButton>
  );
};
