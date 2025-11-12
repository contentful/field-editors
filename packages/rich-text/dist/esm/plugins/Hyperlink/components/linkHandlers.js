import { Notification } from '@contentful/f36-components';
import { unwrapLink } from '../../../helpers/editor';
import { addOrEditLink } from '../HyperlinkModal';
export const handleEditLink = (editor, sdk, pathToElement)=>{
    if (!editor || !pathToElement) return;
    addOrEditLink(editor, sdk, editor.tracking.onViewportAction, pathToElement);
};
export const handleRemoveLink = (editor)=>{
    unwrapLink(editor);
};
export const handleCopyLink = async (uri)=>{
    if (uri) {
        try {
            await navigator.clipboard.writeText(uri);
            Notification.success('Successfully copied URL to clipboard');
        } catch (error) {
            Notification.error('Failed to copy URL to clipboard');
        }
    }
};
