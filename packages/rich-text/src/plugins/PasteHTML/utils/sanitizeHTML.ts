import { sanitizeAnchors } from './sanitizeAnchors';
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

/**
 * Remove all <meta /> tags
 */
const stripMetaTags = (doc: Document): Document => {
  doc.querySelectorAll('meta').forEach((el) => el.remove());

  return doc;
};

// Attention: Order is important
const transformers = [stripStyleTags, sanitizeSheets, stripMetaTags, sanitizeAnchors];

export const sanitizeHTML = (html: string): string => {
  // Parse the HTML string and pipe it through our transformers
  const doc = transformers.reduce(
    (value, cb) => cb(value),
    new DOMParser().parseFromString(html, 'text/html')
  );

  let previous: string;
  do {
    // save previous first before doing modifications
    previous = doc.body.innerHTML;
    // Update the body with the cleaned up content
    doc.body.innerHTML = doc.body.innerHTML
      // remove div container from tables
      // capture groups explained:
      // 1. and 3. every content/linebreaks before and after the div container
      // 2. the table inside the container, including content and linebreaks
      // The div container including attributes and possible linebreaks inside wil be removed
      .replace(/(.*\s)?<div.*>\s*(<table(?:.|\s)*<\/table>)\s*<\/div>(.*\s)?/g, '$1$2$3')
      // remove whitespaces between some tags, as this can lead to unwanted behaviour:
      // - table -> empty table cells
      // - list -> leading whitespaces
      .replace(
        /<(\/)?(table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)(.*)>\s+<(\/)?(table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g,
        '<$1$2$3><$4$5'
      )
      // remove empty elements before the ending block element tag
      .replace(
        /(?:<[^>^/]*>)\s*(?:<\/[^>]*>)<\/(div|p|table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g,
        '</$1'
      )
      // remove whitespaces before the ending block element tag
      .replace(/\s*<\/(div|p|table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g, '</$1');
  } while (doc.body.innerHTML !== previous);

  return doc.body.innerHTML;
};
