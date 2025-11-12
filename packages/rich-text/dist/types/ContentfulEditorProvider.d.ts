/// <reference types="react" />
import { FieldAppSDK } from '@contentful/app-sdk';
export declare function getContentfulEditorId(sdk: FieldAppSDK): string;
export declare const editorContext: import("react").Context<string>;
export declare const ContentfulEditorIdProvider: import("react").Provider<string>;
export declare function useContentfulEditorId(id?: string): string;
export declare function useContentfulEditor(id?: string): import("./internal").PlateEditor;
export declare function useContentfulEditorRef(id?: string): import("./internal").PlateEditor;
