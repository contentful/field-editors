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
 *    element as a wrapper for an anchor with the same URL
 *    e.g. <h1><a href="...">My link</a></h1>
 *         and <h2><a href="...">is fancy</a></h2>
 *
 * We take approach (a) in here.
 */
export declare const sanitizeAnchors: (doc: Document) => Document;
