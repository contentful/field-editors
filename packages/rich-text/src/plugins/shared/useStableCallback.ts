import { useRef, useCallback, useLayoutEffect } from 'react';

/**
 * A userland implementation of useEvent RFC
 *
 * See: https://github.com/reactjs/rfcs/pull/220
 */
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T) => {
  const callbackRef = useRef(callback);

  // Makes sure the callbackRef points to the latest `callback` props
  // The useLayoutEffect is here for concurrent safety. It has the
  // disadvantage of not being able to use the result callback during
  // the render but that's Ok.
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // The stable callback that won't change
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};
