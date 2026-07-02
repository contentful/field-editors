import * as React from 'react';

import { t } from '@lingui/core/macro';

import { ValidationType } from './types';

interface CharValidationProps {
  constraints: ValidationType;
}

export function CharValidation(props: CharValidationProps) {
  const { constraints } = props;

  if (constraints.type === 'max') {
    const { max } = constraints;
    return (
      <span>
        {t({
          id: 'FieldEditors.Shared.CharValidation.MaximumConstraint',
          message: `Maximum ${max} characters`,
        })}
      </span>
    );
  } else if (constraints.type === 'min') {
    const { min } = constraints;
    return (
      <span>
        {t({
          id: 'FieldEditors.Shared.CharValidation.MinimumConstraint',
          message: `Requires at least ${min} characters`,
        })}
      </span>
    );
  } else {
    const { max, min } = constraints;
    return (
      <span>
        {t({
          id: 'FieldEditors.Shared.CharValidation.MinMaxConstraint',
          message: `Requires between ${min} and ${max} characters`,
        })}
      </span>
    );
  }
}
