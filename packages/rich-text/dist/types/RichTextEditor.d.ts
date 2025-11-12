import * as React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import * as Contentful from '@contentful/rich-text-types';
import { RichTextTrackingActionHandler } from './plugins/Tracking';
type RichTextProps = {
    sdk: FieldAppSDK;
    isInitiallyDisabled: boolean;
    onAction?: RichTextTrackingActionHandler;
    restrictedMarks?: string[];
    minHeight?: string | number;
    maxHeight?: string | number;
    value?: Contentful.Document;
    isDisabled?: boolean;
    isToolbarHidden?: boolean;
    actionsDisabled?: boolean;
    /**
     * @deprecated Use `sdk.field.onValueChanged` instead
     */
    onChange?: (doc: Contentful.Document) => unknown;
    withCharValidation?: boolean;
};
type ConnectedRichTextProps = {
    sdk: FieldAppSDK;
    onAction?: RichTextTrackingActionHandler;
    onChange?: (doc: Contentful.Document) => unknown;
    restrictedMarks?: string[];
    minHeight?: string | number;
    maxHeight?: string | number;
    value?: Contentful.Document;
    isDisabled?: boolean;
    isToolbarHidden?: boolean;
    actionsDisabled?: boolean;
    stickyToolbarOffset?: number;
    withCharValidation?: boolean;
};
export declare const ConnectedRichTextEditor: (props: ConnectedRichTextProps) => React.JSX.Element;
declare const RichTextEditor: (props: RichTextProps) => React.JSX.Element;
export default RichTextEditor;
