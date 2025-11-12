import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor } from '../../internal/types';
export type TextAlignment = 'left' | 'center' | 'right';
export declare const ALIGNABLE_BLOCKS: BLOCKS[];
/**
 * Check if a block type supports alignment
 */
export declare function isAlignableBlock(nodeType: string): boolean;
/**
 * Get the current alignment of the selected block
 */
export declare function getAlignment(editor: PlateEditor): TextAlignment | null;
/**
 * Check if a specific alignment is currently active
 */
export declare function isAlignmentActive(editor: PlateEditor, alignment: TextAlignment): boolean;
/**
 * Set the alignment for the selected block(s)
 */
export declare function setAlignment(editor: PlateEditor, alignment: TextAlignment): void;
