import * as React from 'react';
import { Link } from '@contentful/app-sdk';
import { Element, RenderElementProps } from '../../../internal/types';
export type ResourceHyperlinkProps = {
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
    target: Link;
    attributes: Pick<RenderElementProps, 'attributes'>;
    children: Pick<RenderElementProps, 'children'>;
};
export declare function ResourceHyperlink(props: ResourceHyperlinkProps): React.JSX.Element | null;
