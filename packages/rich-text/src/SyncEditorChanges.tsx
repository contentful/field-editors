import * as React from 'react';

import * as Contentful from '@contentful/rich-text-types';
import { usePlateActions } from '@udecode/plate-common';
import equal from 'fast-deep-equal';

import { createOnChangeCallback } from './helpers/callbacks';
import {
  getEditorSnapshotForDebug,
  logRichTextDebug,
  summarizeRichTextTreeForDebug,
} from './internal/debug';
import { usePlateSelectors } from './internal/hooks';
import { setEditorValue } from './internal/transforms';
import { PlateEditor, Value } from './internal/types';

/**
 * A hook responsible for keeping the editor state in sync with incoming
 * changes (aka. external updates
 */
const useAcceptIncomingChanges = (incomingValue?: Value) => {
  const editor = usePlateSelectors().editor() as PlateEditor;

  // Cache latest editor value to avoid unnecessary updates
  const lastIncomingValue = React.useRef(incomingValue);

  React.useEffect(() => {
    logRichTextDebug('syncIncomingValue:editorAttached', () => ({
      editor: getEditorSnapshotForDebug(editor),
    }));
  }, [editor]);

  React.useEffect(() => {
    if (equal(lastIncomingValue.current, incomingValue)) {
      logRichTextDebug('syncIncomingValue:skippedEqual', () => ({
        editor: getEditorSnapshotForDebug(editor),
        incomingValue: summarizeRichTextTreeForDebug(incomingValue),
      }));
      return;
    }

    logRichTextDebug('syncIncomingValue:applyIncomingValue', () => ({
      editor: getEditorSnapshotForDebug(editor),
      incomingValue: summarizeRichTextTreeForDebug(incomingValue),
      previousIncomingValue: summarizeRichTextTreeForDebug(lastIncomingValue.current),
    }));

    lastIncomingValue.current = incomingValue;
    setEditorValue(editor, incomingValue);
  }, [editor, incomingValue]);
};

/**
 * Attaches a custom onChange callback that
 */
const useOnValueChanged = (onChange?: (doc: Contentful.Document) => unknown) => {
  const editor = usePlateSelectors().editor() as PlateEditor;
  const setEditorOnChange = usePlateActions().onChange();

  React.useEffect(() => {
    const cb = createOnChangeCallback(onChange);

    setEditorOnChange((document) => {
      // Skip irrelevant events e.g. mouse selection
      const operationTypes = editor?.operations.map((op) => op.type) ?? [];
      const operations =
        editor?.operations.filter((op) => {
          return op.type !== 'set_selection';
        }) ?? [];

      if (operations.length === 0) {
        logRichTextDebug('onValueChanged:skippedSelectionOnly', () => ({
          editor: getEditorSnapshotForDebug(editor),
          operationTypes,
        }));
        return;
      }

      logRichTextDebug('onValueChanged:emit', () => ({
        editor: getEditorSnapshotForDebug(editor),
        nonSelectionOperationTypes: operations.map((op) => op.type),
        operationTypes,
        outgoingDocument: summarizeRichTextTreeForDebug(document),
      }));

      cb(document);
    });
  }, [editor, onChange, setEditorOnChange]);
};

export type SyncEditorStateProps = {
  incomingValue?: Value;
  onChange?: (doc: Contentful.Document) => unknown;
};

/**
 * A void component that's responsible for keeping the editor
 * state in sync with incoming changes (aka. external updates) and
 * triggering onChange events.
 *
 * This component is a hack to work around the limitation of Plate v17+
 * where we can no longer access the editor instance outside the Plate
 * provider.
 */
export const SyncEditorChanges = ({ incomingValue, onChange }: SyncEditorStateProps) => {
  useAcceptIncomingChanges(incomingValue);
  useOnValueChanged(onChange);

  return null;
};
