import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { TableHeaderCell } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { useSelected } from 'slate-react';

import { RenderElementProps } from '../../../internal/types';
import { TableActions } from './TableActions';

const style = css`
  background-clip: padding-box;
  background-color: ${tokens.gray200};
  border: 1px solid ${tokens.gray400};
  border-collapse: collapse;
  padding: 10px 12px;
  font-weight: ${tokens.fontWeightNormal};
  text-align: left;
  min-width: 48px;
  position: relative;

  div:last-child {
    margin-bottom: 0;
  }
`;

export const HeaderCell = (props: RenderElementProps) => {
  const isSelected = useSelected();

  return (
    <th
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      // FIXME: figure out what is going wrong with type here
      // @ts-expect-error
      {...(props.element.data as TableHeaderCell['data'])}
      className={style}
    >
      {isSelected && <TableActions />}
      {props.children}
    </th>
  );
};
