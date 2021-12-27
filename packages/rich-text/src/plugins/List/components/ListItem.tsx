import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';

const style = css`
  margin: 0;
  list-style: inherit;
  ol,
  ul {
    margin: 0 0 0 ${tokens.spacingL};
  }
`;

export function ListItem(props: Slate.RenderElementProps) {
  return (
    <li {...props.attributes} className={style}>
      {props.children}
    </li>
  );
}
