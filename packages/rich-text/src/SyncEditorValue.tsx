import * as React from 'react';

import * as Contentful from '@contentful/rich-text-types';
import { usePlateActions } from '@udecode/plate-core';
import equal from 'fast-deep-equal';

import { createOnChangeCallback } from './helpers/callbacks';
import { usePlateSelectors } from './internal/hooks';
import { withoutNormalizing } from './internal/misc';
import { isNode, getEndPoint } from './internal/queries';
import { select } from './internal/transforms';
import { PlateEditor, Node, Value } from './internal/types';

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
  incomingValue?: Value;
  onChange?: (doc: Contentful.Document) => unknown;
};

/**
 * A void component that's responsible for keeping the editor
 * state in sync with incoming changes (aka. external updates)
 *
 * This component is a hack to workaround the limitation of Plate v17+
 * where we can no longer access the editor instance outside the Plate
 * provider.
 */
export const SyncEditorValue = ({ incomingValue, onChange }: SyncEditorStateProps) => {
  const editor = usePlateSelectors().editor();
  const setEditorOnChange = usePlateActions().onChange();

  React.useEffect(() => {
    const cb = createOnChangeCallback(onChange);

    setEditorOnChange({
      fn: (document) => {
        console.log(editor.operations);
        // Skip irrelevant events e.g. mouse selection
        const operations = editor?.operations.filter((op) => {
          return op.type !== 'set_selection';
        });

        if (operations.length === 0) {
          return;
        }

        cb(document);
      },
    });
  }, [editor, onChange, setEditorOnChange]);

  // Cache latest editor value to avoid unnecessary updates
  const lastIncomingValue = React.useRef(incomingValue);

  React.useEffect(() => {
    if (equal(lastIncomingValue.current, incomingValue)) {
      return;
    }

    lastIncomingValue.current = incomingValue;
    setEditorContent(editor, incomingValue);
  }, [editor, incomingValue]);

  return null;
};
