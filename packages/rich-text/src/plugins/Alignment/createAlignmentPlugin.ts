import { PlatePlugin } from '../../internal/types';

/**
 * Alignment plugin - provides text alignment functionality
 * This is not a traditional Plate plugin since alignment is a property
 * of existing block elements rather than a new element type.
 * The actual alignment logic is handled through the alignment utilities.
 */
export const createAlignmentPlugin = (): PlatePlugin => {
  return {
    key: 'alignment',
    // This plugin doesn't need to register any specific behavior
    // as alignment is handled through node.data properties
  } as PlatePlugin;
};
