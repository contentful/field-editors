import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { useSelected } from 'slate-react';
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
export const HeaderCell = (props)=>{
    const isSelected = useSelected();
    return /*#__PURE__*/ React.createElement("th", {
        ...props.attributes,
        ...props.element.data,
        className: style
    }, isSelected && /*#__PURE__*/ React.createElement(TableActions, null), props.children);
};
