import React, { Component } from 'react';
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

interface ToolbarButtonProps {
  onClick: React.MouseEventHandler;
  isActive?: boolean;
  isDisabled?: boolean;
  children: any;
  title: string;
  className?: string;
  testId?: string;
}

export class ToolbarButton extends Component<ToolbarButtonProps> {
  handleClick = (event) => {
    event.preventDefault();
    this.props.onClick(event);
  };

  render() {
    const { title, testId, isActive, children, className, isDisabled = false } = this.props;

    const button = (
      <Button
        className={cx(styles.button, className)}
        isDisabled={isDisabled}
        startIcon={children}
        onClick={this.handleClick}
        testId={testId}
        variant={isActive ? 'secondary' : 'transparent'}
        size="small"
      />
    );

    if (title) {
      return (
        <Tooltip className={styles.tooltip} placement="bottom" content={title}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
}
