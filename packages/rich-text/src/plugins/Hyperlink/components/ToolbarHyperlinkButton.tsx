import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { LinkIcon } from '@contentful/f36-icons';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { isLinkActive, unwrapLink } from '../../../helpers/editor';
import { useSdkContext } from '../../../SdkProvider';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { addOrEditLink } from '../HyperlinkModal';

interface ToolbarHyperlinkButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarHyperlinkButton(props: ToolbarHyperlinkButtonProps) {
  const editor = useContentfulEditor();
  const isActive = !!(editor && isLinkActive(editor));
  const sdk: FieldAppSDK = useSdkContext();

  async function handleClick() {
    if (!editor) return;

    if (isActive) {
      unwrapLink(editor);
      editor.tracking.onToolbarAction('unlinkHyperlinks');
    } else {
      addOrEditLink(editor, sdk, editor.tracking.onToolbarAction);
    }
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Hyperlink"
      testId="hyperlink-toolbar-button"
      onClick={handleClick}
      isActive={isActive}
      isDisabled={props.isDisabled}
    >
      <LinkIcon />
    </ToolbarButton>
  );
}
