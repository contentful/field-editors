import * as p from '@udecode/plate-common';
import * as s from 'slate';

import { normalize } from './transforms';
import type { Value, PlateEditor, Location, PlatePlugin } from './types';

export type CreatePlateEditorOptions = Omit<
  p.CreatePlateEditorOptions<Value, PlateEditor>,
  'plugins'
> & {
  plugins?: PlatePlugin[];
};

export const createPlateEditor = (options: CreatePlateEditorOptions = {}) => {
  return p.createPlateEditor<Value, PlateEditor>(
    options as p.CreatePlateEditorOptions<Value, PlateEditor>,
  );
};

/**
 * The only reason for this helper to exist is to run the initial normalization
 * before mounting the Plate editor component which in turn avoids the false
 * trigger of `onChange`.
 *
 * Background:
 *
 * Due to legacy behavior, it's possible to have "valid" RT document (based on
 * the schema from rich-text-types) that doesn't make sense. For example, links
 * with no text nodes?[1]. Solving that requires an initial normalization pass
 * which modifies the slate tree by definition -> triggering onChange.
 *
 * The initial onChange trigger is undesirable as the user may not have touched
 * the RT content yet or the editor is rendered as readonly.
 *
 * Ideally, we should not initialize the editor twice but that's the only
 * way that I could get this to work. Improvements are welcome.
 *
 * [1]: See cypress/e2e/rich-text/.../invalidDocumentNormalizable.js for more
 *      examples.
 */
export const normalizeInitialValue = (
  options: CreatePlateEditorOptions,
  initialValue?: Value,
): Value => {
  const editor = createPlateEditor(options);

  if (initialValue) {
    editor.children = initialValue;
  }

  normalize(editor, { force: true });

  return editor.children;
};

export const focusEditor = (editor: PlateEditor, target?: Location) => {
  p.focusEditor(editor, target);
};

export const blurEditor = (editor: PlateEditor) => {
  p.blurEditor(editor);
};

export const selectEditor = (editor: PlateEditor, opts: p.SelectEditorOptions) => {
  p.selectEditor(editor, opts);
};

export const fromDOMPoint = (
  editor: PlateEditor,
  domPoint: [Node /* DOM Node*/, number],
  opts = { exactMatch: false, suppressThrow: false },
): s.BasePoint | null | undefined => {
  return p.toSlatePoint(editor, domPoint, opts);
};

export const mockPlugin = (plugin?: Partial<PlatePlugin> | undefined) => {
  return p.mockPlugin(
    // TODO check if there is a way around this ugly casting
    plugin as unknown as
      | Partial<p.PlatePlugin<p.AnyObject, p.Value, p.PlateEditor<p.Value>>>
      | undefined,
  );
};
