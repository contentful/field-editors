import * as React from 'react';

import { ValidationType } from './types';

interface CharValidationProps {
  constraints: ValidationType;
  enabled: boolean;
}

export function CharValidation(props: CharValidationProps) {
  const { constraints, enabled } = props;

  if (!enabled) {
    return null;
  }

  if (constraints.type === 'max') {
    return (
      <span>{constraints.isDefaultConstraint ? '' : `Max. ${constraints.max} characters`}</span>
    );
  } else if (constraints.type === 'min') {
    return <span>Requires at least {constraints.min} characters</span>;
  } else {
    return (
      <span>
        Requires between {constraints.min} and {constraints.max} characters
      </span>
    );
  }
}
