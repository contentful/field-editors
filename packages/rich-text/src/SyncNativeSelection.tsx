import * as React from 'react';

import { useEditorSelector } from 'platejs/react';

import { PlateEditor } from './internal/types';
import { syncSelectionFromDOM } from './plugins/createSelectionSyncPlugin';

/** Must precede PlateContent so its layout effect runs before Slate restores the DOM caret. */
export function SyncNativeSelection({ editor }: { editor: PlateEditor }) {
  // Track internal selection changes as well as parent renders. Otherwise the
  // previous commit could look like an intentional selection change on a click.
  const selection = useEditorSelector((current) => current.selection, []);
  const lastSelection = React.useRef(selection);

  React.useLayoutEffect(() => {
    // The browser can move its caret on mouse-down before Slate processes it.
    // Only adopt it when the model hasn't changed: editing, undo/redo and
    // deliberate programmatic selections must retain priority.
    // Slate only restores the DOM caret while focused. An unfocused card can
    // intentionally retain a model selection beside an old browser caret.
    if (editor.api.isFocused() && lastSelection.current === editor.selection) {
      syncSelectionFromDOM(editor);
    }
    lastSelection.current = editor.selection;
  });

  return null;
}
