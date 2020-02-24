import { detect as detectBrowser } from 'detect-browser';

const browser = detectBrowser();
const isEdge = !!browser && browser.name === 'ie';

// TODO: Test whether this is still relevant with latest Edge or at least do
//  so after upgrading Slate.js to see if still relevant at all.
export const SUPPORTS_NATIVE_SLATE_HYPERLINKS = !isEdge;
