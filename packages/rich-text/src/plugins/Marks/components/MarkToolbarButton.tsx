import * as React from 'react';

import { MARKS } from '@contentful/rich-text-types';
import { isMarkActive, toggleMark } from '@udecode/plate-core';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';

export interface MarkOptions {
  mark: MARKS;
  title: string;
  icon: React.ReactElement;
}

export const createMarkToolbarButton = ({ mark, title, icon }: MarkOptions) => {
  const Mark = ({ isDisabled }: { isDisabled?: boolean }) => {
    const editor = useContentfulEditor();

    const handleClick = React.useCallback(() => {
      if (!editor?.selection) return;

      toggleMark(editor, { key: mark });
      focus(editor);
    }, [editor]);

    if (!editor) return null;

    return (
      <ToolbarButton
        title={title}
        testId={`${mark}-toolbar-button`}
        onClick={handleClick}
        isActive={isMarkActive(editor, mark)}
        isDisabled={isDisabled}>
        {icon}
      </ToolbarButton>
    );
  };

  Mark.displayName = mark;

  return Mark;
};
