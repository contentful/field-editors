import * as React from 'react';

import { TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon } from '@contentful/f36-icons';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { TextAlignment, setAlignment, isAlignmentActive } from '../alignment';

export interface ToolbarAlignmentButtonsProps {
  isDisabled?: boolean;
}

export function ToolbarAlignmentButtons(props: ToolbarAlignmentButtonsProps) {
  const editor = useContentfulEditor();

  function handleClick(alignment: TextAlignment): () => void {
    return () => {
      if (!editor?.selection) return;

      setAlignment(editor, alignment);
      focus(editor);
    };
  }

  if (!editor) return null;

  return (
    <React.Fragment>
      <ToolbarButton
        title="Align Left"
        testId="align-left-toolbar-button"
        onClick={handleClick('left')}
        isActive={isAlignmentActive(editor, 'left')}
        isDisabled={props.isDisabled}
      >
        <TextAlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        title="Align Center"
        testId="align-center-toolbar-button"
        onClick={handleClick('center')}
        isActive={isAlignmentActive(editor, 'center')}
        isDisabled={props.isDisabled}
      >
        <TextAlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton
        title="Align Right"
        testId="align-right-toolbar-button"
        onClick={handleClick('right')}
        isActive={isAlignmentActive(editor, 'right')}
        isDisabled={props.isDisabled}
      >
        <TextAlignRightIcon />
      </ToolbarButton>
    </React.Fragment>
  );
}
