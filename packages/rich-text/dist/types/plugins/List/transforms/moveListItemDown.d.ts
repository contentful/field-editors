import { NodeEntry, PlateEditor } from '../../../internal/types';
export interface MoveListItemDownOptions {
    list: NodeEntry;
    listItem: NodeEntry;
}
export declare const moveListItemDown: (editor: PlateEditor, { list, listItem }: MoveListItemDownOptions) => void;
