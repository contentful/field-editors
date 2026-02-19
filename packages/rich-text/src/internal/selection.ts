import { getText } from './queries';
import type { PlateEditor, Path } from './types';

export function getSelectionElementPath(editor: PlateEditor): Path | null {
  const selection = editor.selection;
  if (!selection) return null;

  const focusPath = selection.focus.path;
  // Slate selection focus path usually points to a text node (e.g. [0, 0]).
  // For "replace empty paragraph" behaviors we need the containing element path (e.g. [0]).
  return focusPath.length > 0 ? (focusPath.slice(0, -1) as Path) : (focusPath as Path);
}

export function isEmptyTextContainer(editor: PlateEditor, elementPath: Path): boolean {
  return getText(editor, elementPath).length === 0;
}
