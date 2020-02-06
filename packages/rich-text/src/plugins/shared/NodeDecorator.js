import * as React from 'react';
import { NodePropTypes } from './PropTypes';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  paragraph: css({
    'line-height': tokens.lineHeightDefault,
    'margin-bottom': '1.5em'
  }),
  'mark-bold': css({
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
  'ordered-list': {
    margin: '0 0 1.25rem 1.25rem',
    'list-style-type': 'decimal',
    'ordered-list': {
      'list-style-type': 'upper-alpha',
      'unordered-list': {
        'list-style-type': 'lower-roman',
        'unordered-list': {
          'list-style-type': 'lower-alpha'
        }
      }
    },
    paragraph: {
      margin: 0,
      'line-height': tokens.lineHeightDefault
    }
  },
  'unordered-list': {
    margin: '0 0 1.25rem 1.25rem',
    'list-style-type': 'disc',
    'unordered-list': {
      'list-style-type': 'circle',
      'unordered-list': {
        'list-style-type': 'square'
      }
    },
    paragraph: {
      margin: 0,
      'line-height': tokens.lineHeightDefault
    }
  },
  'list-item': css({
    'list-style': 'inherit',
    margin: 0,
    'ordered-list': {
      margin: '0 0 0 1.5rem'
    },
    'unordered-list': {
      margin: '0 0 0 1.5rem'
    }
  }),
  heading: css({
    'font-weight': tokens.fontWeightMedium,
    'line-height': 1.3,
    margin: '0 0 0.75rem 0'
  }),
  'heading-h1': css({
    'font-size': '1.875rem'
  }),
  'heading-h2': css({
    'font-size': '1.5625rem'
  }),
  'heading-h3': css({
    'font-size': '1.375rem'
  }),
  'heading-h4': css({
    'font-size': '1.25rem'
  }),
  'heading-h5': css({
    'font-size': '1.125rem'
  }),
  'heading-h6': css({
    'font-size': '1rem'
  })
};

export default function(Tag, tagProps = {}) {
  const CommonNode = ({ attributes, children, node }) => {
    return (
      <Tag
        className={cx(
          styles[node.type],
          node.type === 'heading' && `heading-${styles[node.tagName]}`
        )}
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
