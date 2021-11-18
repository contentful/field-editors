// "modern" Edge was released at 79.x
const IS_EDGE_LEGACY =
  typeof navigator !== 'undefined' && /Edge?\/(?:[0-6][0-9]|[0-7][0-8])/i.test(navigator.userAgent);

// Native `beforeInput` events don't work well with react on Chrome 75
// and older, Chrome 76+ can use `beforeInput` though.
const IS_CHROME_LEGACY =
  typeof navigator !== 'undefined' &&
  /Chrome?\/(?:[0-7][0-5]|[0-6][0-9])/i.test(navigator.userAgent);

type CustomInputEvent = {
  getTargetRanges?: (() => StaticRange[]) | undefined;
} & InputEvent;

// COMPAT: Firefox/Edge Legacy don't support the `beforeinput` event
// Chrome Legacy doesn't support `beforeinput` correctly
export const HAS_BEFORE_INPUT_SUPPORT =
  !IS_CHROME_LEGACY &&
  !IS_EDGE_LEGACY &&
  // globalThis is undefined in older browsers
  typeof globalThis !== 'undefined' &&
  globalThis.InputEvent &&
  typeof (globalThis.InputEvent.prototype as CustomInputEvent).getTargetRanges === 'function'; // The `getTargetRanges` property isn't recognized.
