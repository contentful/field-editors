import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import * as Slate from 'slate-react';

const style = css`
  margin: 0;
  list-style: inherit;
  margin-top: ${tokens.spacingXs};
  direction: inherit;

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
