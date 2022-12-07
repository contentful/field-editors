/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
// @ts-nocheck
import {
  EditorNodesOptions,
  getNodeEntries,
  getPluginType,
  PlateEditor,
} from '@udecode/plate-core';
import { isListNested, ELEMENT_LIC, getListItemEntry, moveListItemUp } from '@udecode/plate-list';
import { Editor, Path, PathRef } from 'slate';

import { moveListItemDown } from './moveListItemDown';

export type MoveListItemsOptions = {
  increase?: boolean;
  at?: EditorNodesOptions['at'];
};

export const moveListItems = (
  editor: PlateEditor,
  { increase = true, at = editor.selection ?? undefined }: MoveListItemsOptions = {}
) => {
  const _nodes = getNodeEntries(editor, {
    at,
    match: {
      type: getPluginType(editor, ELEMENT_LIC),
    },
  });

  // Get the selected lic
  const lics = Array.from(_nodes);

  if (!lics.length) return;

  const highestLicPaths: Path[] = [];
  const highestLicPathRefs: PathRef[] = [];

  // Filter out the nested lic, we just need to move the highest ones
  lics.forEach((lic) => {
    const licPath = lic[1];
    const liPath = Path.parent(licPath);

    const isAncestor = highestLicPaths.some((path) => {
      const highestLiPath = Path.parent(path);

      return Path.isAncestor(highestLiPath, liPath);
    });
    if (!isAncestor) {
      highestLicPaths.push(licPath);
      highestLicPathRefs.push(Editor.pathRef(editor, licPath));
    }
  });

  const licPathRefsToMove = increase ? highestLicPathRefs : highestLicPathRefs.reverse();

  Editor.withoutNormalizing(editor, () => {
    licPathRefsToMove.forEach((licPathRef) => {
      const licPath = licPathRef.unref();
      if (!licPath) return;

      const liEntry = getListItemEntry(editor, { at: licPath });

      if (!liEntry) {
        return;
      }

      if (increase) {
        moveListItemDown(editor, liEntry);
      } else if (isListNested(editor, liEntry.list[1])) {
        moveListItemUp(editor, liEntry);
      }
    });
  });
};
