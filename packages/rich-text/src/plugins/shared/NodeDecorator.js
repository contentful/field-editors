import * as React from 'react';
import { NodePropTypes } from './PropTypes';
import { css, cx } from 'emotion';
import { camelCase } from 'lodash-es';
import tokens from '@contentful/forma-36-tokens';

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
  orderedList: {
    margin: '0 0 1.25rem 1.25rem',
    'list-style-type': 'decimal',
    orderedList: {
      'list-style-type': 'upper-alpha',
      unorderedList: {
        'list-style-type': 'lower-roman',
        unorderedList: {
          'list-style-type': 'lower-alpha'
        }
      }
    },
    paragraph: {
      margin: 0,
      'line-height': tokens.lineHeightDefault
    }
  },
  unorderedList: {
    margin: '0 0 1.25rem 1.25rem',
    'list-style-type': 'disc',
    unorderedList: {
      'list-style-type': 'circle',
      unorderedList: {
        'list-style-type': 'square'
      }
    },
    paragraph: {
      margin: 0,
      'line-height': tokens.lineHeightDefault
    }
  },
  listItem: css({
    'list-style': 'inherit',
    margin: 0,
    orderedList: {
      margin: '0 0 0 1.5rem'
    },
    unorderedList: {
      margin: '0 0 0 1.5rem'
    }
  }),
  heading: css({
    'font-weight': tokens.fontWeightMedium,
    'line-height': 1.3,
    margin: '0 0 0.75rem 0'
  }),
  h1Heading: css({
    'font-size': '1.875rem'
  }),
  h2Heading: css({
    'font-size': '1.5625rem'
  }),
  h3Heading: css({
    'font-size': '1.375rem'
  }),
  h4Heading: css({
    'font-size': '1.25rem'
  }),
  h5Heading: css({
    'font-size': '1.125rem'
  }),
  h6Heading: css({
    'font-size': '1rem'
  })
};

export default function(Tag, tagProps = {}) {
  const CommonNode = ({ attributes, children, node }) => {
    return (
      <Tag
        className={cx(
          styles[camelCase(node.type)],
          node.type === 'heading' && styles[node.tagName] + 'Heading'
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
