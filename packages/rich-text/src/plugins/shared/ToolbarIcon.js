import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { css, cx } from 'emotion';
import { Button, Tooltip } from '@contentful/f36-components';
import tokens from '@contentful/forma-36-tokens';

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
    testId: PropTypes.string,
  };

  handleClick = (event) => {
    event.preventDefault();
    this.props.onToggle(event);
  };

  render() {
    const { title, testId, isActive, children, className, disabled = false } = this.props;

    const button = (
      <Button
        className={cx(styles.button, className)}
        isDisabled={disabled}
        onClick={this.handleClick}
        testId={testId}
        variant={isActive ? 'secondary' : 'transparent'}
        size="small">
        {children}
      </Button>
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
