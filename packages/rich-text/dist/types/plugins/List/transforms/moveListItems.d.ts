import { EditorNodesOptions, PlateEditor } from '../../../internal/types';
export type MoveListItemsOptions = {
    increase?: boolean;
    at?: EditorNodesOptions['at'];
};
export declare const moveListItems: (editor: PlateEditor, { increase, at }?: MoveListItemsOptions) => void;
