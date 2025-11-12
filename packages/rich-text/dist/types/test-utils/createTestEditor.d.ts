import { FieldAppSDK } from '@contentful/app-sdk';
import { PlateEditor } from '../internal';
import { PlatePlugin } from '../internal/types';
import { RichTextTrackingActionHandler } from '../plugins/Tracking';
export declare const createTestEditor: (options: {
    input?: any;
    sdk?: FieldAppSDK;
    trackingHandler?: RichTextTrackingActionHandler;
    plugins?: PlatePlugin[];
}) => {
    editor: PlateEditor;
    normalize: () => void;
};
