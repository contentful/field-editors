import {
  BaseListPlugin,
  withDeleteForwardList,
  withDeleteFragmentList,
  withNormalizeList,
} from '@platejs/list-classic';
import { KEYS } from 'platejs';
import { getEditorPlugin } from 'platejs';

import type { PlateEditor } from './types/editor';

export * from '@platejs/list-classic';
export { createListPlugin } from './pluginFactories';
export const ELEMENT_UL = KEYS.ulClassic;
export const ELEMENT_OL = KEYS.olClassic;
export const ELEMENT_LI = KEYS.li;
export const ELEMENT_LIC = KEYS.lic;
export const deleteForwardList = (
  editor: PlateEditor,
  _deleteForward: PlateEditor['deleteForward'],
  unit: Parameters<PlateEditor['deleteForward']>[0],
) => {
  let handled = true;
  const context = getEditorPlugin(editor, BaseListPlugin);
  withDeleteForwardList({
    ...context,
    tf: {
      ...context.tf,
      deleteForward: () => {
        handled = false;
      },
    },
  }).transforms!.deleteForward!(unit);
  return handled;
};
export const deleteFragmentList = (editor: PlateEditor) => {
  let handled = true;
  const context = getEditorPlugin(editor, BaseListPlugin);
  withDeleteFragmentList({
    ...context,
    tf: {
      ...context.tf,
      deleteFragment: () => {
        handled = false;
      },
    },
  }).transforms!.deleteFragment!();
  return handled;
};
export const normalizeList = (
  editor: PlateEditor,
  options: { validLiChildrenTypes: readonly string[] },
) => {
  const context = getEditorPlugin(editor, BaseListPlugin);
  return withNormalizeList({
    ...context,
    getOptions: () => ({
      ...context.getOptions(),
      validLiChildrenTypes: [...options.validLiChildrenTypes],
    }),
  }).transforms!.normalizeNode!;
};
