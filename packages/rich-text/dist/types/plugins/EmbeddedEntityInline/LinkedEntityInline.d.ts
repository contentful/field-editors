import * as React from 'react';
import { EntryLink } from '@contentful/field-editor-reference';
import { Element, RenderElementProps } from '../../internal/types';
type LinkedEntityInlineProps = {
    element: Element & {
        data: {
            target: EntryLink;
        };
    };
    attributes: Pick<RenderElementProps, 'attributes'>;
    children: Pick<RenderElementProps, 'children'>;
};
export declare function LinkedEntityInline(props: LinkedEntityInlineProps): React.JSX.Element;
export {};
