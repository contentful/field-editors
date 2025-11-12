import React from 'react';
import { Element, RenderElementProps } from '../../internal';
export type LinkedResourceBlockProps = {
    element: Element & {
        data: {
            target: {
                sys: {
                    urn: string;
                    linkType: 'Contentful:Entry';
                    type: 'ResourceLink';
                };
            };
        };
    };
    attributes: Pick<RenderElementProps, 'attributes'>;
    children: Pick<RenderElementProps, 'children'>;
};
export declare function LinkedResourceBlock(props: LinkedResourceBlockProps): React.JSX.Element;
