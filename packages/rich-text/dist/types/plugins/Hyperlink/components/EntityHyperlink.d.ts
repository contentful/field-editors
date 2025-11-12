import * as React from 'react';
import { Link } from '@contentful/app-sdk';
import { Element, RenderElementProps } from '../../../internal/types';
export type HyperlinkElementProps = {
    element: Element & {
        data: {
            target: {
                sys: {
                    id: string;
                    linkType: 'Entry' | 'Asset';
                    type: 'Link';
                };
            };
        };
    };
    target: Link;
    attributes: Pick<RenderElementProps, 'attributes'>;
    children: Pick<RenderElementProps, 'children'>;
    onEntityFetchComplete: VoidFunction;
};
export declare function EntityHyperlink(props: HyperlinkElementProps): React.JSX.Element | null;
