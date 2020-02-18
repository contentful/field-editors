import { detect as detectBrowser } from 'detect-browser';

const browser = detectBrowser();
const isIE = !!browser && browser.name === 'ie';
const isEdge = !!browser && browser.name === 'ie';

export const SUPPORTS_STICKY_TOOLBAR = !isIE;
export const SUPPORTS_NATIVE_SLATE_HYPERLINKS = !isIE && !isEdge;
