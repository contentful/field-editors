import { PlatePlugin } from '../../internal/types';
/**
 * A command palette plugin (aka slash commands)
 *
 * How does it work?
 * * When the user presses the slash key, the editor will show a command palette
 * * When the user presses a key, the command palette will show the command suggestions
 * * When the user presses enter, the command palette will execute the command
 * * When the user presses escape, the command palette will hide
 * * When the user presses a letter, number, or space, the command palette will show the command suggestions
 * * When the user presses backspace, the command palette will remove the last character from the command string
 */
export declare const createCommandPalettePlugin: () => PlatePlugin;
