import { PlateEditor, NodeEntry, Node } from '../../internal/types';
export declare function insertTableAndFocusFirstCell(editor: PlateEditor): void;
export declare function isTableActive(editor: PlateEditor): boolean;
export declare function isTableHeaderEnabled(editor: PlateEditor): boolean;
export declare function replaceEmptyParagraphWithTable(editor: PlateEditor): void;
/**
 * Returns the number of cells in a given row vs the table width
 *
 * Note: We should only get different table rows cell counts in between
 * normalization cycles.
 */
export declare const getNoOfMissingTableCellsInRow: (editor: PlateEditor, rowEntry: NodeEntry) => number;
export declare const createEmptyTableCells: (count: number) => Node[];
export declare const isNotEmpty: (_: PlateEditor, entry: NodeEntry) => boolean;
export declare const isTable: (node: Node) => boolean;
