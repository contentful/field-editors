/* eslint-disable @typescript-eslint/no-use-before-define, @typescript-eslint/no-explicit-any */

import extend from 'lodash/extend';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import max from 'lodash/max';
// eslint-disable-next-line
import isFinite from 'lodash/isFinite';
// eslint-disable-next-line
import forEach from 'lodash/forEach';

function extractTitle(title: string) {
  title = title || '';
  title = title.replace(/^ *('|"|\()*/, '');
  title = title.replace(/('|"|\))* *$/, '');
  return title;
}

function head(text: string) {
  return text.split(' ').shift();
}

function tail(text: string) {
  const segments = text.split(' ');
  segments.shift();
  return segments.join(' ');
}

const PROCESSORS = {
  inline: function (match: any) {
    return {
      match: match[0],
      text: match[1],
      href: head(match[2]),
      title: extractTitle(tail(match[2])),
    };
  },
  ref: function (match: any) {
    return {
      match: match[0],
      text: match[1],
      id: match[2],
    };
  },
  label: function (match: any) {
    return {
      match: match[0],
      id: match[1],
      href: head(match[2]),
      title: extractTitle(tail(match[2])),
    };
  },
};

const REGEXS = {
  inline: /\[([^\r\n[\]]+)]\(([^\r\n)]+)\)/,
  ref: /\[([^\r\n[\]]+)] ?\[([^\r\n[\]]+)]/,
  label: /^ {0,3}\[([^\r\n[\]]+)]:\s+(.+)$/,
};
export const findInline = makeFinder('inline');
export const findRefs = makeFinder('ref');
export const findLabels = makeFinder('label');

export function convertInlineToRef(text: string) {
  let id = findMaxLabelId(text);

  forEach(findInline(text), (inline) => {
    id += 1;
    text = text.replace(inline.match, buildRef(inline, id));
    text += '\n' + buildLabel(inline, id);
  });

  return text;
}

function mergeLabels(text: string): any {
  const byHref: any = {};
  const byOldId: any = {};

  forEach(findLabels(text), (label) => {
    const alreadyAdded = byHref[label.href];
    const current = extend({}, label);

    if (!alreadyAdded) {
      byHref[current.href] = current;
    } else if (hasTitle(current) && !hasTitle(alreadyAdded)) {
      alreadyAdded.title = current.title;
    }

    byOldId[current.id] = alreadyAdded || current;
  });

  return {
    byHref: byHref,
    byOldId: byOldId,
  };
}

export function rewriteRefs(text: string) {
  const merged = mergeLabels(text);
  const hrefToRefId: any = {};
  const labels: any[] = [];
  const rewrites: any[] = [];
  let i = 1;

  // 1. compose list of labels with new ids, in order
  forEach(findRefs(text), (ref) => {
    const oldLabel = merged.byOldId[ref.id];
    if (!oldLabel) {
      return;
    }
    const href = oldLabel.href;
    let newRefId = hrefToRefId[href];

    if (!newRefId) {
      hrefToRefId[href] = newRefId = i;
      i += 1;
      labels.push(extend({ newId: newRefId }, oldLabel));
    }

    // 1b. prepare rewrites to be applied, with new label ids
    rewrites.push(extend({ newId: newRefId }, ref));
  });

  // 2. remove all labels!
  forEach(findLabels(text), (label) => {
    text = text.replace(label.match, '');
  });

  // 3. remove whitespace from the end of text
  text = text.replace(/[\r\n\s]*$/, '');
  text += '\n\n';

  // 4. apply rewrites
  forEach(rewrites, (ref) => {
    text = text.replace(ref.match, buildRef(ref, ref.newId));
  });

  // 5. print new labels at the end of text
  forEach(labels, (label) => {
    text += '\n' + buildLabel(label, label.newId);
  });

  return text;
}

/**
 * Finding stuff
 */

function makeFinder(type: 'inline' | 'ref' | 'label'): (text: string) => Array<any> {
  return (text: string) => findAll(text, type).map(PROCESSORS[type] as any);
}

export function findMaxLabelId(textOrLabels: any): number {
  if (isString(textOrLabels)) {
    textOrLabels = findLabels(textOrLabels);
  }

  const ids = textOrLabels
    .map((x: any) => x.id)
    .map((x: any) => parseInt(x, 10))
    .filter((x: any) => isFinite(x) && x > 0);

  return ids.length > 0 ? max(ids) || 0 : 0;
}

function findAll(text: string, type: 'inline' | 'ref' | 'label') {
  const flags = 'g' + (type === 'label' ? 'm' : '');
  const matches = [];
  const re = new RegExp(REGEXS[type].source, flags);
  let found = re.exec(text);

  while (found) {
    matches.push(found);
    re.lastIndex = found.index + found[0].length;
    found = re.exec(text);
  }

  return matches;
}

/**
 * Other utilities
 */

function hasTitle(link: { title: string }) {
  return isObject(link) && isString(link.title) && link.title.length > 0;
}

function buildLabel(link: { href: string; title: string }, id: number) {
  let markup = '[' + id + ']: ' + link.href;
  if (hasTitle(link)) {
    markup += ' "' + link.title + '"';
  }
  return markup;
}

function buildRef(link: { text: string }, id: number) {
  return '[' + link.text + '][' + id + ']';
}
