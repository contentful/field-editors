import * as React from 'react';

import { Trans } from '@lingui/react';

import { ValidationType } from './types';

interface CharValidationProps {
  constraints: ValidationType;
}

export function CharValidation(props: CharValidationProps) {
  const { constraints } = props;

  if (constraints.type === 'max') {
    return (
      <span>
        <Trans
          id="FieldEditors.Shared.CharValidation.MaxConstraint"
          values={{ max: constraints.max }}
          message="Maximum {max} characters"
        />
      </span>
    );
  } else if (constraints.type === 'min') {
    return (
      <span>
        <Trans
          id="FieldEditors.Shared.CharValidation.MinConstraint"
          values={{ min: constraints.min }}
          message="Requires at least {min} characters"
        />
      </span>
    );
  } else {
    return (
      <span>
        <Trans
          id="FieldEditors.Shared.CharValidation.MinMaxConstraint"
          values={{ max: constraints.max, min: constraints.min }}
          message="Requires between {min} and {max} characters"
        />
      </span>
    );
  }
}
