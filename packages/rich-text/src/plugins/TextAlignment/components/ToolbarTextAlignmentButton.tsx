import * as React from 'react';
import {
    AiOutlineAlignLeft,
    AiOutlineAlignCenter,
    AiOutlineAlignRight
} from 'react-icons/ai';

import { ALIGNMENT } from '../types';
import { useSdkContext } from '../../../SdkProvider';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { isNodeTypeEnabled } from '../../../helpers/validations';
import { Alignment, KEY_ALIGN, setAlign as nativeSetAlign } from '@udecode/plate-alignment';
import { setAlign } from '../transforms/setAlign';
import { isTextAlignmentTypeActive } from '../helpers';

export interface ToolbarTextAlignmentButtonProps {

    isDisabled?: boolean;
  }

export function ToolbarTextAlignmentButton(props: ToolbarTextAlignmentButtonProps) {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();

  function handleClick(type: ALIGNMENT): () => void {
    return () => {
      if (!editor?.selection) return;
      console.log({type})

      // TODO: following function not working properly
      nativeSetAlign(editor, { value: type })
      // setAlign(editor, { value: type })

      focus(editor);
    }
  }

  if (!editor) return null;

  return (
    <React.Fragment>
      {isNodeTypeEnabled(sdk.field, ALIGNMENT.LEFT) && (
        <ToolbarButton
          title="Text Align Left"
          testId="tal-toolbar-button"
          onClick={handleClick(ALIGNMENT.LEFT)}
          isActive={isTextAlignmentTypeActive(editor, ALIGNMENT.LEFT)}
          isDisabled={props.isDisabled}
        >
          <AiOutlineAlignLeft size={17} />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, ALIGNMENT.CENTER) && (
        <ToolbarButton
          title="Text Align Center"
          testId="tac-toolbar-button"
          onClick={handleClick(ALIGNMENT.CENTER)}
          isActive={isTextAlignmentTypeActive(editor, ALIGNMENT.CENTER)}
          isDisabled={props.isDisabled}
        >
          <AiOutlineAlignCenter size={17} />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, ALIGNMENT.RIGHT) && (
        <ToolbarButton
          title="Text Align Right"
          testId="tar-toolbar-button"
          onClick={handleClick(ALIGNMENT.RIGHT)}
          isActive={isTextAlignmentTypeActive(editor, ALIGNMENT.RIGHT)}
          isDisabled={props.isDisabled}
        >
          <AiOutlineAlignRight size={17} />
        </ToolbarButton>
      )}
    </React.Fragment>
  )
}