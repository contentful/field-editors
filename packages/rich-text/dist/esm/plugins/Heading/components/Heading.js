import * as React from 'react';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css, cx } from 'emotion';
const styles = {
    dropdown: {
        root: css`
      font-weight: ${tokens.fontWeightDemiBold};
    `,
        [BLOCKS.PARAGRAPH]: css`
      font-size: ${tokens.fontSizeL};
    `,
        [BLOCKS.HEADING_1]: css`
      font-size: 1.625rem;
    `,
        [BLOCKS.HEADING_2]: css`
      font-size: 1.4375rem;
    `,
        [BLOCKS.HEADING_3]: css`
      font-size: 1.25rem;
    `,
        [BLOCKS.HEADING_4]: css`
      font-size: 1.125rem;
    `,
        [BLOCKS.HEADING_5]: css`
      font-size: 1rem;
    `,
        [BLOCKS.HEADING_6]: css`
      font-size: 0.875rem;
    `
    },
    headings: {
        root: css`
      font-weight: ${tokens.fontWeightMedium};
      line-height: 1.3;
      margin: 0 0 ${tokens.spacingS};
      direction: inherit;
    `,
        [BLOCKS.HEADING_1]: css`
      font-size: 1.875rem;
    `,
        [BLOCKS.HEADING_2]: css`
      font-size: 1.5625rem;
    `,
        [BLOCKS.HEADING_3]: css`
      font-size: 1.375rem;
    `,
        [BLOCKS.HEADING_4]: css`
      font-size: 1.25rem;
    `,
        [BLOCKS.HEADING_5]: css`
      font-size: 1.125rem;
    `,
        [BLOCKS.HEADING_6]: css`
      font-size: 1rem;
    `
    }
};
function createHeading(Tag, block) {
    return function Heading(props) {
        const align = props.element.data?.align;
        const style = align ? {
            textAlign: align
        } : undefined;
        return /*#__PURE__*/ React.createElement(Tag, {
            ...props.attributes,
            className: cx(styles.headings.root, styles.headings[block]),
            style: style
        }, props.children);
    };
}
export const HeadingComponents = {
    [BLOCKS.HEADING_1]: /*#__PURE__*/ React.memo(createHeading('h1', BLOCKS.HEADING_1)),
    [BLOCKS.HEADING_2]: /*#__PURE__*/ React.memo(createHeading('h2', BLOCKS.HEADING_2)),
    [BLOCKS.HEADING_3]: /*#__PURE__*/ React.memo(createHeading('h3', BLOCKS.HEADING_3)),
    [BLOCKS.HEADING_4]: /*#__PURE__*/ React.memo(createHeading('h4', BLOCKS.HEADING_4)),
    [BLOCKS.HEADING_5]: /*#__PURE__*/ React.memo(createHeading('h5', BLOCKS.HEADING_5)),
    [BLOCKS.HEADING_6]: /*#__PURE__*/ React.memo(createHeading('h6', BLOCKS.HEADING_6))
};
