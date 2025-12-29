export const lazyHandler = <T extends (...args: any[]) => any>(handler: () => T) => {
  let handle: T | undefined;

  return (...args: Parameters<T>): ReturnType<T> => {
    if (!handle) {
      handle = handler();
    }

    return handle(...args);
  };
};

export const invariant = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};
