import React from 'react';
import { ValidationType } from './types';

interface CharValidationProps {
  constraints: ValidationType;
}

export function CharValidation(props: CharValidationProps) {
  const { constraints } = props;

  if (constraints.type === 'max') {
    return <span>Requires less than {constraints.max} characters</span>;
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
