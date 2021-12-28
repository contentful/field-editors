import { css } from 'emotion';
import * as React from 'react';
import * as Slate from 'slate-react';
import tokens from '@contentful/f36-tokens';

const style = css`
  margin-bottom: 1.5em;
  border-collapse: collapse;
  border-radius: 5px;
  border-style: hidden;
  box-shadow: 0 0 0 1px ${tokens.gray400};
  width: 100%;
  table-layout: fixed;
  overflow: hidden;
`;

export const Table = (props: Slate.RenderElementProps) => (
  <table {...props.attributes} className={style}>
    <tbody>{props.children}</tbody>
  </table>
);
