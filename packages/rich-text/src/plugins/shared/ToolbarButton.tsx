import * as React from 'react';

import { IconButton } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css, cx } from '@emotion/css';

const styles = {
  button: css({
    height: '30px',
    width: '30px',
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),

  tooltip: css({
    zIndex: Number(tokens.zIndexTooltip),
    pointerEvents: 'none',
  }),
};

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  children: React.ReactElement;
  title: string;
  className?: string;
  testId?: string;
}

export function ToolbarButton(props: ToolbarButtonProps) {
  const { title, testId, isActive, children, className, isDisabled = false } = props;
  const pointerTriggeredRef = React.useRef(false);

  const handlePointerDown = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || event.button !== 0) {
        return;
      }
      event.preventDefault();
      pointerTriggeredRef.current = true;
      props.onClick();
    },
    [isDisabled, props],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (pointerTriggeredRef.current) {
        pointerTriggeredRef.current = false;
        return;
      }
      event.preventDefault();
      props.onClick();
    },
    [props],
  );

  return (
    <IconButton
      className={cx(styles.button, className)}
      isDisabled={isDisabled}
      onMouseDown={handlePointerDown}
      onClick={handleClick}
      testId={testId}
      variant={isActive ? 'secondary' : 'transparent'}
      size="small"
      icon={children}
      aria-label={title}
      withTooltip={!!title}
      tooltipProps={{
        className: styles.tooltip,
        usePortal: true,
        placement: 'bottom',
        content: title,
      }}
    />
  );
}
