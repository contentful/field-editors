import { EntityLink, ResourceLink } from '@contentful/field-editor-reference';
export declare const getLinkEntityId: (link: EntityLink | ResourceLink<'Contentful:Entry'>) => string;
export declare function truncateTitle(str: string, length: number): string;
