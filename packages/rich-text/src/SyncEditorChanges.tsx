import * as React from 'react';

import equal from 'fast-deep-equal';

import { usePlateEditorRef } from './internal/hooks';
import { setEditorValue } from './internal/transforms';
import { PlateEditor, Value } from './internal/types';

/**
 * A hook responsible for keeping the editor state in sync with incoming
 * changes (aka. external updates
 */
const useAcceptIncomingChanges = (incomingValue: Value | undefined, onValueApplied: () => void) => {
  const editor = usePlateEditorRef() as PlateEditor;

  // Cache latest editor value to avoid unnecessary updates
  const lastIncomingValue = React.useRef(incomingValue);

  React.useEffect(() => {
    if (equal(lastIncomingValue.current, incomingValue)) {
      return;
    }

    lastIncomingValue.current = incomingValue;
    setEditorValue(editor, incomingValue);
    onValueApplied();
  }, [editor, incomingValue, onValueApplied]);
};

export type SyncEditorStateProps = {
  incomingValue?: Value;
  onValueApplied: () => void;
};

/** Applies external field updates to the existing editor instance. */
export const SyncEditorChanges = ({ incomingValue, onValueApplied }: SyncEditorStateProps) => {
  useAcceptIncomingChanges(incomingValue, onValueApplied);

  return null;
};
