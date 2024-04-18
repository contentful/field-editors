import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { css, cx } from 'emotion';
import { ValidationType } from 'types';

interface CharCounterProps {
  value?: string;
  checkConstraint: (n: number) => boolean;
  constraints: ValidationType;
}

const styles = {
  invalid: css({
    color: tokens.red600,
  }),
};

export function CharCounter(props: CharCounterProps) {
  const { constraints, value, checkConstraint } = props;
  let count = 0;
  if (value) {
    count = value.length;
  }
  const valid = count === 0 || checkConstraint(count);

  return (
    <span
      data-status-code={valid ? null : 'invalid-size'}
      data-test-id="cf-ui-char-counter"
      className={cx({
        [styles.invalid]: !valid,
      })}
    >
      {constraints.type === 'min' ? `${count}` : `${count} / ${constraints.max}`}
    </span>
  );
}
