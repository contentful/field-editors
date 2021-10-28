import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { css, cx } from 'emotion';
import { Button, Tooltip } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';

const styles = {
  button: css({
    height: '30px',
    width: '30px',
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),

  tooltip: css({
    zIndex: Number(tokens.zIndexTooltip),
  }),
};

export default class ToolbarIcon extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    children: PropTypes.any.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
    className: PropTypes.string,
  };

  handleClick = (event) => {
    event.preventDefault();
    this.props.onToggle(event);
  };

  render() {
    const { title, type, isActive, children, className, disabled = false } = this.props;

    const button = (
      <Button
        className={cx(styles.button, className)}
        isDisabled={disabled}
        startIcon={children}
        onClick={this.handleClick}
        testId={`toolbar-toggle-${type}`}
        variant={isActive ? 'secondary' : 'transparent'}
        size="small"
      />
    );

    if (title) {
      return (
        <Tooltip className={styles.tooltip} placement="top" content={title}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
}
