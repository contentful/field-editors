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

type Replacer = (innerHTML: string) => string;

// Attention: Order is important
const transformers = [stripStyleTags, sanitizeSheets, stripMetaTags, sanitizeAnchors];

function removeTableWrappers(table: Element): void {
  const parent = table.parentElement;

  if (parent && parent.tagName === 'DIV' && parent.children.length === 1) {
    parent.replaceWith(table);
    removeTableWrappers(table);
  }
}

export const sanitizeHTML = (html: string): string => {
  // Parse the HTML string and pipe it through our transformers
  const doc = transformers.reduce(
    (value, cb) => cb(value),
    new DOMParser().parseFromString(html, 'text/html')
  );

  const replacers: Replacer[] = [
    // remove whitespaces between some tags, as this can lead to unwanted behaviour:
    // - table -> empty table cells
    // - list -> leading whitespaces
    (innerHtml) =>
      innerHtml.replace(
        /<(\/)?(table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)(.*)>\s+<(\/)?(table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g,
        '<$1$2$3><$4$5'
      ),
    // remove empty elements before the ending block element tag
    (innerHtml) =>
      innerHtml.replace(
        /(?:<[^>^/]*>)\s*(?:<\/[^>]*>)<\/(div|p|table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g,
        '</$1'
      ),
    // remove whitespaces before the ending block element tag
    (innerHTML) =>
      innerHTML.replace(
        /\s*<\/(div|p|table|thead|tbody|tr|td|th|caption|col|colgroup|ol|ul|li)/g,
        '</$1'
      ),
  ];

  let previous: string;
  do {
    // save previous first before doing modifications
    previous = doc.body.innerHTML;

    doc.body.innerHTML = replacers.reduce(
      (innerHTML, replacer) => replacer(innerHTML),
      doc.body.innerHTML
    );
  } while (doc.body.innerHTML !== previous);

  // Removing the div container wrappers from tables
  // The div container including attributes and possible linebreaks inside wil be removed
  // TODO: can be removed with plate >= 20
  doc.querySelectorAll('table').forEach(removeTableWrappers);

  return doc.body.innerHTML;
};
