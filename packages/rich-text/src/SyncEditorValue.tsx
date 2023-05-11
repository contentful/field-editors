import * as React from 'react';

import { Document } from '@contentful/rich-text-types';
import equal from 'fast-deep-equal';

import { toSlateValue } from './helpers/toSlateValue';
import { usePlateSelectors } from './internal/hooks';
import { withoutNormalizing } from './internal/misc';
import { isNode, getEndPoint } from './internal/queries';
import { select } from './internal/transforms';
import { PlateEditor, Node } from './internal/types';

/**
 * Plate api doesn't allow to modify (easily) the editor value
 * programmatically after the editor instance is created.
 *
 * This function is inspired by:
 * https://github.com/udecode/plate/issues/1269#issuecomment-1057643622
 */
const setEditorContent = (editor: PlateEditor, nodes?: Node[]): void => {
  // Replaces editor content while keeping change history
  withoutNormalizing(editor, () => {
    const children = [...editor.children];
    children.forEach((node) => editor.apply({ type: 'remove_node', path: [0], node }));

    if (nodes) {
      const nodesArray = isNode(nodes) ? [nodes] : nodes;
      nodesArray.forEach((node, i) => {
        editor.apply({ type: 'insert_node', path: [i], node });
      });
    }

    const point = getEndPoint(editor, []);
    if (point) {
      select(editor, point);
    }
  });
};

export type SyncEditorStateProps = {
  incomingValue?: Document;
};

/**
 * A void component that's responsible for keeping the editor
 * state in sync with incoming changes (aka. external updates)
 *
 * This component is a hack to workaround the limitation of Plate v17+
 * where we can no longer access the editor instance outside the Plate
 * provider.
 */
export const SyncEditorValue = ({ incomingValue }: SyncEditorStateProps) => {
  const editor = usePlateSelectors().editor();

  // Cache latest editor value to avoid unnecessary updates
  const lastIncomingValue = React.useRef(incomingValue);

  React.useEffect(() => {
    if (equal(lastIncomingValue.current, incomingValue)) {
      return;
    }

    lastIncomingValue.current = incomingValue;
    setEditorContent(editor, toSlateValue(incomingValue));
  }, [editor, incomingValue]);

  return null;
};
