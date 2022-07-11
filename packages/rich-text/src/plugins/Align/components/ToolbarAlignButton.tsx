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
// import { setAlign } from '../transforms/setAlign';
import { isAlignActive } from '../helpers';

export interface ToolbarTextAlignmentButtonProps {

    isDisabled?: boolean;
  }

export function ToolbarAlignButton(props: ToolbarTextAlignmentButtonProps) {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();

  function handleClick(type: ALIGNMENT): () => void {
    return () => {
      if (!editor?.selection) return;
      console.log({type})

      // TODO: following function not working properly
      // nativeSetAlign(editor, { value: type })
      nativeSetAlign(editor, { value: type })

      focus(editor);
    }
  }

  if (!editor) return null;

  return (
    <React.Fragment>
      {isNodeTypeEnabled(sdk.field, ALIGNMENT.LEFT) && (
        <ToolbarButton
          title="Align Left"
          testId="al-toolbar-button"
          onClick={handleClick(ALIGNMENT.LEFT)}
          isActive={isAlignActive(editor, ALIGNMENT.LEFT)}
          isDisabled={props.isDisabled}
        >
          <AiOutlineAlignLeft size={17} />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, ALIGNMENT.CENTER) && (
        <ToolbarButton
          title="Align Center"
          testId="ac-toolbar-button"
          onClick={handleClick(ALIGNMENT.CENTER)}
          isActive={isAlignActive(editor, ALIGNMENT.CENTER)}
          isDisabled={props.isDisabled}
        >
          <AiOutlineAlignCenter size={17} />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, ALIGNMENT.RIGHT) && (
        <ToolbarButton
          title="Align Right"
          testId="ar-toolbar-button"
          onClick={handleClick(ALIGNMENT.RIGHT)}
          isActive={isAlignActive(editor, ALIGNMENT.RIGHT)}
          isDisabled={props.isDisabled}
        >
          <AiOutlineAlignRight size={17} />
        </ToolbarButton>
      )}
    </React.Fragment>
  )
}