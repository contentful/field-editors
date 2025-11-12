import React from 'react';
import { EntityLink, ResourceLink } from '@contentful/field-editor-reference';
import { RenderElementProps } from '../../internal';
type LinkedBlockWrapperProps = React.PropsWithChildren<{
    attributes: Pick<RenderElementProps, 'attributes'>;
    card: JSX.Element;
    link: ResourceLink<'Contentful:Entry'> | EntityLink;
}>;
export declare function LinkedBlockWrapper({ attributes, card, children, link }: LinkedBlockWrapperProps): React.JSX.Element;
export {};
