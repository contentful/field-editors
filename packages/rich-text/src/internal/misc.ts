import * as p from '@udecode/plate-core';
import { StoreApiGet } from '@udecode/zustood';
import * as s from 'slate';

import type { Value, PlateEditor, Location, PlatePlugin } from './types';

export type CreatePlateEditorOptions = p.CreatePlateEditorOptions<Value, PlateEditor>;
export const createPlateEditor = (options: CreatePlateEditorOptions = {}) => {
  return p.createPlateEditor<Value, PlateEditor>(options);
};

export const withoutNormalizing = (editor: PlateEditor, fn: () => boolean | void) => {
  return p.withoutNormalizing(editor, fn);
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
  opts = { exactMatch: false, suppressThrow: false }
): s.BasePoint | null | undefined => {
  return p.toSlatePoint(editor, domPoint, opts);
};

export const mockPlugin = (plugin?: Partial<PlatePlugin> | undefined) => {
  return p.mockPlugin(
    // TODO check if there is a way around this ugly casting
    plugin as unknown as
      | Partial<p.PlatePlugin<p.AnyObject, p.Value, p.PlateEditor<p.Value>>>
      | undefined
  );
};

export const getPlateSelectors = (
  id?: string | undefined
): StoreApiGet<p.PlateStoreState<Value, PlateEditor>, {}> => {
  return p.getPlateSelectors(id);
};
