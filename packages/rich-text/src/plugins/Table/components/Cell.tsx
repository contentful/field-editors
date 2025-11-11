import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { TableCell } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { useSelected } from 'slate-react';

import { RenderElementProps } from '../../../internal/types';
import { TableActions } from './TableActions';

const style = css`
  border: 1px solid ${tokens.gray400};
  border-collapse: collapse;
  padding: 10px 12px;
  min-width: 48px;
  position: relative;
  vertical-align: top;

  div:last-child {
    margin-bottom: 0;
  }
`;

export const Cell = (props: RenderElementProps) => {
  const isSelected = useSelected();
  return (
    <td
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      // FIXME: figure out what is going wrong with type here
      // @ts-expect-error
      {...(props.element.data as TableCell['data'])}
      className={style}
    >
      {isSelected && <TableActions />}
      {props.children}
    </td>
  );
};
