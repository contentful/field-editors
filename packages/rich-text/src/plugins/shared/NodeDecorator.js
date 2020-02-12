import * as React from 'react';
import { NodePropTypes } from './PropTypes';
import { css, cx } from 'emotion';
import { camelCase } from 'lodash-es';
import tokens from '@contentful/forma-36-tokens';

const headingCss = {
  'font-weight': tokens.fontWeightMedium,
  'line-height': '1.3',
  margin: `0 0 ${tokens.spacingS}`
};

const styles = {
  paragraph: css({
    'line-height': tokens.lineHeightDefault,
    'margin-bottom': '1.5em'
  }),
  bold: css({
    color: 'inherit',
    'font-weight': tokens.fontWeightDemiBold
  }),
  blockquote: css({
    margin: '0 0 1.3125rem',
    'border-left': `6px solid ${tokens.colorElementLight}`,
    'padding-left': '0.875rem',
    'font-style': 'normal',
    '& a': {
      color: 'inherit'
    }
  }),
  code: css({
    background: tokens.colorElementLight,
    padding: '0px',
    color: tokens.colorTextMid,
    'border-radius': '2px'
  }),
  hr: css({
    border: 'none',
    height: tokens.spacingM,
    background: 'transparent',
    position: 'relative',
    margin: `0 0 ${tokens.spacingL}`,
    '&:after': {
      content: '',
      position: 'absolute',
      width: '100%',
      height: '1px',
      background: tokens.colorElementLight,
      top: '50%'
    },
    '&:selected': {
      '&:after': {
        background: tokens.colorBlueBase,
        '-webkit-box-shadow': `0 0 5px ${tokens.colorBlueBase}`,
        'box-shadow': `0 0 5px ${tokens.colorBlueBase}`
      }
    }
  }),
  textLink: css({
    'font-size': 'inherit'
  }),
  orderedList: css({
    margin: '0 0 1.25rem 1.25rem',
    'list-style-type': 'decimal',
    '[data-test-id="ordered-list"]': {
      'list-style-type': 'upper-alpha',
      '[data-test-id="ordered-list"]': {
        'list-style-type': 'lower-roman',
        '[data-test-id="ordered-list"]': {
          'list-style-type': 'lower-alpha'
        }
      }
    },
    '[data-test-id="paragraph"]': {
      margin: 0,
      'line-height': tokens.lineHeightDefault
    }
  }),
  unorderedList: css({
    margin: '0 0 1.25rem 1.25rem',
    'list-style-type': 'disc',
    '[data-test-id="unordered-list"]': {
      'list-style-type': 'circle',
      '[data-test-id="unordered-list"]': {
        'list-style-type': 'square'
      }
    },
    '[data-test-id="paragraph"]': {
      margin: 0,
      'line-height': tokens.lineHeightDefault
    }
  }),
  listItem: css({
    'list-style': 'inherit',
    margin: 0,
    '[data-test-id="ordered-list"], [data-test-id="unordered-list"]': {
      margin: `0 0 0 ${tokens.spacingL}`
    }
  }),
  heading1: css({
    ...headingCss,
    'font-size': '1.875rem'
  }),
  heading2: css({
    ...headingCss,
    'font-size': '1.5625rem'
  }),
  heading3: css({
    ...headingCss,
    'font-size': '1.375rem'
  }),
  heading4: css({
    ...headingCss,
    'font-size': '1.25rem'
  }),
  heading5: css({
    ...headingCss,
    'font-size': '1.125rem'
  }),
  heading6: css({
    ...headingCss,
    'font-size': '1rem'
  })
};

export default function(Tag, tagProps = {}) {
  const CommonNode = ({ attributes, children, node }) => {
    return (
      <Tag
        className={styles[camelCase(node.type)]}
        data-test-id={node.type}
        {...tagProps}
        {...attributes}>
        {children}
      </Tag>
    );
  };

  CommonNode.displayName = `${Tag}-node`;
  CommonNode.propTypes = NodePropTypes;

  return CommonNode;
}
