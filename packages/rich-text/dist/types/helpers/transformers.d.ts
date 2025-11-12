import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { PlateEditor, NodeEntry } from '../internal/types';
export declare const transformRemove: (editor: PlateEditor, [, path]: NodeEntry) => void;
export declare const transformParagraphs: (editor: PlateEditor, entry: NodeEntry) => void;
export declare const transformUnwrap: (editor: PlateEditor, [, path]: NodeEntry) => void;
export declare const transformWrapIn: (type: BLOCKS | INLINES) => (editor: PlateEditor, [, path]: NodeEntry) => void;
export declare const transformLift: (editor: PlateEditor, [, path]: NodeEntry) => void;
