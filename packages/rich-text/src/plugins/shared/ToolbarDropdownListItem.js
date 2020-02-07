import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownListItem } from '@contentful/forma-36-react-components';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  root: css({
    button: {
      span: {
        'font-weight': tokens.fontWeightDemiBold
      }
    }
  }),
  h1: css({
    button: {
      span: {
        'font-size': '1.625rem'
      }
    }
  }),
  h2: css({
    button: {
      span: {
        'font-size': '1.4375rem'
      }
    }
  }),
  h3: css({
    button: {
      span: {
        'font-size': '1.25rem'
      }
    }
  }),
  h4: css({
    button: {
      span: {
        'font-size': '1.125rem'
      }
    }
  }),
  h5: css({
    button: {
      span: {
        'font-size': '1rem'
      }
    }
  }),
  h6: css({
    button: {
      span: {
        'font-size': '0.875rem'
      }
    }
  })
};

// Necessary because we can't use kebab-case for style identifiers.
const getStyleForType = type => type.replace('heading-', 'h')

export default class ToolbarDropdownListItem extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
    children: PropTypes.node
  };

  handleMouseDown = event => {
    /*
      We're using the mousedown event rather than onclick because onclick will
      steal the focus.
    */

    event.preventDefault();
    this.props.onToggle(event);
  };

  render() {
    const { isActive, title, type, children } = this.props;
    return (
      <DropdownListItem
        label={title}
        isActive={isActive}
        data-test-id={`toolbar-toggle-${type}`}
        className={cx(styles.root, styles[getStyleForType(type)])}
        onMouseDown={this.handleMouseDown}>
        {children}
      </DropdownListItem>
    );
  }
}
