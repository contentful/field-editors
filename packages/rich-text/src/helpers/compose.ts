export function compose(...fns: Function[]) {
  return fns.reduceRight(
    (prevFn, nextFn) => (...args: unknown[]) => nextFn(prevFn(...args)),
    (value: unknown) => value
  );
}
