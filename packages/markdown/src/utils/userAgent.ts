import get from 'lodash/get';

const userAgent = get(window, 'navigator.userAgent', '');
const platform = get(window, 'navigator.platform', '');

let ctrlKey = 'Ctrl';

const tests = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore ignore missing MSStream
  ios: /(iphone os|ipad|iphone|ipod)/i.test(userAgent) && !window.MSStream,
};

if (tests.ios || /mac(68k|ppc|intel)/i.test(platform)) {
  ctrlKey = 'Cmd';
}

export function getCtrlKey() {
  return ctrlKey;
}
