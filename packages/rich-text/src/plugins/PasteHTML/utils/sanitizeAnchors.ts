const wrapSpaceAround = (el: Element) => {
  const spacer = new Text(' ');
  const parent = el.parentNode;

  if (!parent) {
    return;
  }

  parent.insertBefore(spacer, el);

  if (el.nextSibling) {
    parent.insertBefore(spacer, el.nextSibling);
  }
};

const unwrap = (el: Element) => {
  const parent = el.parentNode;

  if (!parent) {
    return;
  }

  // add a spacer to avoid the content being cramped together after the
  // element is unwrapped
  wrapSpaceAround(el);

  // move all children out of the element
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }

  parent.removeChild(el);
};

/**
 * In HTML it's a valid structure to have a block element inside a link
 *
 * e.g: <a href="..."><h1> My link </h1><h2>is fancy</h2></a>
 *
 * However, that's not supported in Slate. There are generally two ways to
 * handle this:
 *
 * a) Unwrap inner blocks while preserving the content.
 *    e.g. <a href="...">My link is fancy</a>
 *
 * b) Break the link into multiple elements with having each block
 *    element as a wrapper for the an anchor with the same URL
 *    e.g. <h1><a href="...">My link</a></h1>
 *         and <h2><a href="...">is fancy</a></h2>
 *
 * We take approach (a) in here.
 */
export const sanitizeAnchors = (doc: Document): Document => {
  const unsupportedTagSelector = `a :not(${[
    // Bold
    'b',
    'strong',

    // Code
    'code',
    'pre',

    // Italic
    'em',
    'i',

    // Super/subscript
    'sub',
    'sup',

    // Underline
    'u',

    // Other
    'span',
  ].join(',')})`;

  doc.querySelectorAll(unsupportedTagSelector).forEach(unwrap);

  return doc;
};
