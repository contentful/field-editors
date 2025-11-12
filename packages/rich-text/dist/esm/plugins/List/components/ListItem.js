import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
const style = css`
  margin: 0;
  list-style: inherit;
  margin-top: ${tokens.spacingXs};
  direction: inherit;

  ol,
  ul {
    margin: 0 0 0 ${tokens.spacingL};
  }
`;
export function ListItem(props) {
    const align = props.element.data?.align;
    const inlineStyle = align ? {
        textAlign: align
    } : undefined;
    return /*#__PURE__*/ React.createElement("li", {
        ...props.attributes,
        className: style,
        style: inlineStyle
    }, props.children);
}
