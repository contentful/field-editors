import { useCallback, useState } from 'react';
import constate from 'constate';

const [VoidElementsContext, useVoidElements] = constate(() => {
  const [counter, setCounter] = useState(0);
  const add = useCallback(() => setCounter((current) => current + 1), [setCounter]);
  const remove = useCallback(() => setCounter((current) => current - 1), [setCounter]);

  return {
    add,
    remove,
    get isEmpty() {
      return counter === 0;
    }
  };
});

export { VoidElementsContext, useVoidElements };
