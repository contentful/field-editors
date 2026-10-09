import { useEffect, useState } from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { useEditorSelector } from 'platejs/react';

import { useContentfulEditorId, useContentfulEditorRef } from '../../../ContentfulEditorProvider';
import { findNodePath, isChildPath } from '../../../internal/queries';
import { PlateEditor } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';

export function useHyperlinkCommon(element) {
  const id = useContentfulEditorId();
  const editor = useContentfulEditorRef(id);
  const sdk: FieldAppSDK = useSdkContext();
  // Subscribe to a boolean instead of the whole editor state so links only
  // re-render when their focus changes, not on every keystroke.
  const isLinkFocused = useEditorSelector(
    (editor: PlateEditor) => {
      const focus = editor.selection?.focus;
      const pathToElement = focus && findNodePath(editor, element);
      return !!pathToElement && isChildPath(focus.path, pathToElement);
    },
    [element],
    { id },
  );
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    const handleFocus = () => setIsEditorFocused(true);
    const handleBlur = () => setIsEditorFocused(false);

    const editorElement = document.getElementById(editor.id);

    if (editorElement) {
      // Initially check if the editor is focused
      setIsEditorFocused(document.activeElement === editorElement);

      editorElement.addEventListener('focus', handleFocus);
      editorElement.addEventListener('blur', handleBlur);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('focus', handleFocus);
        editorElement.removeEventListener('blur', handleBlur);
      }
    };
  }, [editor]);

  return { editor, sdk, isLinkFocused, isEditorFocused };
}
