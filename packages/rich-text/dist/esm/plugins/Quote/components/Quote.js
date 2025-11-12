import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
const style = css({
    margin: '0 0 1.3125rem',
    borderLeft: `6px solid ${tokens.gray200}`,
    paddingLeft: '0.875rem',
    fontStyle: 'normal'
});
export function Quote(props) {
    const align = props.element.data?.align;
    const inlineStyle = align ? {
        textAlign: align
    } : undefined;
    return /*#__PURE__*/ React.createElement("blockquote", {
        ...props.attributes,
        className: style,
        style: inlineStyle
    }, props.children);
}
