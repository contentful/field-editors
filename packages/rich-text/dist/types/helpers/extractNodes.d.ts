import { PlateEditor, Node, Path } from '../internal/types';
/**
 * It filters out all paragraphs and headings from a path and convert them into paragraphs.
 */
export declare function extractParagraphs(editor: PlateEditor, path: Path): Node[];
