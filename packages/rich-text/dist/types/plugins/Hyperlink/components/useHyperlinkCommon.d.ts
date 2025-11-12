import { FieldAppSDK } from '@contentful/app-sdk';
export declare function useHyperlinkCommon(element: any): {
    editor: import("../../../internal").PlateEditor;
    sdk: FieldAppSDK;
    isLinkFocused: boolean | undefined;
    pathToElement: import("slate").Path | undefined;
    isEditorFocused: boolean;
};
