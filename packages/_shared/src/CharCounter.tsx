import React from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css, cx } from 'emotion';

interface CharCounterProps {
  value?: string;
  checkConstraint: (n: number) => boolean;
}

const styles = {
  invalid: css({
    color: tokens.colorRedBase,
  }),
};

export function CharCounter(props: CharCounterProps) {
  let count = 0;
  if (props.value) {
    count = props.value.length;
  }
  const valid = count === 0 || props.checkConstraint(count);
  return (
    <span
      data-status-code={valid ? null : 'invalid-size'}
      className={cx({
        [styles.invalid]: !valid,
      })}>
      {count} characters
    </span>
  );
}
