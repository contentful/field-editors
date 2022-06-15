import { sanitizeSheets } from './sanitizeSheets';

/**
 * Remove all <style> tags
 */
const stripStyleTags = (doc: Document): Document => {
  doc.querySelectorAll('style').forEach((e) => {
    e.remove();
  });

  return doc;
};

const transformers = [stripStyleTags, sanitizeSheets];

export const sanitizeHTML = (html: string): string => {
  // Parse the HTML string and pipe it through our transformers
  const doc = transformers.reduce(
    (value, cb) => cb(value),
    new DOMParser().parseFromString(html, 'text/html')
  );

  return (
    doc.body.innerHTML
      // .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/(<(a|p)[^]+?<\/\2)|(^|>)\s+|\s+(?=<|$)/g, '$1$3') // Remove whitespace between tags, except for <a> and <p> https://stackoverflow.com/a/40026669/18118136
      .replace(/(.*)<div.*>(<table.*<\/table>)<\/div>(.*)/g, '$1$2$3')
  ); // remove div containers from tables
};
