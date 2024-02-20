import { ELEMENT_DEFAULT, getPluginType, getTEditor, TElement } from '@udecode/plate-common';
import { ELEMENT_TABLE } from '@udecode/plate-table';

import { insertNodes, PlateEditor } from '../../internal';

/**
 * Override insertFragment to remove empty paragraph before table.
 */
export const withInsertFragmentTableOverride = (editor: PlateEditor) => {
  const myEditor = getTEditor(editor);

  const upstreamInsertFragment = myEditor.insertFragment;
  myEditor.insertFragment = (fragment) => {
    const insertedTable = fragment.find(
      (n) => (n as TElement).type === getPluginType(editor, ELEMENT_TABLE)
    );

    // Overriding https://github.com/udecode/plate/blob/aa5ad441cb72cfb6704315237c430f9a43570ffe/packages/table/src/withInsertFragmentTable.ts#L159C9-L163C8
    if (insertedTable && fragment.length === 1 && fragment[0].type === ELEMENT_TABLE) {
      // needed to insert as node, otherwise it will be inserted as text
      insertNodes(editor, fragment, {
        removeEmpty: {
          // removes empty paragraph before table
          exclude: [ELEMENT_DEFAULT],
        },
      });
      return;
    } else {
      upstreamInsertFragment(fragment);
    }
  };

  return editor;
};
