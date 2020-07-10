import noop from 'lodash/noop';
import { Action } from '../types';
import { useEffect, useRef, useState } from 'react';

type OnAction = (action: Action) => void;

/**
 * Intercept "rendered" event to count rendered entities cards.
 * Once the expected number of events is counted (i.e. all cards are rendered), forward the event further.
 */
export function useMultipleReferenceLoadTracking(
  onAction?: OnAction
): [OnAction | undefined, (count: number) => void] {
  const [rendered, setRendered] = useState(false);
  const countRef = useRef({ toRender: -1, rendered: 0 });

  useEffect(() => {
    if (rendered && onAction) {
      onAction({ type: 'rendered' });
    }
  }, [rendered]);

  if (!onAction) {
    return [onAction, noop];
  }

  function modifiedOnAction(action: Action) {
    if (action.type === 'rendered') {
      countRef.current.rendered += 1;
      if (countRef.current.rendered === countRef.current.toRender) {
        setRendered(true);
      }
      return;
    }

    return onAction!(action);
  }

  function setItemsToLoadCount(count: number) {
    if (countRef.current.toRender === -1) {
      countRef.current.toRender = count;
    }
  }

  return [modifiedOnAction, setItemsToLoadCount];
}
