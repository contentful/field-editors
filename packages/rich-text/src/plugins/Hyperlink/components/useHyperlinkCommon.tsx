import { FieldAppSDK } from '@contentful/app-sdk';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { findNodePath, isChildPath } from '../../../internal/queries';
import { useSdkContext } from '../../../SdkProvider';

export function useHyperlinkCommon(element) {
  const editor = useContentfulEditor();
  const sdk: FieldAppSDK = useSdkContext();
  const focus = editor.selection?.focus;
  const pathToElement = findNodePath(editor, element);
  const isLinkFocused = pathToElement && focus && isChildPath(focus.path, pathToElement);

  return { editor, sdk, isLinkFocused, pathToElement };
}
