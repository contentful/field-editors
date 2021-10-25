import React, { Component } from 'react';
import { cx, css } from 'emotion';

export interface InViewportProps {
  offset?: number;
  onOverflowTop?: Function;
  onOverflowRight?: Function;
  onOverflowBottom?: Function;
  onOverflowLeft?: Function;
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

const throttle = (delay = 200, fn: Function) => {
  let lastCall = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const throttleExec = (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args); // eslint-disable-line
  };
  return throttleExec;
};

const defaultProps: Partial<InViewportProps> = {
  testId: 'cf-ui-in-viewport',
  offset: 0,
};

const isBrowser = typeof window !== 'undefined';

export class InViewport extends Component<InViewportProps> {
  static defaultProps = defaultProps;

  tGetDomPosition: EventListenerOrEventListenerObject | null = null;
  nodeRef: HTMLDivElement | null = null;
  lastOverflowAt: string | null = null;

  tOnOverflowTop = this.props.onOverflowTop && throttle(100, this.props.onOverflowTop);
  tOnOverflowBottom = this.props.onOverflowBottom && throttle(100, this.props.onOverflowBottom);
  tOnOverflowRight = this.props.onOverflowRight && throttle(100, this.props.onOverflowRight);
  tOnOverflowLeft = this.props.onOverflowLeft && throttle(100, this.props.onOverflowLeft);

  componentDidMount() {
    this.getDomPosition();
    this.bindEventListeners();
  }

  componentDidUpdate() {
    this.getDomPosition();
  }

  componentWillUnmount() {
    if (isBrowser && this.tGetDomPosition) {
      window.removeEventListener('scroll', this.tGetDomPosition, true);
      window.removeEventListener('resize', this.tGetDomPosition);
    }
  }

  getDomPosition = () => {
    if (isBrowser && this.nodeRef) {
      const html = document.documentElement;
      const boundingClientRect = this.nodeRef.getBoundingClientRect();
      const windowWidth = window.innerWidth || html.clientWidth;
      const windowHeight = window.innerHeight || html.clientHeight;
      this.handleOverflow(boundingClientRect, windowWidth, windowHeight);
    }
  };

  bindEventListeners = () => {
    this.tGetDomPosition = throttle(600, this.getDomPosition);
    if (isBrowser && this.tGetDomPosition) {
      window.addEventListener('scroll', this.tGetDomPosition, true);
      window.addEventListener('resize', this.tGetDomPosition);
    }
  };

  handleOverflow = (
    { top, left, bottom, right }: ClientRect | DOMRect,
    windowWidth: number,
    windowHeight: number
  ) => {
    const { offset } = this.props;
    const topThreshold = 0 - offset!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const leftThreshold = 0 - offset!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const rightThreshold = windowWidth + offset!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const bottomThreshold = windowHeight + offset!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (top + right + bottom + left !== 0) {
      if (top < topThreshold && this.lastOverflowAt !== 'bottom') {
        this.lastOverflowAt = 'top';
        this.tOnOverflowTop && this.tOnOverflowTop();
      } else if (left < leftThreshold && this.lastOverflowAt !== 'right') {
        this.lastOverflowAt = 'left';
        this.tOnOverflowLeft && this.tOnOverflowLeft();
      } else if (bottom > bottomThreshold && this.lastOverflowAt !== 'top') {
        this.lastOverflowAt = 'bottom';
        this.tOnOverflowBottom && this.tOnOverflowBottom();
      } else if (right > rightThreshold && this.lastOverflowAt !== 'left') {
        this.lastOverflowAt = 'right';
        this.tOnOverflowRight && this.tOnOverflowRight();
      }
    }
  };

  render() {
    const {
      className,
      children,
      testId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onOverflowBottom,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onOverflowLeft,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onOverflowRight,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onOverflowTop,
      ...otherProps
    } = this.props;

    const classNames = cx(css({ display: 'inline-block' }), className);

    return (
      <div
        ref={(ref) => {
          this.nodeRef = ref;
        }}
        className={classNames}
        data-test-id={testId}
        {...otherProps}>
        {children}
      </div>
    );
  }
}
