import * as React from 'react';

import { css } from 'emotion';
import * as Slate from 'slate-react';

const style = css`
  margin: 0;
  list-style: inherit;
`;

export function ListItem(props: Slate.RenderElementProps) {
  return (
    <li {...props.attributes} className={style}>
      {props.children}
    </li>
  );
}
