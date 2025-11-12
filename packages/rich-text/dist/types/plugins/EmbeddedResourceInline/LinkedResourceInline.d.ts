import React from 'react';
import { ResourceLink } from '@contentful/field-editor-reference';
import { Element, RenderElementProps } from '../../internal';
export type LinkedResourceInlineProps = {
    element: Element & {
        data: {
            target: ResourceLink<'Contentful:Entry'>;
        };
    };
    attributes: Pick<RenderElementProps, 'attributes'>;
    children: Pick<RenderElementProps, 'children'>;
};
export declare function LinkedResourceInline(props: LinkedResourceInlineProps): React.JSX.Element;
