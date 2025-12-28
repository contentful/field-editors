import * as React from 'react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

import { Portal } from '@contentful/f36-utils';
import { useEditorEffect, useEditorState } from '@handlewithcare/react-prosemirror';

export function LinkPopover() {
  const [linkElement, setLinkElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const state = useEditorState();

  const linkMark = state.schema.marks.link.isInSet(state.selection.$anchor.marks());
  const isOpen = linkElement !== null;

  /**
   * FIXME: We can't use Forma's Popover directly here but it would be great if
   * Forma could export a standalone usePopper hook so we could reduce duplication
   * and improve maintainability.
   */
  const { styles, attributes } = usePopper(linkElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [1, 4],
        },
      },
      {
        name: 'preventOverflow',
        enabled: true,
        options: {
          mainAxis: true,
        },
      },
      {
        name: 'flip',
        enabled: true,
      },
    ],
  });

  useEditorEffect(
    (view) => {
      if (!linkMark || !state.selection.empty) {
        setLinkElement(null);
        return;
      }

      const anchor = state.selection.anchor;
      const { node } = view.domAtPos(anchor);
      const linkEl = node.parentElement;

      if (linkEl && linkEl.tagName === 'A') {
        setLinkElement(linkEl);
      } else {
        setLinkElement(null);
      }
    },
    [linkMark, state.selection.anchor, state.selection.empty],
  );

  if (!state.selection.empty) return null;
  if (!linkMark || !linkElement || !isOpen) return null;

  return (
    <Portal>
      <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        Hello world
      </div>
    </Portal>
  );
}
