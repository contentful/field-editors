import { NavigatorAPI } from '@contentful/app-sdk';
import noop from 'lodash/noop';

/**
 * Allows to observe when the current slide-in navigation slide gets e.g.
 * re-activated after opening another slide on top. This is useful as the sdk
 * does not give full insights into e.g. whether sdk.dialogs.selectSingleEntry()
 * with `withCreate: true` option opens the slide-in navigation to edit the
 * created entry after returning it.
 */
export function watchCurrentSlide(navigator: NavigatorAPI) {
  const onActiveCallbacks = new Set<Function>();
  let wasSlideClosed = false;
  let initialSlideLevel;
  let lastSlideLevel;
  const status = () => ({
    wasClosed: wasSlideClosed,
    isActive: !wasSlideClosed && lastSlideLevel === initialSlideLevel,
  });
  const off = navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
    if (initialSlideLevel === undefined) {
      initialSlideLevel = oldSlideLevel;
    }
    lastSlideLevel = newSlideLevel;
    if (newSlideLevel < initialSlideLevel) {
      wasSlideClosed = true;
      off(); // No more point in watching, slide got closed.
      onActiveCallbacks.clear();
    }
    if (status().isActive && newSlideLevel !== oldSlideLevel) {
      onActiveCallbacks.forEach((cb) => cb());
    }
  });

  /**
   * Call to unsubscribe from navigator events when the watcher is no longer
   * needed.
   */
  function unwatch() {
    off();
    onActiveCallbacks.clear();
  }

  /**
   * Fires immediately when the slide is currently active, or at the point when
   * it becomes active again, if there are slides on top that get closed. Does not
   * fire when the observed slide gets closed, and then re-opened through browser
   * back, as this technically opens a new slide and editor instance.
   */
  function onActive(cb: Function) {
    if (wasSlideClosed) return noop; // Can't re-activate already closed slide.
    if (status().isActive) {
      cb();
    }
    onActiveCallbacks.add(cb);
    return () => onActiveCallbacks.delete(cb);
  }
  return {
    status,
    onActive,
    unwatch,
  };
}
