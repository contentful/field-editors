export const isMac =
  typeof navigator != 'undefined' ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false;
