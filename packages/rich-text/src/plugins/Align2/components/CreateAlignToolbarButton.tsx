import * as React from 'react';

// import { Alignment } from '@udecode/plate-alignment';
import ALIGNMENT from '../types';
import { setAlign } from '@udecode/plate-alignment';
// import { setAlign } from '../transforms/setAlign';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';

export interface AlignOptions {
  align: ALIGNMENT;
  title: string;
  icon: React.ReactElement;
}

export const createAlignToolbarButton = ({ align, title, icon }: AlignOptions) => {
  const Align = ({ isDisabled }: { isDisabled?: boolean }) => {
    const editor = useContentfulEditor();

    const handleClick = React.useCallback(() => {
      if (!editor?.selection) return;
      console.log({ align });

      // TODO: add plugin active code/editor tracking
      const isActive = true;
      setAlign(editor, { value: align });
      focus(editor);
    }, [editor]);

    if (!editor) return null;

    return (
      <ToolbarButton
        title={title}
        testId={`${align}-toolbar-button`}
        onClick={handleClick}
        isActive={false}
        isDisabled={isDisabled}>
        {icon}
      </ToolbarButton>
    );
  };

  Align.displayName = align;

  return Align;
};
