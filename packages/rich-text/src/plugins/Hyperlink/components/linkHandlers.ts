import { FieldAppSDK } from '@contentful/app-sdk';
import { Notification } from '@contentful/f36-components';

import { unwrapLink } from '../../../helpers/editor';
import { Path, PlateEditor } from '../../../internal/types';
import { addOrEditLink } from '../HyperlinkModal';

export const handleEditLink = (
  editor: PlateEditor,
  sdk: FieldAppSDK,
  pathToElement: Path | undefined
) => {
  if (!editor || !pathToElement) return;
  addOrEditLink(editor, sdk, editor.tracking.onViewportAction, pathToElement);
};

export const handleRemoveLink = (editor: PlateEditor) => {
  unwrapLink(editor);
};

export const handleCopyLink = async (uri: string | undefined) => {
  if (uri) {
    try {
      await navigator.clipboard.writeText(uri);
      Notification.success('Successfully copied URL to clipboard');
    } catch (error) {
      Notification.error('Failed to copy URL to clipboard');
    }
  }
};
