import { useState, useEffect } from 'react';

export const useAnchorNode = () => {
  const [selection, setSelection] = useState<Node | null>(null);

  useEffect(() => {
    const cb = () => {
      setSelection(window.getSelection()?.anchorNode || null);
    };
    window.addEventListener('mouseup', cb);
    window.addEventListener('keyup', cb);

    return () => {
      window.removeEventListener('mouseup', cb);
      window.removeEventListener('keyup', cb);
    };
  }, []);

  return selection;
};
