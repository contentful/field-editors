import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu } from '@contentful/f36-components';
import { css, cx } from 'emotion';
import tokens from '@contentful/f36-tokens';

const styles = {
  root: css({
    fontWeight: tokens.fontWeightDemiBold,
    lineHeight: 1.5,
  }),
  h1: css({
    fontSize: '1.625rem',
  }),
  h2: css({
    fontSize: '1.4375rem',
  }),
  h3: css({
    fontSize: '1.25rem',
  }),
  h4: css({
    fontSize: '1.125rem',
  }),
  h5: css({
    fontSize: '1rem',
  }),
  h6: css({
    fontSize: '0.875rem',
  }),
};

// Necessary because we can't use kebab-case for style identifiers.
const getStyleForType = (type) => type.replace('heading-', 'h');

export default class ToolbarDropdownListItem extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
    children: PropTypes.node,
  };

  handleClick = (event) => {
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
      <Menu.Item
        label={title}
        isInitiallyFocused={isActive}
        data-test-id={`toolbar-toggle-${type}`}
        className={cx(styles.root, styles[getStyleForType(type)])}
        onClick={this.handleClick}>
        {children}
      </Menu.Item>
    );
  }
}
