import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
const styles = {
    [BLOCKS.PARAGRAPH]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
    direction: inherit;
  `
};
export function Paragraph(props) {
    const align = props.element.data?.align;
    const style = align ? {
        textAlign: align
    } : undefined;
    return /*#__PURE__*/ React.createElement("div", {
        ...props.attributes,
        className: styles[BLOCKS.PARAGRAPH],
        style: style
    }, props.children);
}
