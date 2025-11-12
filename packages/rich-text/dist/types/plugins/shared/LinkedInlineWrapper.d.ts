import * as React from 'react';
import { EntryLink, ResourceLink } from '@contentful/field-editor-reference';
import { RenderElementProps } from '../../internal/types';
type LinkedInlineWrapperProps = React.PropsWithChildren<{
    attributes: Pick<RenderElementProps, 'attributes'>;
    card: JSX.Element;
    link: ResourceLink<'Contentful:Entry'> | EntryLink;
}>;
export declare function LinkedInlineWrapper({ attributes, card, children, link, }: LinkedInlineWrapperProps): React.JSX.Element;
export {};
