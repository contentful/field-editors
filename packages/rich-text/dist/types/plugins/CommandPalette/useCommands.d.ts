import type { FieldAppSDK } from '@contentful/app-sdk';
import { PlateEditor } from '../../internal/types';
export interface Command {
    id: string;
    thumbnail?: string;
    label: string;
    callback?: () => void;
    asset?: boolean;
}
export interface CommandGroup {
    group: string;
    commands: Command[];
}
export type CommandList = (Command | CommandGroup)[];
export declare function isCommandPromptPluginEnabled(sdk: FieldAppSDK): {
    inlineAllowed: boolean;
    entriesAllowed: boolean;
    assetsAllowed: boolean;
};
export declare const useCommands: (sdk: FieldAppSDK, query: string, editor: PlateEditor) => CommandList;
