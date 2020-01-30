import HtmlSerializer from 'slate-html-serializer';
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';

/**
 * Tags to block types mapping
 */
const BLOCK_TAGS = {
  p: BLOCKS.PARAGRAPH,
  ul: BLOCKS.UL_LIST,
  ol: BLOCKS.OL_LIST,
  blockquote: BLOCKS.QUOTE,
  hr: BLOCKS.HR,
  h1: BLOCKS.HEADING_1,
  h2: BLOCKS.HEADING_2,
  h3: BLOCKS.HEADING_3,
  h4: BLOCKS.HEADING_4,
  h5: BLOCKS.HEADING_5,
  h6: BLOCKS.HEADING_6
};

/**
 * tags to marks types mapping
 */
const MARK_TAGS = {
  strong: MARKS.BOLD,
  b: MARKS.BOLD,
  em: MARKS.ITALIC,
  i: MARKS.ITALIC,
  u: MARKS.UNDERLINE,
  code: MARKS.CODE
};

const isGoogleWrapper = el =>
  el.tagName.toLowerCase() === 'b' && el.id.startsWith('docs-internal-guid-');

const isGoogleBold = el => {
  return el.style.fontWeight === '700';
};

const isGoogleItalic = el => {
  return el.style.fontStyle === 'italic';
};

const isGoogleUnderline = el => {
  return el.style.textDecoration === 'underline';
};

const gDocsRules = {
  deserialize(el, next) {
    const isFromGoogleDocs = !!el.ownerDocument.querySelector('[id*=docs-internal-guid-]');

    if (!isFromGoogleDocs) {
      return;
    }
    if (isGoogleWrapper(el)) {
      return next(el.childNodes);
    }

    /**
     * Google Docs represent marks with css styles applied to SPAN
     * instead of html tags.
     * */
    if (el.tagName.toLowerCase() === 'span') {
      const marks = [];
      if (isGoogleBold(el)) {
        marks.push(MARKS.BOLD);
      }
      if (isGoogleItalic(el)) {
        marks.push(MARKS.ITALIC);
      }
      if (isGoogleUnderline(el)) {
        marks.push(MARKS.UNDERLINE);
      }

      const textNode = {
        object: 'text',
        leaves: [
          {
            object: 'leaf',
            text: el.textContent,
            marks: marks.map(type => ({ object: 'mark', type }))
          }
        ]
      };

      return textNode;
    }
  }
};

const listItems = {
  deserialize(el, next) {
    /** list-items in Contentful's schema must have blocks as direct children */
    if (el.tagName.toLowerCase() === 'li') {
      let childNodes = next(el.childNodes);

      childNodes = childNodes.map(node => {
        if (node.object === 'text') {
          return {
            object: 'block',
            type: BLOCKS.PARAGRAPH,
            nodes: [node]
          };
        } else {
          return node;
        }
      });

      return {
        object: 'block',
        type: BLOCKS.LIST_ITEM,
        nodes: childNodes
      };
    }
  }
};

const links = {
  deserialize(el, next) {
    if (el.tagName.toLowerCase() === 'a') {
      // we only support links with href,
      // if href is not defined, we should serialize as text
      if (el.getAttribute('href')) {
        return {
          object: 'inline',
          type: INLINES.HYPERLINK,
          nodes: next(el.childNodes),
          data: {
            uri: el.getAttribute('href')
          }
        };
      } else {
        return next(el.childNodes);
      }
    }
  }
};

const macOSTrailingBreak = {
  deserialize(el, _next) {
    if (el.tagName.toLowerCase() === 'br' && el.classList.contains('Apple-interchange-newline')) {
      return null;
    }
  }
};

const marks = {
  deserialize(el, next) {
    const mark = MARK_TAGS[el.tagName.toLowerCase()];
    if (mark) {
      return {
        object: 'mark',
        type: mark,
        nodes: next(el.childNodes)
      };
    }
  }
};

const blocks = {
  deserialize(el, next) {
    const block = BLOCK_TAGS[el.tagName.toLowerCase()];
    if (block) {
      const childNodes = next(el.childNodes);

      return {
        object: 'block',
        type: block,
        nodes: childNodes.length > 0 ? childNodes : [{ object: 'text' }]
      };
    }
  }
};

const RULES = [gDocsRules, listItems, links, macOSTrailingBreak, marks, blocks];

export const create = () => {
  return new HtmlSerializer({
    rules: RULES
  });
};
