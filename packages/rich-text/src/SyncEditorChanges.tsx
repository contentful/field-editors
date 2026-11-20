import * as React from 'react';

import equal from 'fast-deep-equal';

import { usePlateEditorRef } from './internal/hooks';
import { setEditorValue } from './internal/transforms';
import { PlateEditor, Value } from './internal/types';

export type SyncEditorStateProps = {
  incomingValue?: Value;
  externalReset?: number;
  onValueApplied: () => void;
};

/** Applies external field updates to the existing editor instance. */
export const SyncEditorChanges = ({
  incomingValue,
  externalReset = 0,
  onValueApplied,
}: SyncEditorStateProps) => {
  const editor = usePlateEditorRef() as PlateEditor;
  const lastUpdate = React.useRef({ incomingValue, externalReset });

  React.useEffect(() => {
    // Local edits can diverge before an external update repeats the previous value.
    if (
      lastUpdate.current.externalReset === externalReset &&
      equal(lastUpdate.current.incomingValue, incomingValue)
    ) {
      return;
    }

    lastUpdate.current = { incomingValue, externalReset };
    if (!equal(editor.children, incomingValue)) {
      setEditorValue(editor, incomingValue);
    }
    onValueApplied();
  }, [editor, incomingValue, externalReset, onValueApplied]);

  return null;
};
