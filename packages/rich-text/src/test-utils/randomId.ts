/**
 * Used to guarantee a unique editor and plugin keys for tests.
 */
export const randomId = (prefix = '') => {
  return `${prefix}-${(Math.random() + 1).toString(36).substring(10)}`;
};
