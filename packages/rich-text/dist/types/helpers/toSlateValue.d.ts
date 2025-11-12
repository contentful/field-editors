import { Document } from '@contentful/rich-text-types';
import { Element } from '../internal/types';
/**
 * Converts a Contentful rich text document to the corresponding slate editor
 * value
 */
export declare const toSlateValue: (doc?: Document) => Element[];
