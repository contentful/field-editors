/// <reference types="lodash" />
import { Document } from '@contentful/rich-text-types';
export declare const createOnChangeCallback: (handler?: ((value: Document) => void) | undefined) => import("lodash").DebouncedFunc<(document: unknown) => void>;
