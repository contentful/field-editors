import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
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
export const Table = (props)=>{
    return /*#__PURE__*/ React.createElement("div", {
        "data-block-type": BLOCKS.TABLE
    }, /*#__PURE__*/ React.createElement("table", {
        className: style,
        ...props.attributes
    }, /*#__PURE__*/ React.createElement("tbody", null, props.children)));
};
