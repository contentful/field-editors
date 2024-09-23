import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css, cx } from 'emotion';
import * as Slate from 'slate-react';

const baseStyle = css`
  padding: 0;
  margin: 0 0 1.25rem 1.25rem;
  direction: inherit;

  div:first-child {
    margin: 0;
    line-height: ${tokens.lineHeightDefault};
  }
`;

const styles = {
  [BLOCKS.UL_LIST]: css`
    list-style-type: disc;
    ul {
      list-style-type: circle;
      ul {
        list-style-type: square;
      }
    }
  `,
  [BLOCKS.OL_LIST]: css`
    list-style-type: decimal;
    ol {
      list-style-type: upper-alpha;
      ol {
        list-style-type: lower-roman;
        ol {
          list-style-type: lower-alpha;
        }
      }
    }
  `,
};

function createList(Tag, block: BLOCKS) {
  return function List(props: Slate.RenderElementProps) {
    return (
      <Tag {...props.attributes} className={cx(baseStyle, styles[block])}>
        {props.children}
      </Tag>
    );
  };
}

export const ListUL = createList('ul', BLOCKS.UL_LIST);
export const ListOL = createList('ol', BLOCKS.OL_LIST);
