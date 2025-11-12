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

const checkmarkListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      top: 0;
      color: ${tokens.green600};
      font-weight: bold;
      font-size: 1.1em;
    }
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
    const listStyle = (props.element as any).data?.listStyle as string | undefined;
    const isCheckmarkList = listStyle === 'none';
    const inlineStyle =
      listStyle && !isCheckmarkList
        ? { listStyleType: listStyle as React.CSSProperties['listStyleType'] }
        : undefined;

    return (
      <Tag
        {...props.attributes}
        className={cx(baseStyle, isCheckmarkList ? checkmarkListStyle : styles[block])}
        style={inlineStyle}
      >
        {props.children}
      </Tag>
    );
  };
}

export const ListUL = createList('ul', BLOCKS.UL_LIST);
export const ListOL = createList('ol', BLOCKS.OL_LIST);
