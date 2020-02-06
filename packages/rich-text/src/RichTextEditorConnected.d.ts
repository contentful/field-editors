/// <reference types="react" />
import { FieldAPI } from '@contentful/field-editor-shared';
export interface RichTextEditorProps {
    /**
     * is the field disabled initially
     */
    isInitiallyDisabled: boolean;
    field: FieldAPI;
}
export declare function RichTextEditor(): JSX.Element;
