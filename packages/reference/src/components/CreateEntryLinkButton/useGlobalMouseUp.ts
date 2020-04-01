import { useEffect } from 'react';

export const useGlobalMouseUp = (handler: (this: Document, ev: MouseEvent) => unknown) => {
  useEffect(() => {
    document.addEventListener('mouseup', handler);
    return () => document.removeEventListener('mouseup', handler);
  }, [handler]);
};
