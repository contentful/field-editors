import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { useSelected } from 'slate-react';
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
export const Cell = (props)=>{
    const isSelected = useSelected();
    return /*#__PURE__*/ React.createElement("td", {
        ...props.attributes,
        ...props.element.data,
        className: style
    }, isSelected && /*#__PURE__*/ React.createElement(TableActions, null), props.children);
};
