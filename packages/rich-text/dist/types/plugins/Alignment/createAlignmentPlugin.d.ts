import { PlatePlugin } from '../../internal/types';
/**
 * Alignment plugin - provides text alignment functionality
 * This is not a traditional Plate plugin since alignment is a property
 * of existing block elements rather than a new element type.
 * The actual alignment logic is handled through the alignment utilities.
 */
export declare const createAlignmentPlugin: () => PlatePlugin;
