import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { TableCell } from '@contentful/rich-text-types';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { TableActions } from './TableActions';

const style = css`
  border: 1px solid ${tokens.gray400};
  border-collapse: collapse;
  padding: 10px 12px;
  min-width: 48px;
  position: relative;

  div:last-child {
    margin-bottom: 0;
  }
`;

export const Cell = (props: Slate.RenderElementProps) => {
  const isSelected = Slate.useSelected();

  return (
    <td
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      {...(props.element.data as TableCell['data'])}
      className={style}>
      {isSelected && <TableActions />}
      {props.children}
    </td>
  );
};
