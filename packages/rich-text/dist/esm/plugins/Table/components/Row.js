import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
const style = css`
  border: 1px solid ${tokens.gray400};
  border-collapse: collapse;

  &:hover td {
    background-color: transparent !important;
  }
`;
export const Row = (props)=>/*#__PURE__*/ React.createElement("tr", {
        ...props.attributes,
        className: style
    }, props.children);
