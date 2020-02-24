import { useEffect } from 'react';

export const useGlobalMouseUp = handler => {
  useEffect(() => {
    document.addEventListener('mouseup', handler);
    return () => document.removeEventListener('mouseup', handler);
  }, [handler]);
};
