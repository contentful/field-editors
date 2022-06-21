import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import * as Slate from 'slate-react';

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

export const Table = (props: Slate.RenderElementProps) => {
  return (
    <div data-block-type={BLOCKS.TABLE}>
      <table className={style} {...props.attributes}>
        <tbody>{props.children}</tbody>
      </table>
    </div>
  );
};
