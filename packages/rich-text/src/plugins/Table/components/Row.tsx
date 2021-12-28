import { css } from 'emotion';
import * as React from 'react';
import * as Slate from 'slate-react';
import tokens from '@contentful/f36-tokens';

const style = css`
  border: 1px solid ${tokens.gray400};

  &:hover td {
    background-color: transparent !important;
  }
`;

export const Row = (props: Slate.RenderElementProps) => (
  <tr {...props.attributes} className={style}>
    {props.children}
  </tr>
);
